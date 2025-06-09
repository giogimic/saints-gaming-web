'use client';

import Link from 'next/link';
import { ThemeToggle } from '@/components/theme-toggle';
import { MainNav } from '@/components/main-nav';
import Image from 'next/image';

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <Image src="/saintsgaming-logo.png" alt="Saints Gaming Logo" width={48} height={48} className="rounded" />
            <span className="font-bold">SaintsGaming.net</span>
          </Link>
        </div>
        <MainNav />
        <div className="flex flex-1 items-center justify-end space-x-2">
          <nav className="flex items-center">
            <ThemeToggle />
          </nav>
        </div>
        <div className="flex gap-4 items-center">
          <a href="https://discord.saintsgaming.net" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded font-semibold transition">Join Discord</a>
          <a href="https://curseforge.com/minecraft/modpacks/saints-gaming/" target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-gray-800 hover:bg-green-500 text-green-400 hover:text-white rounded font-semibold transition">Get Modpack</a>
        </div>
      </div>
    </header>
  );
} 