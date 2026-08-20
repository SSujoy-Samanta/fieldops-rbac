"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  UserPlus,
  Crown,
  ShieldCheck,
  User,
  Copy,
  Check,
  Key,
  Loader2,
  Lock,
} from "lucide-react";
import { SYSTEM_ROLE } from "@/types/rbac";
import { useCreateUser } from "@/hooks/useUsers";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface CreateUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserRole?: SYSTEM_ROLE;
}

export function CreateUserModal({
  isOpen,
  onClose,
  currentUserRole,
}: CreateUserModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<SYSTEM_ROLE>(SYSTEM_ROLE.FIELD_EMPLOYEE);
  const [createdCredentials, setCreatedCredentials] = useState<{
    email: string;
    temporaryPassword?: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const { mutateAsync: createUser, isPending } = useCreateUser();

  const isOwner = currentUserRole === SYSTEM_ROLE.OWNER;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      toast.error("Please enter both staff name and email address.");
      return;
    }

    try {
      const res = await createUser({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        role,
      });

      setCreatedCredentials({
        email: res.email,
        temporaryPassword: res.temporaryPassword,
      });
    } catch {
      // Error handled by mutation toast
    }
  };

  const handleCopyPassword = () => {
    if (createdCredentials?.temporaryPassword) {
      navigator.clipboard.writeText(createdCredentials.temporaryPassword);
      setCopied(true);
      toast.success("Temporary password copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleResetAndClose = () => {
    setName("");
    setEmail("");
    setRole(SYSTEM_ROLE.FIELD_EMPLOYEE);
    setCreatedCredentials(null);
    setCopied(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleResetAndClose()}>
      <DialogContent
        className={cn(
          "w-[calc(100%-2rem)] sm:max-w-[520px] rounded-2xl p-0 overflow-hidden gap-0",
          "max-h-[92vh] flex flex-col border border-border/80 shadow-2xl bg-card"
        )}
      >
        {/* ── Top Brand Gradient Bar ───────────────────────────────── */}
        <div className="h-1.5 w-full bg-gradient-to-r from-orange-500/40 via-orange-500 to-amber-500/40 shrink-0" />

        {createdCredentials ? (
          /* ── Success State: Display Temporary Password ─────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Live Preview Strip */}
            <div className="flex items-center gap-3 px-6 py-4 shrink-0 bg-muted/30 dark:bg-muted/10 border-b border-border/60">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-500 text-white shadow-md shadow-emerald-500/30 shrink-0">
                <Key className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Account Provisioned
                </p>
                <p className="text-sm font-black text-foreground truncate">
                  {createdCredentials.email}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                  Active
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <DialogHeader className="p-0 space-y-1">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Workforce Member <span className="text-orange-500">Created</span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Account has been registered and fine-grained permissions have been assigned.
                </DialogDescription>
              </DialogHeader>

              <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4.5 flex flex-col gap-2.5">
                <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Temporary Login Password</span>
                </div>

                <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-background/90 border border-border/80 font-mono text-sm font-bold text-foreground shadow-2xs">
                  <span className="select-all truncate">
                    {createdCredentials.temporaryPassword}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={handleCopyPassword}
                    className="h-8 px-2.5 text-xs font-semibold cursor-pointer shrink-0 hover:bg-muted rounded-md"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-emerald-500 mr-1" />
                    ) : (
                      <Copy className="h-4 w-4 mr-1" />
                    )}
                    <span>{copied ? "Copied" : "Copy"}</span>
                  </Button>
                </div>

                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Share this temporary credential securely with the staff member. They will be prompted to verify credentials upon first login.
                </p>
              </div>
            </div>

            <DialogFooter className="p-6 pt-0 border-t-0">
              <Button
                type="button"
                onClick={handleResetAndClose}
                className="w-full h-10 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-sm cursor-pointer shadow-md shadow-orange-500/20"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          /* ── Creation Form ─────────────────────────────────────────────── */
          <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
            {/* Live Preview Strip */}
            <div className="flex items-center gap-3 px-6 py-4 shrink-0 bg-muted/30 dark:bg-muted/10 border-b border-border/60">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-orange-500 text-white shadow-md shadow-orange-500/30 shrink-0">
                <UserPlus className="w-5 h-5 stroke-[2.2]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                  Staff Provisioning
                </p>
                <p className="text-sm font-black text-foreground truncate">
                  {email || "Enter employee email…"}
                </p>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 shrink-0">
                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">
                  NIST RBAC
                </span>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              <DialogHeader className="p-0 space-y-1 text-left">
                <DialogTitle className="text-xl sm:text-2xl font-black tracking-tight text-foreground">
                  Add <span className="text-orange-500">Member</span>
                </DialogTitle>
                <DialogDescription className="text-xs sm:text-sm text-muted-foreground">
                  Grant operational access and provision NIST RBAC role tiers.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Full Name */}
                <div className="space-y-1.5">
                  <Label htmlFor="user-name" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5 flex items-center gap-1">
                    <span>Full Name</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="user-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Alex Morgan"
                    required
                    className="h-10 text-xs sm:text-sm rounded-lg bg-background/80 border-border/80 focus:border-orange-500/60"
                  />
                </div>

                {/* Work Email */}
                <div className="space-y-1.5">
                  <Label htmlFor="user-email" className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5 flex items-center gap-1">
                    <span>Work Email</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </Label>
                  <Input
                    id="user-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. alex@fieldops.io"
                    required
                    className="h-10 text-xs sm:text-sm rounded-lg bg-background/80 border-border/80 focus:border-orange-500/60"
                  />
                </div>

                {/* Role Selection */}
                <div className="space-y-2">
                  <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-0.5 flex items-center gap-1">
                    <span>Operational Role Tier</span>
                    <span className="text-rose-500 font-bold">*</span>
                  </Label>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                    {/* Field Employee */}
                    <button
                      type="button"
                      onClick={() => setRole(SYSTEM_ROLE.FIELD_EMPLOYEE)}
                      className={cn(
                        "flex flex-col items-center text-center p-3.5 rounded-lg border text-xs transition-all cursor-pointer",
                        role === SYSTEM_ROLE.FIELD_EMPLOYEE
                          ? "border-emerald-500/80 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 font-bold ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <User className="h-5 w-5 mb-1.5 text-emerald-500" />
                      <span className="font-bold">Field Staff</span>
                      <span className="text-[10px] font-normal opacity-75 mt-0.5">
                        Shifts & Visits
                      </span>
                    </button>

                    {/* Operations Manager */}
                    <button
                      type="button"
                      onClick={() => isOwner && setRole(SYSTEM_ROLE.MANAGER)}
                      disabled={!isOwner}
                      className={cn(
                        "flex flex-col items-center text-center p-3.5 rounded-lg border text-xs transition-all",
                        isOwner ? "cursor-pointer" : "opacity-50 cursor-not-allowed",
                        role === SYSTEM_ROLE.MANAGER
                          ? "border-indigo-500/80 bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 font-bold ring-2 ring-indigo-500/20 shadow-xs"
                          : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <ShieldCheck className="h-5 w-5 mb-1.5 text-indigo-500" />
                      <span className="font-bold">Manager</span>
                      <span className="text-[10px] font-normal opacity-75 mt-0.5">
                        {isOwner ? "Audits & Teams" : "Owner Only"}
                      </span>
                    </button>

                    {/* Owner (Only if current user is owner) */}
                    {isOwner && (
                      <button
                        type="button"
                        onClick={() => setRole(SYSTEM_ROLE.OWNER)}
                        className={cn(
                          "flex flex-col items-center text-center p-3.5 rounded-lg border text-xs transition-all cursor-pointer",
                          role === SYSTEM_ROLE.OWNER
                            ? "border-amber-500/80 bg-amber-500/10 text-amber-700 dark:text-amber-300 font-bold ring-2 ring-amber-500/20 shadow-xs"
                            : "border-border/60 bg-muted/20 text-muted-foreground hover:bg-muted/50 hover:border-border"
                        )}
                      >
                        <Crown className="h-5 w-5 mb-1.5 text-amber-500" />
                        <span className="font-bold">Owner</span>
                        <span className="text-[10px] font-normal opacity-75 mt-0.5">
                          Full Matrix
                        </span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="p-4 sm:p-6 border-t border-border/60 bg-muted/20 flex items-center justify-end gap-3 shrink-0">
              <Button
                type="button"
                variant="ghost"
                onClick={handleResetAndClose}
                disabled={isPending}
                className="rounded-lg text-xs font-semibold cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="h-10 px-5 text-xs font-bold rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md shadow-orange-500/20 cursor-pointer active:scale-95 transition-all"
              >
                {isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-1.5" />
                    <span>Provisioning…</span>
                  </>
                ) : (
                  <>
                    <UserPlus className="h-4 w-4 mr-1.5" />
                    <span>Provision Member</span>
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default CreateUserModal;
