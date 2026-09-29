"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { AppRole, CreateBusinessTypeInput, UpdateBusinessTypeInput } from "@/types/business-type";

export interface BusinessTypeFormInitialValues {
  name: string;
  code?: string;
  role_id: number;
  is_active: boolean;
}

interface BusinessTypeFormProps {
  submitLabel: string;
  onSubmit: (data: CreateBusinessTypeInput | UpdateBusinessTypeInput) => Promise<void>;
  onCancel: () => void;
  roles: AppRole[];
  mode?: "create" | "edit";
  initialValues?: BusinessTypeFormInitialValues;
}

const ALLOWED_ROLE_CODES = ["buyer", "seller", "buyer_seller"];

export function BusinessTypeForm({
  submitLabel,
  onSubmit,
  onCancel,
  roles,
  initialValues,
}: BusinessTypeFormProps) {
  const allowedRoles = roles.filter((r) =>
    ALLOWED_ROLE_CODES.includes(r.code?.toLowerCase())
  );
  const displayRoles = allowedRoles.length ? allowedRoles : roles;

  const [name, setName] = useState(initialValues?.name ?? "");
  const [code, setCode] = useState(initialValues?.code ?? "");
  const [roleId, setRoleId] = useState<number>(
    initialValues?.role_id ?? (displayRoles[0]?.id ?? 1)
  );
  const [isActive, setIsActive] = useState<boolean>(initialValues?.is_active ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    const trimmedName = name.trim();
    if (!trimmedName) {
      errs.name = "Business type name is required";
    } else if (trimmedName.length < 2 || trimmedName.length > 100) {
      errs.name = "Name must be between 2 and 100 characters";
    }

    if (!roleId || roleId <= 0) {
      errs.role_id = "Please select a role";
    }

    if (code.trim() && code.trim().length > 50) {
      errs.code = "Code must be at most 50 characters";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        name: name.trim(),
        code: code.trim() ? code.trim().toLowerCase().replace(/\s+/g, "_") : undefined,
        role_id: Number(roleId),
        is_active: isActive,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 text-left p-1">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <label htmlFor="business_type_name" className="text-xs font-semibold text-foreground">
            Business Type Name <span className="text-destructive">*</span>
          </label>
          <Input
            id="business_type_name"
            placeholder="e.g. Manufacturer, Wholesaler, Importer"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) setErrors((prev) => ({ ...prev, name: "" }));
            }}
            disabled={isSubmitting}
            autoFocus
          />
          {errors.name ? <p className="text-xs font-medium text-destructive">{errors.name}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="business_type_role" className="text-xs font-semibold text-foreground">
            Assigned Role <span className="text-destructive">*</span>
          </label>
          <select
            id="business_type_role"
            value={roleId}
            onChange={(e) => {
              setRoleId(Number(e.target.value));
              if (errors.role_id) setErrors((prev) => ({ ...prev, role_id: "" }));
            }}
            disabled={isSubmitting}
            className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            {displayRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.code})
              </option>
            ))}
          </select>
          {errors.role_id ? <p className="text-xs font-medium text-destructive">{errors.role_id}</p> : null}
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label htmlFor="business_type_code" className="text-xs font-semibold text-foreground">
            Code Key
          </label>
          <span className="text-[11px] text-muted-foreground">
            (Optional - auto-generated from name if empty)
          </span>
        </div>
        <Input
          id="business_type_code"
          placeholder="e.g. manufacturer, wholesaler_trader"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            if (errors.code) setErrors((prev) => ({ ...prev, code: "" }));
          }}
          disabled={isSubmitting}
        />
        {errors.code ? <p className="text-xs font-medium text-destructive">{errors.code}</p> : null}
      </div>

      <div className="pt-1">
        <label className="flex cursor-pointer items-center justify-between rounded-lg border border-border bg-muted/40 px-4 py-3 text-sm transition-colors hover:bg-muted/60">
          <div className="space-y-0.5">
            <span className="font-semibold text-foreground">Active Status</span>
            <p className="text-xs text-muted-foreground">
              When active, this business type is available during Buyer/Seller onboarding.
            </p>
          </div>
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-border text-primary focus:ring-2 focus:ring-ring/50"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            disabled={isSubmitting}
          />
        </label>
      </div>

      <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
