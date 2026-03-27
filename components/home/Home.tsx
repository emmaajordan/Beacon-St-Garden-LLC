'use client'
import { useState, useEffect } from 'react';
import { createClient } from "@/lib/supabase/client";
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    MoveRight,
    Loader2,
} from 'lucide-react';

/* Banner photo: 
    Change link here to update banner photo */
const bannerSrc = "/banner_seedlings.jpeg";

/* Shop By Category:
       Change values here to add a category or update labels, links, and images */
const categories = [
    { id: 1, href: '/shop?category=Vegetable/Fruit', label: 'Fruit & Vegetable Plants', image: '/pepper-photo.jpg' },
    { id: 2, href: '/shop?category=Flowers', label: 'Flowers', image: '/colorful-flowers.jpg' },
    { id: 3, href: '/shop?category=Herbs', label: 'Herbs', image: '/herb_photo.jpg' },
    { id: 4, href: '/shop', label: 'Shop All', image: '/sprout_info.png' },
    
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function Home() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [posts, setPosts] = useState<any[]>([]);
    const [postIndex, setPostIndex] = useState(0);

    const handleBlogPrev = () => {
        const nextIndex = postIndex-1;
        if (nextIndex < 0){
            setPostIndex(posts.length-1);
        }
        else {
            setPostIndex(nextIndex);
        }
    }

    const handleBlogNext = () => {
        const nextIndex = (postIndex+1)%posts.length;
        setPostIndex(nextIndex);
    }

    const fetchPosts = async () => {
        const { data, error } = await supabase
        .from("blog_posts")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false });

        if (!error) setPosts(data || []);
        setLoading(false);
    }

    useEffect(() => {
        fetchPosts();
    }, []);

    // TODO- when hovering, pause
    useEffect(() => {
        const timer = setInterval(() => {
            handleBlogNext();
        }, 5000);
        return () => clearInterval(timer);
    });
    
  return (
    <div className="">
        {/* Home banner */}
        {/* <div className="relative flex items-center h-[45vh]">
            <div className="z-1">
                <Image src={bannerSrc} alt="image of seedlings" fill style={{objectFit: 'cover'}} />
            </div>
            <div className="z-2 sm:w-[80vw] md:w-[40vw] h-7/10 ml-[3vw] p-2 bg-(--header)" >
                <div className="relative flex flex-col w-full h-full p-2 justify-center items-center gap-2 bg-(--header) border-2 border-(--footer)">
                    <img src="/logo.svg" alt="logo"  width={100} height={115}/>
                    <h1 className="text-3xl font-semibold">Beacon Street Gardens</h1>
                    <p className="">Welcoming tagline</p>
                </div>
            </div>
        </div> */}

        <div className="relative flex items-center h-64 bg-(--footer)">
            <div className="flex flex-col items-center justify-center relative w-1/3 p-10" >
                    <Image src="/logo_beaconstgardens_noback.png" alt="Logo" width={150} height={173}/>
                    <h1 className="text-3xl font-semibold">Beacon St Gardens</h1>
            </div>
            <div className="relative w-2/3 h-full">
                <Image src={bannerSrc} alt="banner photo" fill className="object-cover" />
            </div>
        </div>


        {/* Info Section */}
        <div className="flex flex-col py-12 gap-8 items-center text-2xl ">
            <p>Locally grown in Squirrel Hill</p>
            <p>Order online for pickup or <Link href="#market-info" className="text-(--rust)">visit our stand</Link></p>
            <Link href='/shop' className="text-white bg-(--teal) box-border border border-transparent hover:bg-(--teal-hover) font-base leading-5 rounded-md text-lg px-4 py-2">
                <span className="flex place-items-center gap-2">
                    See What's Available
                    <MoveRight />
                </span>
            </Link>
        </div>

        <hr className="border-0 h-[3px] bg-gradient-to-r from-transparent via-(--footer) to-transparent" />
        
        {/* Blog-post style updates */}
        <div className="flex flex-col items-center max-w-6xl mx-auto text-center mt-8 mb-12">
            <h2 className="text-3xl mb-8 font-medium">What's New at the Garden?</h2>
            <div className="flex w-6xl items-center">
                <button onClick={handleBlogPrev} className="cursor-pointer hover:scale-115">
                    {posts.length > 1 && (
                        <ChevronLeft size={60} color="var(--input-border)" />
                    )}
                </button>
                <div className="w-full">
                {loading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 size={28} className="animate-spin text-[var(--teal)]" />
                    </div>
                ) : posts.length === 0 ? (
                    <div className="text-sm text-[var(--input-border)] text-center">
                        <p className="pb-2">
                            There are no posts at the moment.
                        </p>
                        <p>
                            Check back soon to see updates on what we're growing and get the scoop on new deals!
                        </p>
                    </div>
                ) : (
                    <div className="flex h-64 shadow-lg shadow-(--rust) border border-(--footer) rounded-xl p-8 text-left gap-6">
                        <div className="relative w-1/4 h-auto">
                            {posts[postIndex].image_url ? (
                                <Image 
                                    src={posts[postIndex].image_url} 
                                    alt={posts[postIndex].title}
                                    fill 
                                    className="object-cover rounded-sm"
                                    placeholder="blur"
                                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDZDRkNDIi8+PC9zdmc+"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                    <Image
                                        src="/no_item.svg"
                                        alt="No Item"
                                        fill
                                        className="object-cover opacity-40"
                                    />
                                </div>
                            )}
                        </div>
                        <div className="flex flex-col w-3/4">
                            <div className="flex justify-between">
                                <h3 className="text-2xl font-medium">{posts[postIndex].title}</h3>
                                <p className="text-(--input-border)">{postIndex+1} / {posts.length}</p>
                            </div>
                            <p className="mb-6">posted {formatDate(posts[postIndex].created_at)}</p>
                            <p className="mb-6 line-clamp-2">{posts[postIndex].excerpt}</p>
                            <button 
                                onClick={() =>
                                    router.push(`/blog/${posts[postIndex].id}?${new URLSearchParams(window.location.search)}`)                                    
                                }
                                className="flex items-center gap-2 text-(--rust) cursor-pointer"
                            >
                                Read More 
                                <MoveRight size={20} color="var(--rust)" />
                            </button>
                        </div>
                    </div>
                )}
                </div>
                <button 
                    onClick={handleBlogNext} 
                    className="cursor-pointer hover:scale-115"
                >
                    {posts.length > 1 && (
                        <ChevronRight size={60} color="var(--input-border)" />
                    )}
                </button>
            </div>
        </div>

        
        <div id="market-info" className="relative bg-(--secondary) py-12">
            
            {/* Farmer's market stand information */}
            <div className="relative flex flex-col md:flex-row max-w-6xl mx-auto mb-12 justify-center md:gap-10">
                <div className="relative basis-1/2 w-full max-w-lg h-64">
                    <Image src="/stand_photo.jpeg" alt="photo of farmer's market stand" fill className="object-cover rounded-sm" />
                </div>
                <div className="relative flex flex-col basis-1/2 px-6 justify-between">
                    <h2 className="text-3xl font-medium">Visit Our Stand</h2>
                    <hr className="w-full mb-2 border-0 h-[3px] bg-(--card-border)" />
                    <p>Find us at the <span className="font-semibold">Squirrel Hill Farmer's Market</span></p>
                    <p>Sundays 9am-1pm</p>
                    <address className="not-italic">
                        <p>5737 Beacon St</p>
                        <p>Pittsburgh, PA 15217</p>
                    </address>
                    <p className="text-(--input-border) text-sm">*Check our socials for updates on stand schedule</p>
                    <Link href='/about' className="w-fit text-white bg-(--rust) box-border border border-transparent hover:bg-(--dark-rust) font-base leading-5 rounded-md text-sm px-4 py-2">Learn More</Link>
                </div>
            </div>

            {/* Shop by category */}
            <div className="relative max-w-6xl mx-auto text-center">
                <div className="relative flex mb-12 gap-4 items-center">
                    <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
                    <h2 className="text-3xl text-nowrap font-medium">Shop by Category</h2>
                    <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((category) => (
                        <li key={category.id} className="relative bg-[var(--card-bg)]">
                            <Link href={category.href} className="flex flex-col w-full aspect-square overflow-hidden rounded-md">
                                <div className="relative h-full w-full bg-(--card-border)">
                                    <Image src={category.image} alt="photo of seedling" fill className="object-cover hover:scale-105 transition-transform duration-300 overflow-hidden" />
                                </div>
                                <div className="relative text-sm md:text-lg text-(--header) bg-(--teal-hover) p-1">
                                    <p>{category.label}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>

        </div>
    </div>
  );
}