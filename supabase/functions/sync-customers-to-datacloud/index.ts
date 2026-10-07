// Envía a Data Cloud los clientes de la tabla `customers` nuevos o modificados.
import { isAuthorized, isoDate, json, syncTable } from "../_shared/datacloud.ts";

Deno.serve(async (req) => {
  if (!isAuthorized(req)) return json({ success: false, error: "No autorizado" }, 401);

  try {
    const result = await syncTable({
      table: "customers",
      idColumn: "customer_id",
      orderColumn: "registration_date",
      objectName: Deno.env.get("DATACLOUD_CUSTOMER_OBJECT") ?? "Customer",
      // Los nombres de la izquierda deben ser IGUALES a los del esquema .yaml
      toRecord: (c) => ({
        customerId: c.customer_id,
        firstName: c.first_name,
        lastName: c.last_name,
        email: c.email,
        phone: c.phone,
        city: c.city,
        country: c.country,
        registrationDate: isoDate(c.registration_date),
      }),
    });
    console.log("sync-customers OK", result);
    return json({ success: true, ...result });
  } catch (e) {
    console.error("sync-customers ERROR", e);
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
