import Image from "next/image";
import { cn } from "@/utils/cn";

export const LOGO_SRC = "/tradenexa-logo.png";

interface LogoProps {
  variant?: "full" | "sidebar" | "collapsed";
  className?: string;
  priority?: boolean;
}

export function Logo({
  variant = "full",
  className,
  priority = false,
}: LogoProps) {
  if (variant === "full") {
    return (
      <Image
        src={LOGO_SRC}
        alt="TradeNexa"
        width={220}
        height={220}
        priority={priority}
        className={cn("h-auto w-52 object-contain", className)}
      />
    );
  }

  if (variant === "sidebar") {
    return (
      <Image
        src={LOGO_SRC}
        alt="TradeNexa"
        width={160}
        height={56}
        priority={priority}
        className={cn("h-11 w-auto max-w-[200px] object-contain object-left", className)}
      />
    );
  }

  return (
    <Image
      src={LOGO_SRC}
      alt="TradeNexa"
      width={56}
      height={56}
      priority={priority}
      className={cn(
        "h-auto w-full max-w-[52px] object-contain object-center",
        className
      )}
    />
  );
}
