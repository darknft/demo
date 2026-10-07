import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { create, getNumericDate } from "https://deno.land/x/djwt@v2.8/mod.ts";

const CLIENT_ID = Deno.env.get("SALESFORCE_CLIENT_ID")!;
const USERNAME = Deno.env.get("SALESFORCE_USERNAME")!;
const PRIVATE_KEY = Deno.env.get("SALESFORCE_PRIVATE_KEY")!;
const MY_DOMAIN = "https://orgfarm-55e9a75eda-dev-ed.develop.my.salesforce.com";
const OBJECT_NAME = "Purchase";

function getTimeSlot(date: Date): string {
  const hour = date.getUTCHours() - 6;
  const h = hour < 0 ? hour + 24 : hour;

  if (h >= 7 && h < 10.5) return "Morning";
  if (h >= 14 && h < 17.5) return "Afternoon";
  if (h >= 18 && h < 21.5) return "Night";
  return "Other";
}

Deno.serve(async () => {
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: purchases, error } = await supabase
      .from("purchases")
      .select("*")
      .order("purchase_date", { ascending: true });

    if (error) throw error;
    if (!purchases?.length) {
      return new Response(JSON.stringify({ message: "No hay datos" }), { status: 200 });
    }

    const records = purchases.map((p) => ({
      purchaseId: p.purchase_id,
      customerId: p.customer_id,
      purchaseTime: new Date(p.purchase_date).toISOString(),
      timeSlot: getTimeSlot(new Date(p.purchase_date)),
      productId: p.product_id ?? p.product_name,
      productName: p.product_name,
      totalAmount: p.total_amount,
      fulfillmentType: p.fulfillment_type,
      isRewardRedemption: p.is_reward_redemption ?? false,
      pointsRedeemed: p.points_redeemed ?? 0,
    }));

    // --- Autenticación JWT -> Salesforce -> Data Cloud ---
    const privateKey = await crypto.subtle.importKey(
      "pkcs8",
      await pemToArrayBuffer(PRIVATE_KEY),
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["sign"]
    );

    const jwt = await create(
      { alg: "RS256", typ: "JWT" },
      { iss: CLIENT_ID, sub: USERNAME, aud: "https://login.salesforce.com", exp: getNumericDate(300) },
      privateKey
    );

    const sfRes = await fetch("https://login.salesforce.com/services/oauth2/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
        assertion: jwt,
      }),
    });
    if (!sfRes.ok) throw new Error(`SF token: ${await sfRes.text()}`);
    const { access_token: sfToken } = await sfRes.json();

    // Intercambio por token de Data Cloud usando el My Domain
    const dcRes = await fetch(`${MY_DOMAIN}/services/a360/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "urn:salesforce:grant-type:external:cdp",
        subject_token: sfToken,
        subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
      }),
    });
    if (!dcRes.ok) throw new Error(`DC token: ${await dcRes.text()}`);
    const { access_token: dcToken } = await dcRes.json();

    // --- Enviar al proxy Apex (que a su vez llama a Data Cloud internamente) ---
    const apexUrl = `${MY_DOMAIN}/services/apexrest/datacloud-proxy/${OBJECT_NAME}`;

    const ingest = await fetch(apexUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sfToken}`,
        "Content-Type": "application/json",
        "X-DataCloud-Token": dcToken,
      },
      body: JSON.stringify({ data: records }),
    });
    if (!ingest.ok) throw new Error(`Ingest: ${await ingest.text()}`);

    const result = await ingest.json();

    return new Response(
      JSON.stringify({ success: true, recordsSent: records.length, result }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(JSON.stringify({ success: false, error: e.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

async function pemToArrayBuffer(pem: string): Promise<ArrayBuffer> {
  const b64 = pem.replace(/-----[^-]+-----/g, "").replace(/\s/g, "");
  const bin = atob(b64);
  const buf = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
  return buf.buffer;
}