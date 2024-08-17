import { authMiddleware, redirectToSignIn } from "@clerk/nextjs";
import { NextResponse } from "next/server";

export default authMiddleware({
  publicRoutes: ["/"],
  afterAuth(auth, req, evt) {
    // Handle users who aren't authenticated
    if (!auth.userId && !auth.isPublicRoute) {
      return redirectToSignIn({ returnBackUrl: req.url });
    }

    // If the user is logged in and trying to access the sign-in page,
    // redirect them to /notes
    if (auth.userId && req.nextUrl.pathname === "/sign-in") {
      const notesUrl = new URL("/notes", req.url);
      return NextResponse.redirect(notesUrl);
    }

    // Allow the user to access the requested route
    return NextResponse.next();
  },
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};