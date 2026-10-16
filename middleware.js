/* Route admin.boye.study → Owner Admin (filesystem index.html would win over vercel.json rewrites). */
import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: ["/", "/index", "/index.html", "/admin", "/admin.html"],
};

export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host !== "admin.boye.study") {
    return next();
  }
  return rewrite(new URL("/admin.html", request.url));
}
