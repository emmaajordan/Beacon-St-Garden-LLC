'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ShoppingCart } from 'lucide-react'; //shopping cart icon
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { createClient } from '@/lib/supabase/client';


export default function Navigation() {

    const pathname = usePathname(); // gets curr page

    const navLinks = [
        { href: '/', label: 'Home' },
        { href: '/shop', label: 'Shop' },
        { href: '/about', label: 'About' },
        { href: '/contact', label: 'Contact' },
    ];

    const totalItems = useCartStore((state) =>
        state.items.reduce((sum, i) => sum + i.quantity, 0)
    );

    const [isAdmin, setIsAdmin] = useState(false);
    const supabase = createClient();

    useEffect(() => {
    const checkUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        setIsAdmin(!!user);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        setIsAdmin(!!session?.user);
    });

    return () => subscription.unsubscribe();
    }, []);

    return (
        <nav className="sticky top-0 z-50 bg-[var(--header)] border-b border-gray-200 shadow-sm h-[60px]">
            <div className="mx-auto px-8 py-4 h-full flex items-center">
                <div className="flex items-center justify-between w-full">
                {/*logo*/}
                <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
                        <Image src="/logo-new.png" alt="Logo" width={60} height={60}/>
                        <span className="text-2xl font-medium text-[var(--text)]">
                            Beacon Street Gardens <span className="text-sm font-normal">LLC</span>
                        </span>
                    </Link>

                {/*nav links*/}
                <div className="flex items-center gap-8">
                    {isAdmin && (
                    <Link href="/admin" className="text-[var(--rust)] font-medium text-base transition-colors hover:opacity-80">
                        Admin
                    </Link>
                    )}

                    {navLinks.map((link) => (
                    <Link key={link.href} href={link.href} className={`relative text-base font-medium transition-colors ${pathname === link.href ? 'text-[var(--rust)] ' : 'text-[var(--text)] hover:text-[var(--rust)]'}`}>
                        {link.label}
                        {pathname === link.href && (
                            <span className="absolute -bottom-1 left-0 w-full h-[1.5px] bg-[var(--rust)] animate-[slideIn_0.3s_ease-in-out]" />
                        )}
                    </Link>
                    ))}

                    {/*cart icon*/}
                    <Link href="/cart" className=" relative text-[var(--text)] hover:text-[var(--rust)] transition-colors">
                        <ShoppingCart size={22} />
                        {totalItems > 0 && (
                            <span className="absolute -top-2 -right-2 bg-[var(--rust)] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-medium leading-none pb-px">
                            {totalItems}
                            </span>
                        )}
                    </Link>
                </div>

            </div>
        </div>
    </nav>
  );
}