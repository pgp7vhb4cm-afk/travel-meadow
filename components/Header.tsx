import Link from "next/link";
import { Leaf } from "lucide-react";

export default function Header() {
  return (
    <header className="bg-meadow text-white">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-lg font-medium">
          <Leaf size={20} aria-hidden="true" />
          Travel Meadow
        </Link>
        <nav className="flex items-center gap-4 text-sm text-white/85">
          <Link href="/" className="hover:text-white">
            Discover
          </Link>
          <span className="hidden sm:inline">My trips</span>
          <span className="bg-white/15 px-3 py-1 rounded-full text-white">
            Sign in
          </span>
        </nav>
      </div>
    </header>
  );
}
