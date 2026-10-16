/* Route admin.boye.study → Owner Admin.
   cleanUrls serves admin.html at /admin (not /admin.html), and filesystem
   index.html would win over vercel.json host rewrites for "/". */
import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: ["/", "/index", "/index.html"],
};

export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host !== "admin.boye.study") {
    return next();
  }
  return rewrite(new URL("/admin", request.url));
}
