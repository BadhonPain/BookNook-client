"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, ChevronDown, Menu, Moon, Sun, X } from "lucide-react";
import { Suspense, useState, useSyncExternalStore } from "react";
import { authClient } from "@/lib/auth-client";
import ToastProvider from "@/components/ToastProvider";

const themeStorageKey = "booknook-theme";

function getThemeSnapshot(): "dark" | "light" {
  return window.localStorage.getItem(themeStorageKey) === "light" ? "light" : "dark";
}

function subscribeToTheme(onChange: () => void) {
  const syncTheme = () => {
    document.documentElement.dataset.theme = getThemeSnapshot();
    onChange();
  };
  document.documentElement.dataset.theme = getThemeSnapshot();
  window.addEventListener("storage", syncTheme);
  window.addEventListener("booknook-theme-change", syncTheme);
  return () => {
    window.removeEventListener("storage", syncTheme);
    window.removeEventListener("booknook-theme-change", syncTheme);
  };
}

const publicLinks = [
  { href: "/", label: "Home" },
  { href: "/books", label: "All Books" },
];

const privateLinks = [
  { href: "/add-book", label: "Add Book" },
  { href: "/my-books", label: "My Books" },
  { href: "/my-borrows", label: "My Borrows" },
];

function NavigationLinks({
  links,
  onNavigate,
  open,
}: {
  links: Array<{ href: string; label: string }>;
  onNavigate: () => void;
  open: boolean;
}) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Main navigation"
      className={`main-nav${open ? " main-nav-open" : ""}`}
    >
      {links.map((link) => {
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);
        return (
          <Link
            aria-current={active ? "page" : undefined}
            className={`nav-link${active ? " nav-link-active" : ""}`}
            href={link.href}
            key={link.href}
            onClick={onNavigate}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const theme = useSyncExternalStore(subscribeToTheme, getThemeSnapshot, () => "dark");
  const user = session?.user;

  function toggleTheme() {
    const nextTheme = theme === "dark" ? "light" : "dark";
    window.localStorage.setItem(themeStorageKey, nextTheme);
    window.dispatchEvent(new Event("booknook-theme-change"));
  }

  async function handleSignOut() {
    await authClient.signOut();
    setProfileOpen(false);
    router.push("/");
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <div className="site-shell">
      <header className="site-header">
        <div className="nav-wrap">
          <Link className="brand" href="/" aria-label="BookNook home" onClick={closeMenu}>
            <span className="brand-mark" aria-hidden="true">
              <BookOpen size={22} />
            </span>
            <span>BookNook</span>
          </Link>

          <Suspense
            fallback={
              <nav
                aria-label="Main navigation"
                className={`main-nav${menuOpen ? " main-nav-open" : ""}`}
              >
                {publicLinks.map((link) => (
                  <Link className="nav-link" href={link.href} key={link.href} onClick={closeMenu}>
                    {link.label}
                  </Link>
                ))}
              </nav>
            }
          >
            <NavigationLinks
              links={[...publicLinks, ...(user ? privateLinks : [])]}
              onNavigate={closeMenu}
              open={menuOpen}
            />
          </Suspense>

          <div className="nav-actions">
            <button
              aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              aria-pressed={theme === "light"}
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
              type="button"
            >
              {theme === "dark" ? <Sun size={19} aria-hidden="true" /> : <Moon size={19} aria-hidden="true" />}
            </button>
            {!isPending && !user && (
              <>
                <Link className="button button-outline button-small" href="/login">
                  Log in
                </Link>
                <Link className="button button-small" href="/register">
                  Join us
                </Link>
              </>
            )}
            {user && (
              <div className="profile-area">
                <button
                  aria-expanded={profileOpen}
                  aria-haspopup="menu"
                  aria-label="Open account menu"
                  className="profile-trigger"
                  onClick={() => setProfileOpen((open) => !open)}
                  type="button"
                >
                  <span className="avatar">
                    {user.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={user.image} alt="" />
                    ) : (
                      user.name.slice(0, 1).toUpperCase()
                    )}
                  </span>
                  <span>{user.name.split(" ")[0]}</span>
                  <ChevronDown size={15} aria-hidden="true" />
                </button>
                {profileOpen && (
                  <div className="profile-menu" role="menu">
                    <div className="profile-name">{user.name}</div>
                    <Link href="/profile" onClick={() => setProfileOpen(false)} role="menuitem">
                      My Profile
                    </Link>
                    <button onClick={handleSignOut} role="menuitem" type="button">
                      Log out
                    </button>
                  </div>
                )}
              </div>
            )}
            <button
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Close navigation" : "Open navigation"}
              className="mobile-toggle"
              onClick={() => setMenuOpen((open) => !open)}
              type="button"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      <ToastProvider>
        <main className="site-main">{children}</main>
      </ToastProvider>
      <footer className="site-footer">
        <div className="footer-wrap">
          <div className="footer-about">
            <Link className="brand" href="/">
              <span className="brand-mark" aria-hidden="true">
                <BookOpen size={22} />
              </span>
              <span>BookNook</span>
            </Link>
            <p>A small online library for curious minds and stories worth sharing.</p>
          </div>
          <div>
            <h2 className="footer-title">Explore</h2>
            <div className="footer-links">
              <Link href="/">Home</Link>
              <Link href="/books">Browse books</Link>
              <Link href="/add-book">Share a book</Link>
            </div>
          </div>
          <div>
            <h2 className="footer-title">Connect</h2>
            <div className="footer-links">
              <span>Questions? Visit the project repository.</span>
              <a href="https://github.com/BadhonPain/BookNook-client" rel="noreferrer" target="_blank">
                GitHub
              </a>
            </div>
          </div>
        </div>
        <div className="footer-bottom">
          © BookNook. Made for readers, wherever they are.
        </div>
      </footer>
    </div>
  );
}
