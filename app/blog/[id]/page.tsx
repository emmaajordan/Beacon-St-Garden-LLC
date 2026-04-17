'use client'
import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import { useParams } from "next/navigation";
import Link from 'next/link';
import { Loader2, ArrowLeft } from "lucide-react";
import MarkdownRenderer from '@/components/MarkdownRenderer';


function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function ProductPage() {
    const { id } = useParams();
    const supabase = createClient();
    const [loading, setLoading] = useState(true);
    const [post, setPost] = useState<any>(null);
    
    const fetchPost = async () => {
        const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("id", id)
        .single();

        if (!error) setPost(data || null);
        setLoading(false);
    }

    useEffect(() => {
        fetchPost();
    }, []);

    return (
        <div className="flex justify-center">
            {loading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
                </div>
            ) : post === null ? (
                <div className="h-[40vh] overflow-hidden bg-[var(--header)] flex flex-col items-center justify-end gap-4">
                    <p className="text-lg text-gray-600">Post not found</p>
                    <Link href="/" className="text-[var(--rust)] hover:underline">
                        Back to Home
                    </Link>
                </div>
            ) : (
                <div className="w-full md:max-w-4xl px-8 py-10">
                    {/* back link */}
                    <Link
                        href='/#whats-new'
                        className="inline-flex items-center gap-2 md:text-sm text-[var(--input-border)] hover:text-[var(--rust)] transition-colors mb-6"
                    >
                        <ArrowLeft size={15} />
                        Home
                    </Link>

                    <h1 className="text-4xl font-bold py-1">{post.title}</h1>
                    <p className="text-sm py-3">{formatDate(post.created_at)}</p>
                    <hr className="border-0 h-[2px] bg-(--teal)/60 mb-6" />
                    <MarkdownRenderer md={post.content}/>
                </div>
            )}
        </div>
    );
}