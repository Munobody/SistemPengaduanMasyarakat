'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('beranda');

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      
      const sections = ['beranda', 'summary', 'form', 'informasi'];
      const scrollPosition = window.scrollY + 100; 
      
      for (let i = sections.length - 1; i >= 0; i--) {
        const section = document.getElementById(sections[i]);
        if (section && section.offsetTop <= scrollPosition) {
          setActiveSection(sections[i]);
          break;
        }
      }
    };

    const heroSection = document.querySelector('section:first-of-type');
    if (heroSection && !document.getElementById('beranda')) {
      heroSection.id = 'beranda';
    }

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (sectionId: string) => {
    setIsOpen(false);
    const section = document.getElementById(sectionId);
    if (section) {
      window.scrollTo({
        top: section.offsetTop - 80, 
        behavior: 'smooth'
      });
    }
  };

  const navItems = [
    { name: 'Beranda', id: 'beranda' },
    { name: 'Instansi', id: 'summary' },
    { name: 'Panduan', id: 'informasi' },
    { name: 'Pengaduan', id: 'form' }
  ];

  return (
    <nav
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[#16404D] shadow-lg py-2' : 'bg-transparent py-4'
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white focus:outline-none md:hidden z-30"
            aria-label="Toggle menu"
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
          <Link href="/" className="flex items-center ml-2 md:ml-0">
            <Image
              src="/assets/logo-usk-putih.png"
              alt="USK Logo"
              width={isScrolled ? 140 : 180}
              height={isScrolled ? 46 : 60}
              className="object-contain transition-all duration-300 w-[120px] h-[40px] md:w-auto md:h-auto"
              priority
            />
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-1 lg:space-x-6">
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className={`px-3 py-2 text-white hover:text-[#79D7BE] font-medium transition-colors relative ${
                activeSection === item.id.toLowerCase() ? 'text-[#79D7BE]' : ''
              }`}
            >
              {item.name}
              {activeSection === item.id.toLowerCase() && (
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#79D7BE] rounded-full"></span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center">
          <a href="/auth/sign-in">
            <button 
              className={`
                px-4 py-2 md:px-6 md:py-3 
                bg-[#087163] text-white rounded-lg 
                text-sm font-medium hover:bg-[#0A5A4D] 
                transition-all duration-300 shadow-lg 
                ${isScrolled ? 'scale-95' : 'scale-100'}
              `}
            >
              Sign in
            </button>
          </a>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`fixed top-0 left-0 h-full w-72 bg-white shadow-lg z-20 transform transition-transform duration-300 ease-in-out md:hidden ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col items-start p-6 mt-16">
          <div className="w-full mb-6 pb-4 border-b border-gray-200">
            <Image
              src="/assets/logo-usk.png"
              alt="USK Logo"
              width={140}
              height={46}
              className="object-contain"
            />
          </div>
          
          {navItems.map((item) => (
            <button
              key={item.name}
              onClick={() => scrollToSection(item.id)}
              className={`w-full text-left py-3 px-2 text-gray-800 hover:text-[#087163] font-medium transition-colors ${
                activeSection === item.id.toLowerCase() ? 'text-[#087163] bg-gray-100 rounded-md' : ''
              }`}
            >
              {item.name}
            </button>
          ))}
          
          <div className="mt-6 w-full">
            <a href="/auth/sign-in" className="block w-full">
              <button className="w-full px-4 py-3 bg-[#087163] text-white rounded-lg text-sm font-medium hover:bg-[#0A5A4D] transition-colors shadow-md">
                Sign in
              </button>
            </a>
          </div>
        </div>
      </div>

      {/* Semi-transparent Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out md:hidden ${
          isOpen ? 'opacity-50' : 'opacity-0 pointer-events-none'
        }`}
        onClick={() => setIsOpen(false)}
      />
    </nav>
  );
}