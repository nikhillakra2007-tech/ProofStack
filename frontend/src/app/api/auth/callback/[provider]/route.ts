import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  const provider = params.provider.toLowerCase();
  const searchParams = request.nextUrl.searchParams;

  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const errorParam = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  const host = request.headers.get("host") || "localhost:3000";
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https";
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;

  const savedState = request.cookies.get("oauth_state")?.value;
  const rawRedirect = request.cookies.get("oauth_redirect")?.value || "/dashboard";
  const safeRedirect = rawRedirect.startsWith("/") && !rawRedirect.startsWith("//")
    ? rawRedirect
    : "/dashboard";

  // Check for cancellation or provider error
  if (errorParam) {
    return NextResponse.redirect(
      new URL(
        `/login?error=${encodeURIComponent(
          errorDescription || `Authentication was cancelled or failed by ${provider}.`
        )}`,
        baseUrl
      )
    );
  }

  // Validate CSRF state
  if (!state || !savedState || state !== savedState) {
    return NextResponse.redirect(
      new URL(
        `/login?error=Invalid+OAuth+state+detected.+Possible+CSRF+attempt+blocked.`,
        baseUrl
      )
    );
  }

  if (!code) {
    return NextResponse.redirect(
      new URL(`/login?error=No+authorization+code+received+from+${provider}.`, baseUrl)
    );
  }

  const callbackUrl = `${baseUrl}/api/auth/callback/${provider}`;
  let userEmail = "";
  let userName = "";

  try {
    if (provider === "google") {
      const clientId = process.env.GOOGLE_CLIENT_ID;
      const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Missing Google OAuth credentials in environment.");
      }

      const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          code,
          client_id: clientId,
          client_secret: clientSecret,
          redirect_uri: callbackUrl,
          grant_type: "authorization_code",
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`Google token exchange failed: ${errText}`);
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${tokenData.access_token}` },
      });

      if (!userRes.ok) throw new Error("Failed to fetch Google profile.");
      const userData = await userRes.json();
      userEmail = userData.email || "operator@google-auth.internal";
      userName = userData.name || "Google Verified Operator";
    } else if (provider === "github") {
      const clientId = process.env.GITHUB_CLIENT_ID;
      const clientSecret = process.env.GITHUB_CLIENT_SECRET;

      if (!clientId || !clientSecret) {
        throw new Error("Missing GitHub OAuth credentials in environment.");
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code,
          redirect_uri: callbackUrl,
        }),
      });

      if (!tokenRes.ok) {
        const errText = await tokenRes.text();
        throw new Error(`GitHub token exchange failed: ${errText}`);
      }

      const tokenData = await tokenRes.json();
      const userRes = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
          "User-Agent": "ProofStack-Auth",
        },
      });

      if (!userRes.ok) throw new Error("Failed to fetch GitHub profile.");
      const userData = await userRes.json();
      userEmail = userData.email || `${userData.login}@github-auth.internal`;
      userName = userData.name || userData.login || "GitHub Verified Operator";
    } else {
      throw new Error(`Unsupported provider ${provider}`);
    }

    // Create session and set cookies
    const response = NextResponse.redirect(new URL(safeRedirect, baseUrl));

    // Clear OAuth state cookies
    response.cookies.delete("oauth_state");
    response.cookies.delete("oauth_redirect");

    // Set authenticated session cookie (role=developer for OAuth sign-ins)
    response.cookies.set("proofstack_role", "developer", {
      path: "/",
      maxAge: 86400,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Unknown OAuth error";
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(errorMsg)}`, baseUrl)
    );
  }
}
