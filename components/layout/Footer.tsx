import Link from "next/link";
import { Instagram, Facebook } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto bg-[var(--footer)] border-t border-gray-300">
      <div className="mx-auto px-6 md:px-8  py-4 md:py-5">
        <div className="flex items-center justify-between">
          {/*left*/}
          <div className="text-[var(--text)] font-medium text-sm md:text-base">
            Beacon Street Gardens{" "}
            <span className="text-xs font-normal">LLC</span>
          </div>

          {/*right*/}
          <div className="flex items-center gap-2 md:gap-4 text-[var(--text)] text-sm md:text-base">
            <Link
              href="/contact"
              className="hover:text-[var(--rust)] transition-colors "
            >
              Contact
            </Link>
            <span className="text-gray-400">|</span>
            <span className="hidden md:inline">Follow Us</span>
            <a
              href="https://www.instagram.com/crfrencho/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--rust)] transition-colors flex items-center"
            >
              <Instagram size={16} className="md:w-5 md:h-5"/>
            </a>
            <a
              href="https://www.instagram.com/crfrencho/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-[var(--rust)] transition-colors flex items-center"
            >
              <Facebook size={16} className="md:w-5 md:h-5"/>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
