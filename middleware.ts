import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the user is authenticated
  const isAuthenticated = !!session
  const isAuthPage = req.nextUrl.pathname === "/signin"
  const isPublicPage =
    req.nextUrl.pathname === "/" || req.nextUrl.pathname === "/privacy" || req.nextUrl.pathname === "/terms"

  // If the user is on an auth page and is already authenticated, redirect to dashboard
  if (isAuthPage && isAuthenticated) {
    return NextResponse.redirect(new URL("/dashboard", req.url))
  }

  // If the user is not authenticated and not on a public page, redirect to signin
  if (!isAuthenticated && !isPublicPage && !isAuthPage) {
    return NextResponse.redirect(new URL("/signin", req.url))
  }

  return res
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
