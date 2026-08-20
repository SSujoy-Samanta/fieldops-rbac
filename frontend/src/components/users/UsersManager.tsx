"use client";

import React, { useState, useEffect } from "react";
import { Users, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useUsers } from "@/hooks/useUsers";
import { useRoles } from "@/hooks/useRoles";
import { useUser } from "@/hooks/useUser";
import { usePermissions } from "@/hooks/usePermissions";
import { UsersStats } from "./UsersStats";
import { UsersFilters } from "./UsersFilters";
import { UsersTable } from "./UsersTable";
import { UsersStatsSkeleton } from "./UsersSkeleton";
import { CreateUserModal } from "./CreateUserModal";
import { UserDetailDrawer } from "./UserDetailDrawer";
import { UserRoleModal } from "./UserRoleModal";
import { UserStatusModal } from "./UserStatusModal";
import type { UserListItem } from "@/types/user";
import { SYSTEM_ROLE, PERMISSION_KEY } from "@/types/rbac";
import { RequirePermission } from "@/components/RequirePermission";

export function UsersManager() {
  return (
    <RequirePermission permission={PERMISSION_KEY.MANAGE_USERS}>
      <UsersManagerContent />
    </RequirePermission>
  );
}

function UsersManagerContent() {
  const { user: currentUser } = useUser();
  const { roleName: currentUserRole, can } = usePermissions();

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [selectedRole, setSelectedRole] = useState<SYSTEM_ROLE | undefined>(
    undefined
  );
  const [selectedStatus, setSelectedStatus] = useState<boolean | undefined>(
    undefined
  );
  const [page, setPage] = useState(1);

  // Modal / Drawer States
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [inspectUser, setInspectUser] = useState<UserListItem | null>(null);
  const [roleChangeUser, setRoleChangeUser] = useState<UserListItem | null>(null);
  const [statusChangeUser, setStatusChangeUser] = useState<UserListItem | null>(
    null
  );

  // Debounce search term by 350ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 350);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch Users with active filters
  const { data, isLoading, isFetching } = useUsers({
    page,
    limit: 10,
    search: debouncedSearch || undefined,
    role: selectedRole,
    isActive: selectedStatus,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Fetch Roles for stats counters
  const { data: roles, isLoading: isRolesLoading } = useRoles();

  const canCreateUser = can(PERMISSION_KEY.MANAGE_USERS);
  const hasActiveFilters =
    Boolean(debouncedSearch) ||
    selectedRole !== undefined ||
    selectedStatus !== undefined;

  const handleSearchChange = (val: string) => {
    setSearch(val);
    if (!val) {
      setDebouncedSearch("");
      setPage(1);
    }
  };

  const handleClearFilters = () => {
    setSearch("");
    setDebouncedSearch("");
    setSelectedRole(undefined);
    setSelectedStatus(undefined);
    setPage(1);
  };

  const usersList = data?.users || [];
  const pagination = data?.pagination;

  const isSearching =
    search !== debouncedSearch || (isFetching && Boolean(debouncedSearch));

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* ── Glassmorphism Header Card ───────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-br from-card/80 via-card/50 to-background p-6 sm:p-8 backdrop-blur-xl shadow-xs">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 h-64 w-64 rounded-full bg-gradient-to-br from-orange-500/10 to-amber-500/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-8 h-32 w-64 rounded-full bg-indigo-500/5 blur-2xl pointer-events-none" />

        <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative flex items-center justify-center h-12 w-12 sm:h-14 sm:w-14 rounded-2xl bg-gradient-to-br from-orange-500 via-amber-500 to-indigo-600 text-white shadow-lg shadow-orange-500/25 shrink-0">
              <Users className="h-6 w-6 sm:h-7 sm:w-7 stroke-[2.5]" />
            </div>

            <div className="flex flex-col gap-1 min-w-0">
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1
                  className="text-2xl sm:text-3xl font-black text-foreground tracking-tight"
                  style={{ fontFamily: "var(--font-righteous), cursive" }}
                >
                  Workforce Directory
                </h1>
                <Badge
                  variant="outline"
                  className="text-[11px] font-bold bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30 px-2 py-0.5 rounded-full"
                >
                  NIST Level 2 Staff
                </Badge>
              </div>

              <p className="text-xs sm:text-sm text-muted-foreground max-w-2xl leading-relaxed">
                Manage organization staff, provision roles, and govern fine-grained
                NIST RBAC operational tiers.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-xs font-semibold">
              <Sparkles className="h-3.5 w-3.5" />
              <span>Real-Time Directory Sync</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── KPI Workforce Stats ──────────────────────────────────────── */}
      {isRolesLoading && !roles ? (
        <UsersStatsSkeleton />
      ) : (
        <UsersStats
          users={usersList}
          totalUsers={pagination?.total || usersList.length}
          roles={roles}
          selectedRole={selectedRole}
          onRoleSelect={(r) => {
            setSelectedRole(r);
            setPage(1);
          }}
          selectedStatus={selectedStatus}
          onStatusSelect={(s) => {
            setSelectedStatus(s);
            setPage(1);
          }}
        />
      )}

      {/* ── Filters & Search Bar ─────────────────────────────────────── */}
      <UsersFilters
        search={search}
        onSearchChange={handleSearchChange}
        selectedRole={selectedRole}
        onRoleChange={(r) => {
          setSelectedRole(r);
          setPage(1);
        }}
        selectedStatus={selectedStatus}
        onStatusChange={(s) => {
          setSelectedStatus(s);
          setPage(1);
        }}
        onOpenCreateModal={() => setIsCreateOpen(true)}
        canCreateUser={canCreateUser}
        isSearching={isSearching}
      />

      {/* ── Users Table ──────────────────────────────────────────────── */}
      <UsersTable
        users={usersList}
        pagination={pagination}
        currentPage={page}
        onPageChange={setPage}
        currentUserId={currentUser?.id}
        currentUserRole={currentUserRole as SYSTEM_ROLE}
        onViewDetails={setInspectUser}
        onChangeRole={setRoleChangeUser}
        onToggleStatus={setStatusChangeUser}
        onClearFilters={handleClearFilters}
        hasActiveFilters={hasActiveFilters}
        isLoading={isLoading || isFetching}
      />

      {/* ── Modals & Drawers ─────────────────────────────────────────── */}
      <CreateUserModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        currentUserRole={currentUserRole as SYSTEM_ROLE}
      />

      <UserDetailDrawer
        user={inspectUser}
        isOpen={Boolean(inspectUser)}
        onClose={() => setInspectUser(null)}
        currentUserId={currentUser?.id}
        currentUserRole={currentUserRole as SYSTEM_ROLE}
        onChangeRole={(u) => {
          setInspectUser(null);
          setRoleChangeUser(u);
        }}
        onToggleStatus={(u) => {
          setInspectUser(null);
          setStatusChangeUser(u);
        }}
      />

      <UserRoleModal
        user={roleChangeUser}
        isOpen={Boolean(roleChangeUser)}
        onClose={() => setRoleChangeUser(null)}
        currentUserRole={currentUserRole as SYSTEM_ROLE}
      />

      <UserStatusModal
        user={statusChangeUser}
        isOpen={Boolean(statusChangeUser)}
        onClose={() => setStatusChangeUser(null)}
      />
    </div>
  );
}

export default UsersManager;
