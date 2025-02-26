"use client";
import React from "react";
import { ColourfulText } from "../ui/colourful-text";
import { motion } from "motion/react";

export function ColourfulTextDemo() {
  return (
    <div className=" flex items-center justify-center relative overflow-hidden">
      <h1 className="text-2xl md:text-5xl lg:text-7xl font-bold text-center text-black relative z-2 font-sans">
        Sistem  <ColourfulText text="Pengaduan & Pelaporan" /> <br /> Masyarakat USK
      </h1>
    </div>
  );
}
