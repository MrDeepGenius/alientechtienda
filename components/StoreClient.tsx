"use client";
import { useEffect, useState } from "react";
import Store from "@/components/Store";

export default function StoreClient() {
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/store")
      .then((r) => r.json())
      .then((d) => setData(d))
      .catch(() => setError("Error al cargar la tienda"));
  }, []);

  if (error) return <main className="min-h-screen grid place-items-center"><p className="text-red-400">{error}</p></main>;
  if (!data) return <main className="min-h-screen grid place-items-center"><p className="text-mut animate-pulse">Cargando...</p></main>;

  return <Store products={data.products} zones={data.zones} settings={data.settings} mp={data.mp} />;
}
