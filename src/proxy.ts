import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale detection + redirect (e.g. "/" -> "/es"). Next 16 calls this file proxy.ts.
export default createMiddleware(routing);

export const config = {
  matcher: "/((?!api|_next|_vercel|.*\\..*).*)",
};
