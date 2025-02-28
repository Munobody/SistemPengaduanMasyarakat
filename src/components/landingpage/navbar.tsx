'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = ['Beranda', 'Jumlah Pengaduan', 'Panduan SIPL', 'Pengaduan'];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#087163] shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center">
          {/* Hamburger Menu for Mobile */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none md:hidden z-30"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
          <Link href="/" className="flex items-center ml-4 md:ml-20">
            <Image
              src="/assets/logo-usk-putih.png"
              alt="Company Logo"
              width={160}
              height={52}
              className="object-contain transition-all duration-300 md:w-[160px] md:h-[52px] w-[120px] h-[40px]"
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
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

        <div className="flex items-center">
          <a href="/dashboard">
            <button className="px-4 py-2 md:px-8 md:py-4 bg-[#087163] text-white rounded-xl text-sm font-medium hover:bg-[#0A5A4D] transition-colors shadow-2xl mr-4 md:mr-20">
              Sign in
            </button>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-start space-y-4 p-6 mt-16">
          {navItems.map((item) => (
            <Link
              key={item}
              href={`/${item.toLowerCase()}`}
              className="text-black hover:text-[#79D7BE] font-medium transition-colors"
              onClick={() => setIsOpen(false)}
            >
              {item}
            </Link>
          ))}
        </div>
      </div>

      {/* Semi-transparent Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out md:hidden ${
          isOpen ? 'opacity-30' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  );
}
