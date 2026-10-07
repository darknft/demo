// Envía a Data Cloud las compras de la tabla `purchases` que aún no se han enviado.
import { isAuthorized, isoDate, json, syncTable } from "../_shared/datacloud.ts";

// Zona horaria de la tienda para calcular la franja horaria
const STORE_TZ = Deno.env.get("STORE_TIMEZONE") ?? "America/El_Salvador";

function getTimeSlot(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: STORE_TZ,
    hour: "numeric",
    minute: "numeric",
    hourCycle: "h23",
  }).formatToParts(date);
  const hour = Number(parts.find((p) => p.type === "hour")!.value);
  const minute = Number(parts.find((p) => p.type === "minute")!.value);
  const h = hour + minute / 60;

  if (h >= 7 && h < 10.5) return "Morning";
  if (h >= 14 && h < 17.5) return "Afternoon";
  if (h >= 18 && h < 21.5) return "Night";
  return "Other";
}

Deno.serve(async (req) => {
  if (!isAuthorized(req)) return json({ success: false, error: "No autorizado" }, 401);

  try {
    const result = await syncTable({
      table: "purchases",
      idColumn: "purchase_id",
      orderColumn: "purchase_date",
      objectName: Deno.env.get("DATACLOUD_PURCHASE_OBJECT") ?? "Purchase",
      // Los nombres de la izquierda deben ser IGUALES a los del esquema .yaml
      toRecord: (p) => ({
        purchaseId: p.purchase_id,
        customerId: p.customer_id,
        purchaseTime: isoDate(p.purchase_date),
        timeSlot: getTimeSlot(new Date(p.purchase_date)),
        productId: p.product_id ?? p.product_name,
        productName: p.product_name,
        totalAmount: Number(p.total_amount ?? 0),
        fulfillmentType: p.fulfillment_type,
        isRewardRedemption: p.is_reward_redemption ?? false,
        pointsRedeemed: p.points_redeemed ?? 0,
      }),
    });
    console.log("sync-purchases OK", result);
    return json({ success: true, ...result });
  } catch (e) {
    console.error("sync-purchases ERROR", e);
    return json({ success: false, error: (e as Error).message }, 500);
  }
});
