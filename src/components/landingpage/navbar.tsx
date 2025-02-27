'use client';

import React from 'react';
import Link from 'next/link';
import Image from "next/image";

export function Navbar() {
  const navItems = ['Beranda','Jumlah Pengaduan', 'Panduan SIPL', 'Pengaduan'];

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-transparent">
        <Link href="/" className="flex items-center ml-20">
            <Image 
                src="/assets/logo-usk-putih.png"  // Update with your actual logo path
                alt="Company Logo" 
                width={160}  // Adjust width as needed
                height={52}  // Adjust height as needed
                className="object-contain"
            />
      </Link>

      {/* Nav Items - Center */}
      <div className="flex space-x-6">
        {navItems.map((item) => (
          <Link
            key={item}
            href={`/${item.toLowerCase()}`}
            className="text-white hover:text-[#79D7BE] font-medium transition-colors"
          >
            {item}
          </Link>
        ))}
      </div>
      <div>
        <a href="/dashboard">
          <button className="px-8 py-4 bg-[#79D7BE] text-white rounded-xl text-sm font-medium hover:bg-[#3A4F6A] transition-colors shadow-2xl mr-20">
            Sign in
          </button>
        </a>
      </div>
    </nav>
  );
}