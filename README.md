# ALIENTECH — tienda real (Next.js + Supabase + Vercel)

## 1. Supabase
1. Creá un proyecto en supabase.com.
2. SQL Editor → pegá y ejecutá `supabase/schema.sql` completo (tablas, bucket público `products`, zonas iniciales y funciones de stock). Si ya habías corrido la versión anterior, ejecutá solo el bloque "Etapa 2" del final.
3. Project Settings → API: copiá `Project URL` y la clave `service_role` (privada).

## 2. Local
```
npm install
cp .env.example .env.local   # completá los valores
npm run dev
```
Tienda: http://localhost:3000 · Panel: http://localhost:3000/admin (te pide la clave `ADMIN_PASSWORD`).

## 3. Vercel
1. Subí el proyecto a GitHub → vercel.com → Add New Project → importalo.
2. Cargá las variables de `.env.example` en Settings → Environment Variables.
3. Deploy.

## 4. Dominio propio
Vercel → Project → Settings → Domains → agregá tu dominio y creá en tu proveedor los registros DNS que indica Vercel (A / CNAME). Luego poné ese dominio en `NEXT_PUBLIC_SITE_URL`.

## Primeros pasos en el panel
- Ajustes: WhatsApp, alias, CBU, titular.
- Envíos: Rosario (`free`, $2.000 ya incluidos en tus precios), Gálvez y aledañas (`percent` + mínimo), retiro (`pickup`).
- Productos: cargá fotos, precios y ofertas.

## Seguridad
- La clave `service_role` solo se usa en el servidor. Las tablas tienen RLS activado sin políticas públicas.
- Los precios y el envío se recalculan en el servidor al crear el pedido.
- No se guardan datos de tarjetas (las maneja Mercado Pago).
- El stock se descuenta de forma atómica en la base (no se puede vender de más) y se repone al cancelar un pedido.

## Pagos con tarjeta (Mercado Pago)
Cargá `MP_ACCESS_TOKEN` en Vercel (credenciales de producción de tu cuenta de Mercado Pago) y redeployá: aparece la opción "Tarjetas / Mercado Pago" en el checkout. El webhook `/api/mp/webhook` (se configura solo por pedido) marca el pedido como "Pago confirmado" verificando el pago contra la API de Mercado Pago. Requiere `NEXT_PUBLIC_SITE_URL` con tu dominio https real. Sin token, la opción queda deshabilitada.

## Seguimiento
Los clientes ven el estado en `/pedido` con número de pedido + teléfono. En el panel, cada pedido tiene un campo "Seguimiento / nota de envío" que el cliente ve ahí.
