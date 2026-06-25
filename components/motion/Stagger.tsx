"use client";

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type MotionProps,
} from "framer-motion";
import type { ElementType, ReactNode } from "react";
import { motionDuration, motionEase, motionViewport } from "@/lib/motion";

const containerVariants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: motionDuration.base,
      ease: motionEase,
    },
  },
};

type MotionElement = keyof typeof motion;

interface StaggerProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  as?: MotionElement;
}

export function Stagger({
  children,
  className,
  as = "div",
  ...rest
}: StaggerProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as as ElementType;

  if (shouldReduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag
      className={className}
      variants={containerVariants}
      initial="hidden"
      whileInView="show"
      viewport={motionViewport}
      {...(rest as MotionProps)}
    >
      {children}
    </MotionTag>
  );
}

interface StaggerItemProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children: ReactNode;
  as?: MotionElement;
}

export function StaggerItem({
  children,
  className,
  as = "div",
  ...rest
}: StaggerItemProps) {
  const shouldReduceMotion = useReducedMotion();
  const Tag = as as ElementType;

  if (shouldReduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  const MotionTag = motion.create(Tag);

  return (
    <MotionTag className={className} variants={itemVariants} {...(rest as MotionProps)}>
      {children}
    </MotionTag>
  );
}
