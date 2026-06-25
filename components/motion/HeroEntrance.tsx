"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { motionDuration, motionEase } from "@/lib/motion";

interface HeroEntranceProps {
  children: ReactNode;
}

export default function HeroEntrance({ children }: HeroEntranceProps) {
  const shouldReduceMotion = useReducedMotion();

  if (shouldReduceMotion) {
    return children;
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 1.02 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        duration: motionDuration.slow,
        ease: motionEase,
      }}
    >
      {children}
    </motion.div>
  );
}
