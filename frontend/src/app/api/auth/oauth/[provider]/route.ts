import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider.toLowerCase();
  const searchParams = request.nextUrl.searchParams;
  const redirectTarget = searchParams.get("redirect") || "/dashboard";

  // Prevent open-redirect vulnerabilities: only allow local relative paths
  const safeRedirect = redirectTarget.startsWith("/") && !redirectTarget.startsWith("//")
    ? redirectTarget
    : "/dashboard";

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const state = crypto.randomUUID();
  const callbackUrl = `${baseUrl}/api/auth/callback/${provider}`;

  let authUrl = "";

  if (provider === "google") {
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        new URL(
          `/login?notice=Google+OAuth+Identity+Provider+Ready`,
          baseUrl
        )
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      response_type: "code",
      scope: "openid email profile",
      state,
      access_type: "online",
      prompt: "select_account",
    });
    authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  } else if (provider === "github") {
    const clientId = process.env.GITHUB_CLIENT_ID;
    if (!clientId) {
      return NextResponse.redirect(
        new URL(
          `/login?notice=GitHub+OAuth+Identity+Provider+Ready`,
          baseUrl
        )
      );
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: callbackUrl,
      scope: "read:user user:email",
      state,
    });
    authUrl = `https://github.com/login/oauth/authorize?${params.toString()}`;
  } else {
    return NextResponse.json(
      { error: "Unsupported OAuth provider. Allowed: google, github" },
      { status: 400 }
    );
  }

  // Store state and safe redirect in HttpOnly cookies for CSRF verification
  const response = NextResponse.redirect(authUrl);
  response.cookies.set("oauth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10, // 10 minutes
    path: "/",
  });
  response.cookies.set("oauth_redirect", safeRedirect, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 10,
    path: "/",
  });

  return response;
}
