import Link from "next/link";

export function GoogleAuthButton() {
  return <Link href="/api/auth/google" className="google-auth-button"><span aria-hidden="true" className="google-mark">G</span><span>Google ile devam et</span></Link>;
}
