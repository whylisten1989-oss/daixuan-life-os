"use client";

import type { HTMLAttributes, PointerEvent as ReactPointerEvent } from "react";
import { cn } from "@/lib/utils";

export function PointerSpotlight({
  className,
  onPointerMove,
  ...props
}: HTMLAttributes<HTMLDivElement>) {
  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    event.currentTarget.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    event.currentTarget.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
    onPointerMove?.(event);
  };

  return <div className={cn(className)} onPointerMove={handlePointerMove} {...props} />;
}
