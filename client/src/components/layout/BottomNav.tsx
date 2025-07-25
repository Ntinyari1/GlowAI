import { Link } from "wouter";
import { User, Lightbulb, BookOpen } from "lucide-react";

export default function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 w-full z-40 bg-white/95 backdrop-blur-md border-t border-glow-lavender/40 shadow-2xl flex justify-around items-center h-16 md:hidden animate-fade-in-up">
      <Link href="/dashboard" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7m-9 2v8m4-8v8m5 0a2 2 0 002-2V7a2 2 0 00-2-2h-3.5a2 2 0 00-2 2v1" /></svg>
        <span className="text-xs">Home</span>
      </Link>
      <Link href="/routine" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 17l4 4 4-4m0-5V3m-8 9v6a2 2 0 002 2h4a2 2 0 002-2v-6" /></svg>
        <span className="text-xs">Routine</span>
      </Link>
      <Link href="/tips" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <Lightbulb className="w-6 h-6 mb-1" />
        <span className="text-xs">Tips</span>
      </Link>
      <Link href="/blog" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <BookOpen className="w-6 h-6 mb-1" />
        <span className="text-xs">Blog</span>
      </Link>
      <Link href="/products" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 21V7a2 2 0 00-2-2H6a2 2 0 00-2 2v14m16 0H4" /></svg>
        <span className="text-xs">Products</span>
      </Link>
      <Link href="/profile" className="flex flex-col items-center flex-1 py-2 text-glow-purple hover:text-glow-pink transition">
        <User className="w-6 h-6 mb-1" />
        <span className="text-xs">Profile</span>
      </Link>
    </nav>
  );
}
