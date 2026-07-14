import Link from "next/link";
import { getCurrentUser } from "@/lib/auth-helpers";
import { Logo } from "./icons";
import { LogoutButton } from "./logout-button";

export async function NavBar() {
  const user = await getCurrentUser();
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link className="brand" href="/">
          <Logo /> RishtaScore
        </Link>
        <nav className="nav-links">
          <Link href="/">Home</Link>
          <Link href="/search">Search</Link>
          <Link href="/#how">How it works</Link>
          <Link href="/#pricing">Pricing</Link>
          <Link href="/verify">Verify a Match</Link>
          {user ? (
            <>
              <Link href="/profile">My Profile</Link>
              <Link href="/matches">Matches</Link>
              <Link href="/messages">Messages</Link>
              <Link href="/dashboard">Verification</Link>
              {user.role === "admin" && <Link href="/admin">Admin</Link>}
              <LogoutButton />
            </>
          ) : (
            <Link href="/register" className="btn btn-sm">
              Get started
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
