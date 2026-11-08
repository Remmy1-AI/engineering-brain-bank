/* Host routing:
   - admin.boye.study → Owner Admin
   - forms.boye.study → student contribution portal
   cleanUrls serves *.html at bare paths; filesystem index.html would
   otherwise win over host rewrites for "/". */
import { next, rewrite } from "@vercel/edge";

export const config = {
  matcher: ["/", "/index", "/index.html"],
};

export default function middleware(request) {
  const host = (request.headers.get("host") || "").split(":")[0].toLowerCase();
  if (host === "admin.boye.study") {
    return rewrite(new URL("/admin", request.url));
  }
  if (host === "forms.boye.study") {
    return rewrite(new URL("/forms", request.url));
  }
  return next();
}
