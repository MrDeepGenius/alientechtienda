export default function sitemap() {
  const u = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return [{ url: u, lastModified: new Date() }];
}
