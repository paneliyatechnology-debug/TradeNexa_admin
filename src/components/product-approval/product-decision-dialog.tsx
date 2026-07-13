"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, MessageSquareWarning, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { ProductReviewItem } from "@/types/product";
import {
  productApproveSchema,
  productDecisionRemarksSchema,
  type ProductApproveFormData,
  type ProductDecisionRemarksFormData,
} from "@/utils/validators";
import { cn } from "@/utils/cn";

export type ProductDecisionAction = "approve" | "request_revision" | "reject";

interface ProductDecisionDialogProps {
  open: boolean;
  action: ProductDecisionAction | null;
  products: ProductReviewItem[];
  loading?: boolean;
  onClose: () => void;
  onSubmit: (remarks?: string) => void | Promise<void>;
}

const ACTION_CONFIG: Record<
  ProductDecisionAction,
  {
    title: string;
    description: (count: number) => string;
    submitLabel: string;
    remarksRequired: boolean;
    remarksLabel: string;
    remarksPlaceholder: string;
    icon: typeof CheckCircle2;
    submitVariant: "primary" | "danger";
  }
> = {
  approve: {
    title: "Approve products",
    description: (count) =>
      count === 1
        ? "Approve this listing for the marketplace."
        : `Approve ${count} listings for the marketplace.`,
    submitLabel: "Approve",
    remarksRequired: false,
    remarksLabel: "Remarks (optional)",
    remarksPlaceholder:
      "Approved — listing meets marketplace guidelines.",
    icon: CheckCircle2,
    submitVariant: "primary",
  },
  request_revision: {
    title: "Request revision",
    description: (count) =>
      count === 1
        ? "Ask the seller to update this listing before re-review."
        : `Ask sellers to update ${count} listings before re-review.`,
    submitLabel: "Request revision",
    remarksRequired: true,
    remarksLabel: "Remarks",
    remarksPlaceholder:
      "Please update product images and clarify MOQ pricing.",
    icon: MessageSquareWarning,
    submitVariant: "primary",
  },
  reject: {
    title: "Reject products",
    description: (count) =>
      count === 1
        ? "Permanently reject this listing. The seller cannot resubmit."
        : `Permanently reject ${count} listings. Sellers cannot resubmit.`,
    submitLabel: "Reject",
    remarksRequired: true,
    remarksLabel: "Remarks",
    remarksPlaceholder:
      "Rejected due to prohibited category / policy violation.",
    icon: XCircle,
    submitVariant: "danger",
  },
};

export function ProductDecisionDialog({
  open,
  action,
  products,
  loading = false,
  onClose,
  onSubmit,
}: ProductDecisionDialogProps) {
  const config = action ? ACTION_CONFIG[action] : null;
  const remarksRequired = config?.remarksRequired ?? true;

  const approveForm = useForm<ProductApproveFormData>({
    resolver: zodResolver(productApproveSchema),
    defaultValues: { remarks: "" },
    mode: "onTouched",
  });

  const remarksForm = useForm<ProductDecisionRemarksFormData>({
    resolver: zodResolver(productDecisionRemarksSchema),
    defaultValues: { remarks: "" },
    mode: "onTouched",
  });

  useEffect(() => {
    if (!open) return;
    approveForm.reset({ remarks: "" });
    remarksForm.reset({ remarks: "" });
  }, [open, action, approveForm, remarksForm]);

  if (!config || !action) return null;

  const Icon = config.icon;
  const count = products.length;
  const extraCount = Math.max(0, count - 3);

  const handleApproveSubmit = approveForm.handleSubmit(async (data) => {
    const remarks = data.remarks?.trim();
    await onSubmit(remarks || undefined);
  });

  const handleRemarksSubmit = remarksForm.handleSubmit(async (data) => {
    await onSubmit(data.remarks.trim());
  });

  const formId = `product-decision-${action}`;
  const remarksError = remarksRequired
    ? remarksForm.formState.errors.remarks?.message
    : approveForm.formState.errors.remarks?.message;
  const remarksValue = remarksRequired
    ? remarksForm.watch("remarks")
    : (approveForm.watch("remarks") ?? "");
  const remarksLength = remarksValue.length;

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!loading) onClose();
      }}
      title={config.title}
      description={config.description(count)}
      icon={<Icon className="h-5 w-5" />}
      className="w-full max-w-lg"
    >
      <form
        id={formId}
        onSubmit={remarksRequired ? handleRemarksSubmit : handleApproveSubmit}
        className="space-y-4 px-5 py-5 sm:px-6"
      >
        <div className="rounded-xl border border-border bg-muted/20 px-3 py-2.5">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Selected
          </p>
          <ul className="mt-1.5 space-y-1 text-sm text-foreground">
            {products.slice(0, 3).map((product) => (
              <li key={product.id} className="truncate font-medium">
                {product.name}
              </li>
            ))}
            {extraCount > 0 ? (
              <li className="text-muted-foreground">and {extraCount} more…</li>
            ) : null}
          </ul>
        </div>

        <div>
          <label
            htmlFor={`${formId}-remarks`}
            className="mb-1.5 block text-sm font-medium text-foreground"
          >
            {config.remarksLabel}
            {remarksRequired ? (
              <span className="text-destructive"> *</span>
            ) : null}
          </label>
          <textarea
            id={`${formId}-remarks`}
            rows={4}
            placeholder={config.remarksPlaceholder}
            disabled={loading}
            className={cn(
              "w-full resize-y rounded-xl border bg-background px-3 py-2.5 text-sm",
              "placeholder:text-muted-foreground/70",
              "focus:border-primary/50 focus:outline-none focus:ring-2 focus:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-60",
              remarksError ? "border-destructive" : "border-border"
            )}
            {...(remarksRequired
              ? remarksForm.register("remarks")
              : approveForm.register("remarks"))}
          />
          <div className="mt-1.5 flex items-start justify-between gap-2">
            <p
              className={cn(
                "text-xs",
                remarksError ? "text-destructive" : "text-muted-foreground"
              )}
            >
              {remarksError ??
                (remarksRequired
                  ? "Minimum 10 characters."
                  : "Optional. Minimum 10 characters if provided.")}
            </p>
            <p className="shrink-0 text-xs text-muted-foreground">
              {remarksLength}/2000
            </p>
          </div>
        </div>

        <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="h-11 rounded-xl"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant={config.submitVariant}
            loading={loading}
            className="h-11 rounded-xl"
          >
            {config.submitLabel}
            {count > 1 ? ` (${count})` : ""}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
