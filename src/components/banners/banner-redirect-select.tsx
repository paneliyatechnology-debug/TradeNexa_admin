"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BannerDropdown,
  BannerDropdownMenu,
} from "@/components/banners/banner-dropdown";
import { Loader } from "@/components/ui/loader";
import { categoriesService } from "@/services/categories.service";
import { productsService } from "@/services/products.service";
import type { BannerRedirectType } from "@/types/banner";
import { cn } from "@/utils/cn";
import { Check } from "lucide-react";

interface RedirectOption {
  id: number;
  label: string;
}

interface BannerRedirectSelectProps {
  redirectType: BannerRedirectType;
  value: number | null;
  onChange: (id: number | null) => void;
  error?: string;
}

const PAGE_SIZE = 20;

export function BannerRedirectSelect({
  redirectType,
  value,
  onChange,
  error,
}: BannerRedirectSelectProps) {
  const [open, setOpen] = useState(false);
  const [options, setOptions] = useState<RedirectOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [fallbackLabel, setFallbackLabel] = useState<string | null>(null);

  const fetchPage = useCallback(
    async (pageNum: number) => {
      if (redirectType === "category") {
        const data = await categoriesService.getCategories({
          page: pageNum,
          limit: PAGE_SIZE,
          is_active: true,
          sort_by: "name",
          sort_order: "asc",
        });

        return {
          items: data.results.map((category) => ({
            id: category.id,
            label: category.name,
          })),
          hasMore: pageNum < data.pagination.totalPages,
        };
      }

      const data = await productsService.getProducts({
        page: pageNum,
        limit: PAGE_SIZE,
        sort_by: "name",
        sort_order: "asc",
      });

      return {
        items: data.results.map((product) => ({
          id: product.id,
          label: product.name,
        })),
        hasMore: pageNum < data.pagination.totalPages,
      };
    },
    [redirectType]
  );

  const loadFirstPage = useCallback(async () => {
    setLoading(true);
    try {
      const result = await fetchPage(1);
      setOptions(result.items);
      setPage(1);
      setHasMore(result.hasMore);
    } catch {
      setOptions([]);
      setPage(1);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    const nextPage = page + 1;
    setLoadingMore(true);
    try {
      const result = await fetchPage(nextPage);
      setOptions((current) => {
        const existingIds = new Set(current.map((item) => item.id));
        const nextItems = result.items.filter((item) => !existingIds.has(item.id));
        return [...current, ...nextItems];
      });
      setPage(nextPage);
      setHasMore(result.hasMore);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  useEffect(() => {
    setOpen(false);
    setFallbackLabel(null);

    if (!redirectType) {
      setOptions([]);
      setPage(1);
      setHasMore(false);
      return;
    }

    void loadFirstPage();
  }, [redirectType, loadFirstPage]);

  useEffect(() => {
    if (!value) {
      setFallbackLabel(null);
      return;
    }

    const selected = options.find((option) => option.id === value);
    if (selected) {
      setFallbackLabel(null);
      return;
    }

    setFallbackLabel(
      redirectType === "category" ? `Category #${value}` : `Product #${value}`
    );
  }, [value, options, redirectType]);

  const selectedLabel =
    options.find((option) => option.id === value)?.label ?? fallbackLabel;

  const placeholder = !redirectType
    ? "Select redirect type first"
    : redirectType === "category"
      ? "Select a category"
      : "Select a product";

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const element = event.currentTarget;
    const nearBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 32;

    if (nearBottom) {
      void loadMore();
    }
  };

  return (
    <BannerDropdown
      label="Redirected To"
      placeholder={placeholder}
      selectedLabel={selectedLabel}
      open={open}
      onOpenChange={setOpen}
      error={error}
      disabled={!redirectType}
    >
      {redirectType ? (
        <BannerDropdownMenu onScroll={handleScroll}>
            {loading && options.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader size="sm" />
              </div>
            ) : options.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-muted-foreground">
                No {redirectType === "category" ? "categories" : "products"} found.
              </p>
            ) : (
              options.map((option) => {
                const isSelected = option.id === value;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => {
                      onChange(option.id);
                      setOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition-colors",
                      isSelected
                        ? "bg-primary/10 text-primary"
                        : "hover:bg-accent hover:text-foreground"
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {isSelected ? <Check className="h-4 w-4 shrink-0" /> : null}
                  </button>
                );
              })
            )}

            {loadingMore ? (
              <div className="flex items-center justify-center py-3">
                <Loader size="sm" />
              </div>
            ) : null}
        </BannerDropdownMenu>
      ) : null}
    </BannerDropdown>
  );
}
