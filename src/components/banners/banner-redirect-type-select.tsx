"use client";

import { useState } from "react";
import {
  BannerDropdown,
  BannerDropdownMenu,
} from "@/components/banners/banner-dropdown";
import type { BannerRedirectType } from "@/types/banner";
import { BANNER_REDIRECT_TYPES } from "@/utils/validators";
import { Check } from "lucide-react";
import { cn } from "@/utils/cn";

interface BannerRedirectTypeSelectProps {
  value: BannerRedirectType;
  onChange: (value: BannerRedirectType) => void;
  error?: string;
}

const REDIRECT_TYPE_LABELS: Record<(typeof BANNER_REDIRECT_TYPES)[number], string> = {
  category: "Category",
  product: "Product",
};

export function BannerRedirectTypeSelect({
  value,
  onChange,
  error,
}: BannerRedirectTypeSelectProps) {
  const [open, setOpen] = useState(false);

  const selectedLabel = value ? REDIRECT_TYPE_LABELS[value] : null;

  return (
    <BannerDropdown
      label="Redirect Type"
      placeholder="Select redirect type"
      selectedLabel={selectedLabel}
      open={open}
      onOpenChange={setOpen}
      error={error}
    >
      <BannerDropdownMenu>
        {BANNER_REDIRECT_TYPES.map((type) => {
          const isSelected = value === type;

          return (
            <button
              key={type}
              type="button"
              onClick={() => {
                onChange(type);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                isSelected
                  ? "bg-primary/10 text-primary"
                  : "hover:bg-accent hover:text-foreground"
              )}
            >
              <span className="truncate">{REDIRECT_TYPE_LABELS[type]}</span>
              {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
            </button>
          );
        })}
      </BannerDropdownMenu>
    </BannerDropdown>
  );
}
