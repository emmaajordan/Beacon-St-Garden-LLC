'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import BlogTab from '@/components/admin/BlogTab';

const TABS = ['Products', 'Orders', 'Blog Posts'];

export default function AdminPage() {
  const router = useRouter();
  const supabase = createClient();
  const [activeTab, setActiveTab] = useState('Products');

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-[var(--header)]">
      <div className="mx-auto px-8 py-10 max-w-6xl">

        {/* header */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold text-[var(--text)]">Admin Dashboard</h1>
          <button
            onClick={handleLogout}
            className="text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors"
          >
            Log out
          </button>
        </div>

        {/* tabs */}
        <div className="flex gap-1 border-b border-[var(--card-border)] mb-8">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
                activeTab === tab
                  ? 'border-[var(--rust)] text-[var(--rust)]'
                  : 'border-transparent text-[var(--text)] hover:text-[var(--rust)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* tab content */}
        {activeTab === 'Products' && <ProductsTab />}
        {activeTab === 'Orders' && <OrdersTab />}
        {activeTab === 'Blog Posts' && <BlogTab />}

      </div>
    </div>
  );
}