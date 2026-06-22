"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { ChevronDown } from "lucide-react";

function HeroScrollHint() {
  return (
    <div className="hero-scroll-hint" aria-hidden>
      <motion.div
        animate={{ y: [0, 8, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
        className="flex flex-col items-center gap-2 text-white/40"
        style={{ willChange: "transform" }}
      >
        <span className="font-display text-xs tracking-[0.18em]">גללו למטה</span>
        <ChevronDown className="h-5 w-5" />
      </motion.div>
    </div>
  );
}

export default memo(HeroScrollHint);
