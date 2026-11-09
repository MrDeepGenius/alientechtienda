import { createClient } from "@supabase/supabase-js";
// Solo se usa en el servidor (rutas API y server components).
export const db = () => createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
