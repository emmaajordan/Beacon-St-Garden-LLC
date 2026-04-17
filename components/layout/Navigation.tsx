"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, X } from "lucide-react"; //shopping cart icon
import Image from "next/image";
import { useEffect, useState } from "react";
import { useCartStore } from "@/lib/store/cartStore";
import { createClient } from "@/lib/supabase/client";

export default function Navigation() {
  const pathname = usePathname(); // gets curr page

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/shop", label: "Shop" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ];

  const totalItems = useCartStore((state) =>
    state.items.reduce((sum, i) => sum + i.quantity, 0),
  );

  const [isAdmin, setIsAdmin] = useState(false);
  const supabase = createClient();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setIsAdmin(!!user);
    };

    checkUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setIsAdmin(!!session?.user);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className="sticky top-0 z-50 bg-[var(--header)] border-b border-gray-200 shadow-sm relative">
      <div className="mx-auto px-6 md:px-8 h-[50px] md:h-[60px] flex items-center justify-between">
        {/*logo*/}
        <Link
          href="/"
          className="flex items-center space-x-0 md:space-x-3 hover:opacity-80 transition-opacity"
        >
          <img
            src="/logo.svg"
            alt="Logo"
            width={40}
            height={60}
            className="hidden md:inline"
          />
          <span className="text-base md:text-2xl font-medium text-[var(--text)]">
            Beacon Street Gardens{" "}
            <span className="text-xs md:text-sm font-normal">LLC</span>
          </span>
        </Link>

        {/*nav links*/}
        <div className="hidden md:flex items-center gap-8">
          {isAdmin && (
            <Link
              href="/admin"
              className="text-[var(--rust)] font-medium text-base transition-colors hover:opacity-80"
            >
              Admin
            </Link>
          )}

          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`relative text-base font-medium transition-colors ${pathname === link.href ? "text-[var(--rust)] " : "text-[var(--text)] hover:text-[var(--rust)]"}`}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[var(--rust)] animate-[slideIn_0.3s_ease-in-out]" />
              )}
            </Link>
          ))}

          {/*cart icon*/}
          <Link
            href="/cart"
            className=" relative text-[var(--text)] hover:text-[var(--rust)] transition-colors"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--rust)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none pb-px">
                {totalItems}
              </span>
            )}
          </Link>
        </div>
        {/* mobile — cart + hamburger */}
        <div className="flex md:hidden items-center gap-4">
          <Link
            href="/cart"
            className="relative text-[var(--text)] hover:text-[var(--rust)] transition-colors"
          >
            <ShoppingCart size={22} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-[var(--rust)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none pb-px">
                {totalItems}
              </span>
            )}
          </Link>
          <button
            onClick={() => setMenuOpen((prev) => !prev)}
            className="text-[var(--text)] hover:text-[var(--rust)] transition-colors"
          >
            {menuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>
      {/* backdrop */}
      {menuOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setMenuOpen(false)}
        />
      )}
      {/* mobile dropdown */}
      {menuOpen && (
        <div className="md:hidden absolute right-4 top-[52px] bg-[var(--header)] border border-[var(--card-border)] rounded-lg shadow-lg overflow-hidden z-50 w-44">
          {isAdmin && (
            <div key="admin">
              <Link
                href="/admin"
                className="flex items-center px-4 py-2.5 text-sm text-[var(--rust)] font-medium hover:bg-[var(--card-bg)] transition-colors"
              >
                Admin
              </Link>
              <div className="h-[0.5px] bg-[var(--card-border)] mx-3" />
            </div>
          )}
          {navLinks.map((link, i) => (
            <div key={link.href}>
              <Link
                href={link.href}
                className={`flex items-center justify-between px-4 py-2.5 text-sm transition-colors hover:bg-[var(--card-bg)] ${
                  pathname === link.href
                    ? "text-[var(--rust)] font-medium"
                    : "text-[var(--text)]"
                }`}
              >
                {link.label}
                {pathname === link.href && (
                  <span className="w-1 h-1 rounded-full bg-[var(--rust)]" />
                )}
              </Link>
              {i < navLinks.length - 1 && (
                <div className="h-[0.5px] bg-[var(--card-border)] mx-3" />
              )}
            </div>
          ))}
        </div>
      )}
    </nav>
  );
}
