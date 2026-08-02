"use client";

import { animate, motion, useMotionValue, useTransform } from "motion/react";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

type SpringNumberProps = {
  value: number;
  className?: string;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  hidden?: boolean;
};

export function SpringNumber({
  value,
  className,
  decimals = 0,
  prefix = "",
  suffix = "",
  hidden = false,
}: SpringNumberProps) {
  const motionValue = useMotionValue(0);
  const display = useTransform(motionValue, (current) => {
    return `${prefix}${current.toLocaleString("zh-CN", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    })}${suffix}`;
  });

  useEffect(() => {
    const controls = animate(motionValue, value, {
      type: "spring",
      stiffness: 105,
      damping: 24,
      mass: 0.8,
    });
    return () => controls.stop();
  }, [motionValue, value]);

  if (hidden) {
    return <span className={cn("numeric tabular-nums", className)}>••••</span>;
  }

  return <motion.span className={cn("numeric tabular-nums", className)}>{display}</motion.span>;
}
