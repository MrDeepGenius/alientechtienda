export const money = (n: number) => "$" + Math.round(Number(n) || 0).toLocaleString("es-AR");
// free/pickup = 0 (en Rosario el envío ya está incluido en el precio). percent = % del subtotal con mínimo.
export function calcShipping(sub: number, z: any) {
  if (!z || z.kind !== "percent") return 0;
  return Math.max(Math.round((sub * Number(z.percent)) / 100), Number(z.min_amount || 0));
}
export const STATUS: Record<string, string> = {
  pendiente: "Pendiente", pago_pendiente: "Pago pendiente", pago_confirmado: "Pago confirmado",
  preparando: "Preparando pedido", en_camino: "En camino", entregado: "Entregado", cancelado: "Cancelado" };
