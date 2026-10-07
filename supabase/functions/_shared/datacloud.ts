// Utilidades compartidas: autenticación JWT -> Salesforce -> Data Cloud,
// envío a la Ingestion API (streaming) y sincronización de tablas de Supabase.
import { importPKCS8, SignJWT } from "npm:jose@5";
import { createClient } from "npm:@supabase/supabase-js@2";

const env = (name: string, fallback?: string): string => {
  const v = Deno.env.get(name) ?? fallback;
  if (!v) throw new Error(`Falta el secret ${name}`);
  return v;
};

// ---------------------------------------------------------------------------
// Seguridad: solo quien envíe el header x-sync-secret correcto puede ejecutar
// ---------------------------------------------------------------------------
export function isAuthorized(req: Request): boolean {
  const expected = Deno.env.get("SYNC_SECRET");
  return !!expected && req.headers.get("x-sync-secret") === expected;
}

export function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

// ---------------------------------------------------------------------------
// Autenticación
// ---------------------------------------------------------------------------
export interface DataCloudAuth {
  token: string;
  tenantUrl: string; // https://xxxx.c360a.salesforce.com
}

export async function getDataCloudAuth(): Promise<DataCloudAuth> {
  const clientId = env("SALESFORCE_CLIENT_ID");
  const username = env("SALESFORCE_USERNAME");
  // Acepta la llave con saltos de línea reales o escritos como "\n"
  const pem = env("SALESFORCE_PRIVATE_KEY").replace(/\\n/g, "\n").trim();
  // Developer Edition / producción: login.salesforce.com (no test.salesforce.com)
  const loginUrl = env("SALESFORCE_LOGIN_URL", "https://login.salesforce.com");
  const audience = env("SALESFORCE_JWT_AUDIENCE", "https://login.salesforce.com");

  // Paso 1: JWT firmado con la llave privada -> token de Salesforce
  const key = await importPKCS8(pem, "RS256");
  const assertion = await new SignJWT({})
    .setProtectedHeader({ alg: "RS256" })
    .setIssuer(clientId)
    .setSubject(username)
    .setAudience(audience)
    .setExpirationTime("3m")
    .sign(key);

  const sfRes = await fetch(`${loginUrl}/services/oauth2/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const sfBody = await sfRes.text();
  if (!sfRes.ok) throw new Error(`PASO 1 (login JWT) ${sfRes.status}: ${sfBody}`);
  const sf = JSON.parse(sfBody) as { access_token: string; instance_url: string };

  // Paso 2: intercambio por token de Data Cloud, contra el instance_url (My Domain)
  const dcRes = await fetch(`${sf.instance_url}/services/a360/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:salesforce:grant-type:external:cdp",
      subject_token: sf.access_token,
      subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
    }),
  });
  const dcBody = await dcRes.text();
  if (!dcRes.ok) throw new Error(`PASO 2 (token Data Cloud) ${dcRes.status}: ${dcBody}`);
  const dc = JSON.parse(dcBody) as { access_token: string; instance_url: string };

  // El instance_url de Data Cloud viene sin protocolo (xxxx.c360a.salesforce.com)
  const tenantUrl = dc.instance_url.startsWith("http")
    ? dc.instance_url
    : `https://${dc.instance_url}`;
  return { token: dc.access_token, tenantUrl };
}

// ---------------------------------------------------------------------------
// Envío a la Ingestion API (streaming). Límite: 200 KB por request.
// ---------------------------------------------------------------------------
const MAX_BYTES = 180_000; // margen bajo el límite de 200 KB

function chunkBySize<T>(records: T[]): T[][] {
  const chunks: T[][] = [];
  let current: T[] = [];
  let size = 20; // {"data":[]}
  for (const r of records) {
    const s = new TextEncoder().encode(JSON.stringify(r)).length + 1;
    if (current.length && size + s > MAX_BYTES) {
      chunks.push(current);
      current = [];
      size = 20;
    }
    current.push(r);
    size += s;
  }
  if (current.length) chunks.push(current);
  return chunks;
}

export async function ingest(
  auth: DataCloudAuth,
  objectName: string,
  records: Record<string, unknown>[],
): Promise<number> {
  const source = env("DATACLOUD_CONNECTOR_NAME"); // Source API Name, p. ej. supabase_cafeteria
  const url = `${auth.tenantUrl}/api/v1/ingest/sources/${source}/${objectName}`;
  let requests = 0;
  for (const chunk of chunkBySize(records)) {
    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ data: chunk }),
    });
    const body = await res.text();
    if (!res.ok) throw new Error(`PASO 3 (ingesta ${objectName}) ${res.status}: ${body}`);
    requests++;
  }
  return requests;
}

// ---------------------------------------------------------------------------
// Sincroniza filas pendientes (synced_at IS NULL) de una tabla de Supabase
// ---------------------------------------------------------------------------
export interface SyncConfig {
  table: string;            // tabla de Supabase
  idColumn: string;         // llave primaria en Supabase
  orderColumn: string;      // para enviar en orden cronológico
  objectName: string;       // objeto en el esquema de Data Cloud
  toRecord: (row: Record<string, any>) => Record<string, unknown>;
  batchSize?: number;
}

export async function syncTable(cfg: SyncConfig) {
  const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"));

  const { data: rows, error } = await supabase
    .from(cfg.table)
    .select("*")
    .is("synced_at", null)
    .order(cfg.orderColumn, { ascending: true })
    .limit(cfg.batchSize ?? 1000);
  if (error) throw new Error(`Supabase (${cfg.table}): ${error.message}`);
  if (!rows?.length) return { recordsSent: 0, requests: 0 };

  const records = rows.map(cfg.toRecord);
  const auth = await getDataCloudAuth();
  const requests = await ingest(auth, cfg.objectName, records);

  // Marcar como enviados solo después de que Data Cloud aceptó los datos
  const ids = rows.map((r) => r[cfg.idColumn]);
  const { error: upErr } = await supabase
    .from(cfg.table)
    .update({ synced_at: new Date().toISOString() })
    .in(cfg.idColumn, ids);
  if (upErr) throw new Error(`Supabase al marcar synced_at: ${upErr.message}`);

  return { recordsSent: records.length, requests };
}

// Fecha en formato que exige Data Cloud: yyyy-MM-ddTHH:mm:ss.SSSZ (UTC)
export const isoDate = (v: string | null | undefined) =>
  v ? new Date(v).toISOString() : null;
