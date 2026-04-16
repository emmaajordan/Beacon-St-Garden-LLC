"use client";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    MoveRight,
    MapPin,
    Loader2,
    ShoppingBasket,
    Sprout,
    ChevronDown,
} from 'lucide-react';

// Banner photo: 
// Change link here to update banner photo
// const bannerSrc = "/banner_seedlings.jpeg";
const bannerSrc = "/growingtable.jpeg";

// Shop By Category:
// Change values here to add a category or update labels, links, and images
const categories = [
  {
    id: 1,
    href: "/shop?category=Vegetable/Fruit",
    label: "Fruit & Vegetable Plants",
    image: "/pepper-photo.jpg",
  },
  {
    id: 2,
    href: "/shop?category=Flowers",
    label: "Flowers",
    image: "/colorful-flowers.jpg",
  },
  {
    id: 3,
    href: "/shop?category=Herbs",
    label: "Herbs",
    image: "/herb_photo.jpg",
  },
  { 
    id: 4,
    href: "/shop",
    label: "Shop All",
    image: "/sprout_info.png" 
    },
];

function formatDate(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function BlogPost({ 
    post,
    index,
    total,
    onClick
}: {
    post: any;
    index: number;
    total: number;
    onClick: () => void;
}) {

    return (
        <div
            className="relative flex flex-col w-full sm:flex-row min-h-xl sm:h-64 shadow-md border border-(--footer) rounded-xl p-6 text-left gap-2 sm:gap-6 hover:shadow-lg cursor-pointer"
            onClick={onClick}
        >
            {(index >= 0 && total > 1) && (
                <p className="absolute bottom-2 right-4 text-(--input-border) self-end">{index} / {total}</p>
            )}
            <div className="relative w-full sm:w-60 aspect-square h-48 sm:h-full shrink-0">
                {post.image_url ? (
                    <Image 
                        src={post.image_url} 
                        alt={post.title}
                        fill 
                        className="object-cover rounded-md"
                        placeholder="blur"
                        blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjQwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjRDZDRkNDIi8+PC9zdmc+"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-(--secondary) rounded-md">
                        <Image
                            src="/no_item.svg"
                            alt="No Item"
                            height={150}
                            width={150}
                            className="object-cover opacity-40"
                        />
                    </div>
                )}
            </div>
            <div className="flex flex-col sm:full">
                <h3 className="text-lg sm:text-2xl font-semibold line-clamp-2">{post.title}</h3>
                <p className="mb-2 sm:mb-6 text-(--input-border)">{formatDate(post.created_at)}</p>
                <p className="mb-2 sm:mb-6 line-clamp-2 h-[2lh]">{post.excerpt}</p>
                <button
                    className="flex items-center gap-2 text-(--rust) cursor-pointer"
                >
                    Read More 
                    <MoveRight size={20} color="var(--rust)" />
                </button>
            </div>
        </div>
    );
}

export default function Home() {
    const supabase = createClient();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [displayAll, setDisplayAll] = useState(false);
    const [posts, setPosts] = useState<any[]>([]);
    const [postIndex, setPostIndex] = useState(0);
    const [cycling, setCycling] = useState(true);

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
        const nextIndex = (postIndex + 1) % posts.length;
        setPostIndex(nextIndex);
    };

    useEffect(() => {
        console.log("fetching posts");
        const fetchPosts = async () => {
            const { data, error } = await supabase
            .from("blog_posts")
            .select("*")
            .eq("published", true)
            .order("created_at", { ascending: false });

            if (!error) setPosts(data || []);
            setLoading(false);
        }
        
        fetchPosts();
    }, []);

    useEffect(() => {
        if (posts.length === 0 || !cycling) return;

        const timer = setTimeout(() => {
            handleBlogNext();
        }, 3000);

        return () => clearTimeout(timer);
    }, [posts, postIndex, cycling]);

  return (
    <div className="">
        {/* Banner Photo */}
        <div className="relative w-full">
            <div className="relative z-0 w-full h-64 md:h-full sm:aspect-3/1">
                <Image 
                    src={bannerSrc} 
                    alt="Banner photo" 
                    fill
                    className="object-cover"
                    priority
                />
            </div>        
            <div className="absolute top-0 z-1 w-full h-full bg-black/50">
                <div className="flex flex-col h-full items-center justify-center gap-6 xl:gap-10" >
                    <h1 className="hidden md:block text-4xl font-bold text-(--header)/90 uppercase tracking-wider">BEACON ST GARDENS</h1>
                    <div className="relative rounded-full size-36 lg:size-50 2xl:size-75 bg-(--header)/65">
                        <Image src="/logo.svg" alt="Logo" fill className="object-contain p-2 md:p-1 pt-3 md:pt-4 2xl:pt-6" />
                    </div>
                </div>
            </div>
        </div>

        {/* Info Blurb */}
        <div className="bg-(--secondary)">
            <div className="flex flex-wrap text-nowrap justify-around py-4 gap-y-6 text-lg 2xl:text-2xl">
                <div className="flex flex-col min-w-fit basis-1/3 items-center px-4">
                    <span className="flex flex-col md:flex-row items-center md:gap-2">
                        <Sprout size={24} color="var(--teal)" />
                        <p>Locally Grown In Squirrel Hill</p>
                    </span>
                    <Link href='/about' className="text-base 2xl:text-lg text-(--teal) hover:underline">
                        Learn More
                    </Link>
                </div>
                <div className="flex flex-col min-w-fit basis-1/3 items-center px-4">
                    {/* <span className="flex items-center gap-2"> */}
                    <span className="flex flex-col md:flex-row items-center md:gap-2">
                        <ShoppingBasket size={24} color="var(--teal)" />
                        <p>Order Online For Pickup</p>
                    </span>
                    <Link href='/shop' className="text-base 2xl:text-lg text-(--teal) hover:underline">
                        Browse Products
                    </Link>
                </div>
                <div className="flex flex-col min-w-fit basis-1/3 items-center px-4">
                    <span className="flex flex-col md:flex-row items-center md:gap-2">
                        <MapPin size={22} color="var(--teal)" />
                        <p>Visit Us During The Farmers Market </p>
                    </span>
                    <Link href="#market-info" className="text-base 2xl:text-lg text-(--teal) hover:underline">
                        See Details
                    </Link>
                </div>
            </div>
        </div>
        
        {/* Blog Posts */}
        <div className="flex flex-col items-center max-w-6xl mx-auto text-center mt-8 mb-14">
            <h2 className="text-2xl sm:text-3xl font-medium">What's New at the Garden?</h2>
            <button
                onClick={() => {
                    setDisplayAll((prev) => !prev);
                    if (displayAll) setCycling(false);
                    else setCycling(true);
                }}
                className="text-(--input-border) text-sm text-left place-self-end p-2 mt-2 mr-14 cursor-pointer"
            >
                {displayAll ? (
                    <div className="flex items-center gap-1">
                        collapse
                        <ChevronUp size={18} />
                    </div>                  
                ) : (
                    <div className="flex items-center gap-1">
                        show all
                        <ChevronDown size={18} />
                    </div>
                )}
            </button>
            <div className="flex w-full items-center">
                <button 
                    onClick={handleBlogPrev}
                    className={`${(posts.length < 2 || displayAll) && "invisible"} cursor-pointer hover:scale-115`}
                >
                    <ChevronLeft size={60} color="var(--lines)" />
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
                        <div>
                            {displayAll ? (
                                // List of all Blog Posts
                                <div className="flex flex-col gap-6">
                                    {posts.map((post) => (
                                        <BlogPost 
                                            key={post.id}
                                            post={post}
                                            index={-1}
                                            total={-1}
                                            onClick={() => router.push(`/blog/${post.id}?${new URLSearchParams(window.location.search)}`)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                // Single Post
                                <div
                                    onMouseEnter={() => setCycling(false)}
                                    onMouseLeave={() => setCycling(true)}
                                >
                                    <BlogPost 
                                        post={posts[postIndex]}
                                        index={postIndex+1}
                                        total={posts.length}
                                        onClick={() => router.push(`/blog/${posts[postIndex].id}?${new URLSearchParams(window.location.search)}`) } 
                                    />
                                </div>
                            )}                        
                        </div>
                    )}
                </div>
                <button 
                    onClick={handleBlogNext} 
                    className={`${(posts.length < 2 || displayAll) && "invisible"} cursor-pointer hover:scale-115`}
                >
                    <ChevronRight size={60} color="var(--lines)" />
                </button>
            </div>
        </div>

        <div id="market-info" className="relative bg-(--secondary) py-12 px-6">
            
            {/* Farmer's market stand information */}
            <div className="relative flex flex-col justify-between md:flex-row max-w-6xl mx-auto 2xl:max-w-[80vw] mb-12 gap-4 md:gap-10 2xl:gap-16">
                <div className="relative basis-1/2 w-full min-h-70 2xl:min-h-94">
                    <Image src="/stand_photo.jpeg" alt="photo of farmer's market stand" fill className="object-cover rounded-sm" />
                </div>
                <div className="relative flex flex-col basis-1/2 justify-between 2xl:text-lg gap-2 md:gap-0">
                    <h2 className="text-2xl sm:text-3xl font-medium">Visit Our Stand</h2>
                    <hr className="w-full mb-2 border-0 h-[3px] bg-(--card-border)" />
                    <p>Find us down the street from the <span className="font-semibold">Squirrel Hill Farmer's Market</span></p>
                    <p>Sundays 9am-1pm</p>
                    <address className="not-italic">
                        <p>On Beacon St Near Wightman St</p>
                        <p>Pittsburgh, PA 15217</p>
                    </address>
                    <p className="text-(--input-border) text-sm mb-1 md:mb-0">*Check our socials for updates on stand schedule</p>
                    <Link href='/about' className="w-fit text-white bg-(--rust) box-border border border-transparent hover:bg-(--dark-rust) font-base leading-5 rounded-md text-sm 2xl:text-base px-4 py-2">Learn More</Link>
                </div>
            </div>

            {/* Shop by category */}
            <div className="relative max-w-6xl 2xl:max-w-[80vw] mx-auto text-center">
                <div className="relative flex mb-8 md:mb-12 gap-4 items-center">
                    <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
                    <h2 className="text-2xl sm:text-3xl text-nowrap font-medium">Shop by Category</h2>
                    <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
                </div>
                <ul className="grid grid-cols-2 md:grid-cols-4 gap-4 2xl:gap-10">
                    {categories.map((category) => (
                        <li key={category.id} className="relative bg-[var(--card-bg)]">
                            <Link href={category.href} className="flex flex-col w-full aspect-square overflow-hidden rounded-md">
                                <div className="relative h-full w-full bg-(--card-border)">
                                    <Image src={category.image} alt="photo of seedling" fill className="object-cover hover:scale-105 transition-transform duration-300 overflow-hidden" />
                                </div>
                                <div className="relative text-sm md:text-lg text-(--header) bg-(--teal-hover) p-1 2xl:p-3 2xl:text-xl">
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
