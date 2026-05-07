import type { InputHTMLAttributes, ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SettingsSectionCard({
  icon,
  title,
  children,
  actions,
  className,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <div className="flex items-center justify-between gap-4 border-b px-7 py-6">
        <div className="flex min-w-0 items-center gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
            {icon}
          </span>
          <h2 className="truncate text-2xl font-extrabold tracking-normal">{title}</h2>
        </div>
        {actions}
      </div>
      <div className="p-7">{children}</div>
    </Card>
  );
}

export function ProfileSectionCard({
  icon,
  title,
  children,
  className,
}: {
  icon: ReactNode;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-center gap-4 border-b pb-4">
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-blue-50 text-primary">
          {icon}
        </span>
        <h2 className="text-2xl font-extrabold tracking-normal">{title}</h2>
      </div>
      <div className="pt-6">{children}</div>
    </Card>
  );
}

export function FormLabel({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-semibold text-foreground">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted-foreground">{hint}</span> : null}
    </label>
  );
}

export function MaskedSecretInput({
  visible,
  onToggleVisible,
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement> & {
  visible: boolean;
  onToggleVisible: () => void;
}) {
  return (
    <div className="relative">
      <Input
        type={visible ? "text" : "password"}
        className={cn("pr-12 font-mono tracking-[0.12em]", className)}
        {...props}
      />
      <IconButton
        type="button"
        icon={visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        label={visible ? "Hide secret" : "Show secret"}
        className="absolute right-1 top-1 h-10 w-10 border-0 bg-transparent text-muted-foreground hover:bg-transparent hover:text-primary"
        onClick={onToggleVisible}
      />
    </div>
  );
}

export function ToggleSwitch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        "flex h-8 w-16 items-center rounded-full border p-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        checked ? "border-primary bg-primary" : "border-border bg-muted",
      )}
    >
      <span
        className={cn(
          "h-6 w-6 rounded-full bg-white shadow-sm transition-transform",
          checked && "translate-x-8",
        )}
      />
    </button>
  );
}

export function IntegrationCard({
  icon,
  title,
  description,
  children,
  tone = "blue",
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
  tone?: "blue" | "amber" | "red";
}) {
  return (
    <div className="rounded-md border bg-white/90 p-5">
      <div className="grid gap-5 lg:grid-cols-[1fr_minmax(260px,0.95fr)] lg:items-center">
        <div className="flex items-center gap-5">
          <span
            className={cn(
              "flex h-14 w-14 shrink-0 items-center justify-center rounded-md",
              tone === "blue" && "bg-blue-50 text-primary",
              tone === "amber" && "bg-amber-50 text-warning-foreground",
              tone === "red" && "bg-red-50 text-destructive",
            )}
          >
            {icon}
          </span>
          <div>
            <h3 className="text-xl font-extrabold">{title}</h3>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function InlineNotice({
  tone = "blue",
  children,
}: {
  tone?: "blue" | "green" | "amber" | "red";
  children: ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-md border px-4 py-3 text-sm leading-6",
        tone === "blue" && "border-blue-100 bg-blue-50 text-primary",
        tone === "green" && "border-emerald-100 bg-emerald-50 text-success-foreground",
        tone === "amber" && "border-amber-100 bg-amber-50 text-warning-foreground",
        tone === "red" && "border-red-100 bg-red-50 text-destructive",
      )}
    >
      {children}
    </div>
  );
}

export function ActionFooter({
  cancelLabel,
  saveLabel,
  onCancel,
  onSave,
  disabled,
}: {
  cancelLabel: string;
  saveLabel: string;
  onCancel: () => void;
  onSave: () => void;
  disabled?: boolean;
}) {
  return (
    <div className="mt-7 flex justify-end gap-4">
      <Button type="button" variant="secondary" size="lg" className="min-w-36" onClick={onCancel}>
        {cancelLabel}
      </Button>
      <Button type="button" size="lg" className="min-w-44" onClick={onSave} disabled={disabled}>
        {saveLabel}
      </Button>
    </div>
  );
}
