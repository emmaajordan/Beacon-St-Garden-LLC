"use client";
import { useState, useEffect } from "react";
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

/* Banner photo: 
    Change link here to update banner photo */
const bannerSrc = "/banner_seedlings.jpeg";

/* Shop By Category:
       Change values here to add a category or update labels, links, and images */
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
  { id: 4, href: "/shop", label: "Shop All", image: "/sprout_info.png" },
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
    const [displayAll, setDisplayAll] = useState(false);
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
        const nextIndex = (postIndex + 1) % posts.length;
        setPostIndex(nextIndex);
    };

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
        const timer = setInterval(() => {
            handleBlogNext();
        }, 5000);
        return () => clearInterval(timer);
    });

    useEffect(() => {
        fetchPosts();
    }, []);
    
  return (
    <div className="">
        {/* Banner Photo */}
        <div className="relative z-0 w-full pt-[30%] bg-[url(/banner_seedlings.jpeg)] bg-cover bg-no-repeat bg-center">
            <div className="absolute top-0 z-1 w-full h-full bg-black/50">
                <div className="flex flex-col h-full items-center justify-center gap-2 xl:gap-10" >
                    <h1 className="hidden md:block text-4xl font-bold text-(--header)/90 uppercase tracking-wider">BEACON ST GARDENS</h1>
                    <div className="relative rounded-full size-36 lg:size-50 2xl:size-75 bg-(--header)/65">
                        <Image src="/logo.svg" alt="Logo" fill className="object-contain p-2 md:p-1 md:pt-4 2xl:pt-6" />
                    </div>
                </div>
            </div>
        </div>

        {/* Info Blurb */}
        <div className="bg-(--secondary)">
            <div className="flex flex-wrap text-nowrap justify-around px-1 py-4 gap-y-4 text-base 2xl:text-2xl">
                <div className="flex flex-col min-w-fit basis-1/3 items-center md:gap-1">
                    <span className="flex items-center gap-2">
                        <Sprout size={24} color="var(--teal)" />
                        <p>Locally Grown In Squirrel Hill</p>
                    </span>
                    <Link href='/about' className="text-sm 2xl:text-lg pl-8 md:pl-0 text-(--teal) hover:underline">
                        Learn More
                    </Link>
                </div>
                <div className="flex flex-col min-w-fit basis-1/3 items-center md:gap-1">
                    <span className="flex items-center gap-2">
                        <ShoppingBasket size={24} color="var(--teal)" />
                        <p>Order Online For Pickup</p>
                    </span>
                    <Link href='/shop' className="text-sm 2xl:text-lg pl-8 md:pl-0 text-(--teal) hover:underline">
                        Browse Products
                    </Link>
                </div>
                <div className="flex flex-col min-w-fit basis-1/3 items-center md:gap-1">
                    <span className="flex items-center gap-2">
                        <MapPin size={22} color="var(--teal)" />
                        <p>Visit Us At The Farmers Market </p>
                    </span>
                    <Link href="#market-info" className="text-sm 2xl:text-lg pl-8 md:pl-0 text-(--teal) hover:underline">
                        See Details
                    </Link>
                </div>
            </div>
        </div>
        
        {/* Blog Posts */}
        <div className="flex flex-col items-center max-w-6xl mx-auto text-center mt-8 mb-12">
            <h2 className="text-3xl mb-8 font-medium">What's New at the Garden?</h2>
            <div className="flex w-full items-center">
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
                    <div 
                        className="relative flex flex-col w-full md:flex-row min-h-xl md:h-64 shadow-md border border-(--footer) rounded-xl p-8 text-left gap-6 hover:shadow-lg cursor-pointer"
                        onClick={() =>
                            router.push(`/blog/${posts[postIndex].id}?${new URLSearchParams(window.location.search)}`)                                    
                        }
                    >
                        <p className="absolute bottom-2 right-4 text-(--input-border) self-end">{postIndex+1} / {posts.length}</p>
                        <div className="relative w-full md:w-1/4 h-52 md:h-auto">
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
                        <div className="flex flex-col md:w-3/4">
                            <h3 className="text-lg md:text-2xl font-semibold line-clamp-2">{posts[postIndex].title}</h3>
                            <p className="mb-4 md:mb-6 text-(--input-border)">{formatDate(posts[postIndex].created_at)}</p>
                            <p className="mb-4 md:mb-6 line-clamp-2">{posts[postIndex].excerpt}</p>
                            <button
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
            
            {/* TODO: Display All Posts */}
            <button
                onClick={() => setDisplayAll((prev) => !prev)}
                className="text-(--teal) text-lg mt-6 cursor-pointer hover:text-(--teal-hover)"
            >
                {displayAll ? (
                    <div className="flex items-center gap-1">
                        hide posts
                        <ChevronUp />
                    </div>                  
                ) : (
                    <div className="flex items-center gap-1">
                        see all posts
                        <ChevronDown />
                    </div>
                )}
            </button>
        </div>

        
        <div id="market-info" className="relative bg-(--secondary) py-12 px-6 md:px-0">
            
            {/* Farmer's market stand information */}
            <div className="relative flex flex-col justify-between md:flex-row max-w-6xl mx-auto 2xl:max-w-[80vw] mb-12 gap-4 md:gap-10 2xl:gap-16">
                <div className="relative basis-1/2 w-full min-h-70 2xl:min-h-94">
                    <Image src="/stand_photo.jpeg" alt="photo of farmer's market stand" fill className="object-cover rounded-sm" />
                </div>
                <div className="relative flex flex-col basis-1/2 justify-between 2xl:text-lg gap-2 md:gap-0">
                    <h2 className="text-3xl font-medium">Visit Our Stand</h2>
                    <hr className="w-full mb-2 border-0 h-[3px] bg-(--card-border)" />
                    <p>Find us at the <span className="font-semibold">Squirrel Hill Farmer's Market</span></p>
                    <p>Sundays 9am-1pm</p>
                    <address className="not-italic">
                        <p>5737 Beacon St</p>
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
                    <h2 className="text-3xl text-nowrap font-medium">Shop by Category</h2>
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

        {/* Shop by category */}
        <div className="relative max-w-6xl mx-auto text-center">
          <div className="relative flex mb-12 gap-4 items-center">
            <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
            <h2 className="text-3xl text-nowrap font-medium">
              Shop by Category
            </h2>
            <hr className="w-full border-0 h-[3px] bg-(--card-border)" />
          </div>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {categories.map((category) => (
              <li key={category.id} className="relative bg-[var(--card-bg)]">
                <Link
                  href={category.href}
                  className="flex flex-col w-full aspect-square overflow-hidden rounded-md"
                >
                  <div className="relative h-full w-full bg-(--card-border)">
                    <Image
                      src={category.image}
                      alt="photo of seedling"
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-300 overflow-hidden"
                    />
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
