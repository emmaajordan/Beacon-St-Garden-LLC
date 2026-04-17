'use client'
import { PawPrint, Flower, Instagram } from 'lucide-react';
import Link from 'next/link';

const styles = {
  heading: "text-2xl font-semibold my-2 md:my-6 text-nowrap",
  section: "prose prose-lg mb-4",
  text: "py-2",
  line: "w-full border-0 h-[2px] bg-(--card-border) rounded-full ml-4",
}

export default function AboutPage() {
  return (
    <div>
      <div className="w-full h-64 bg-cover bg-center" style={{backgroundImage: "url('/seedlings.jpeg')"}}></div>
      <div className="max-w-4xl mx-auto px-8 py-8">
        <h1 className="text-4xl font-bold mb-6">About Us</h1>
        
        {/* Our Story */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>Our Story</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            It started simply: a love of flowers and a dream to fill our outdoor space with color.
            Last year, we grew more flowers than ever before — and we were completely hooked.
          </p>
          <p className={styles.text}>
            To grow the variety we wanted, we needed a solid seedling setup. Once we had it built, 
            we realized it only cost a little more to scale it up — so we did. What began as a personal 
            passion quickly grew into something we wanted to share. We now grow enough to supply our own 
            garden and offer beautiful plants to others who share that same dream.
          </p>
          <p className={styles.text}>
            Along the way, our love of fresh summer produce (especially tomatoes!) led us down a similar path. 
            We couldn't eat it all ourselves, so we started selling that too. This year, we've formalized 
            it into a small business so we can share what we grow with our Pittsburgh community.
          </p>
        </section>

        {/* Our Mission */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>Our Mission</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            We're here to help you achieve your garden dreams — whether that means a porch bursting 
            with color, a pollinator-friendly yard, or a summer full of homegrown tomatoes.
          </p>
        </section>

        {/* How We Grow */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>How We Grow</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            We believe in growing with care — for our plants, our health, and the environment. 
            Here's what that looks like in practice:
          </p>
          <ul className="pl-12 list-disc">
            <li className={styles.text}>
              <span className="font-extrabold text-(--teal-hover)">Mostly organic: </span>
              We follow safe and mostly organic principles throughout our growing process. 
              We are not strictly organic because we use hydroponic nutrients for our seedlings, and some of
              our produce is grown hydroponically to use water more efficiently.
            </li>
            <li className={styles.text}>
              <span className="font-extrabold text-(--teal-hover)">No pesticides outdoors: </span>
              We never use conventional pesticides in our outdoor garden. 
              We rely on a healthy ecosystem to manage pests naturally — and we want to protect the 
              pollinators we depend on.
            </li>
            <li className={styles.text}>
              <span className="font-extrabold text-(--teal-hover)">Responsible indoor pest management: </span>
              For indoor seedlings, we occasionally use organic-approved 
              pesticides when needed. By the time any plant goes outside, it is completely safe for people, 
              pets, and pollinators.
            </li>
            <li className={styles.text}>
              <span className="font-extrabold text-(--teal-hover)">Low plastic: </span>
              We use soil blocks instead of plastic cell packs whenever we can, reducing waste one seedling at a time.
            </li>
          </ul>
        </section>

        {/* What We Offer */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>What We Offer</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            Our biggest offerings are seedlings and flower baskets, available starting in early May. 
            After that, availability changes week to week based on what's fresh and ready — 
            so there's always something new.
          </p>
          <p className={styles.text}>
            We grow a wide variety of flowers and seasonal produce. Keep an eye on our shop for what's currently available.
          </p>
        </section>

        {/* Where To Find Us */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>Where To Find Us</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            <span className="font-extrabold text-(--teal-hover)">Online: </span>
            Browse and place orders for pickup right here on our website.
          </p>
          <p className={styles.text}>
            <span className="font-extrabold text-(--teal-hover)">Plant Stand: </span>
            We run a plant stand from our home during Squirrel Hill Farmers Market hours on Sundays. 
            It's the perfect opportunity to stop by and see us, then head down the street to explore the 
            market and grab a bite to eat.
          </p>
        </section>

        {/* Dog Friendly */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            
            <h2 className={styles.heading}>Dog Friendly</h2>
            <PawPrint size={25} color="var(--text)" />
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            We have a poodle who would love to meet your pup. Feel free to bring your furry friend when you visit.
          </p>
        </section>

        {/* Come Grow With Us */}
        <section className={styles.section}>
          <div className="flex items-center gap-2">
            <h2 className={styles.heading}>Come Grow With Us</h2>
            <hr className={styles.line} />
          </div>
          <p className={styles.text}>
            Whether you're a seasoned gardener or just getting started, we'd love to help you bring more beauty into your space.
          </p>  
        </section>
      </div>
    </div>
  );
}