"use client";

import React from "react";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function UsersStatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="rounded-xl sm:rounded-2xl border border-border/40 bg-card/60 p-3 sm:p-5 backdrop-blur-xl flex flex-col gap-2 sm:gap-2.5"
        >
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-16 sm:w-24 rounded" />
            <Skeleton className="h-7 w-7 sm:h-10 sm:w-10 rounded-lg sm:rounded-xl" />
          </div>
          <div className="flex items-baseline justify-between mt-1">
            <Skeleton className="h-6 sm:h-8 w-12 sm:w-16 rounded" />
            <Skeleton className="h-3.5 sm:h-4 w-12 sm:w-16 rounded-full" />
          </div>
          <Skeleton className="h-2.5 sm:h-3 w-20 sm:w-32 rounded opacity-60 mt-1" />
        </div>
      ))}
    </div>
  );
}

export function UserRowSkeleton() {
  return (
    <TableRow className="border-b border-border/20 hover:bg-transparent">
      <TableCell className="py-4 px-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full shrink-0" />
          <div className="space-y-1.5 min-w-0">
            <Skeleton className="h-4 w-32 rounded" />
            <Skeleton className="h-3 w-44 rounded opacity-60" />
          </div>
        </div>
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-6 w-24 rounded-md" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-5 w-18 rounded-full" />
      </TableCell>
      <TableCell className="py-4 px-6">
        <Skeleton className="h-4 w-28 rounded" />
      </TableCell>
      <TableCell className="py-4 px-6 text-right">
        <Skeleton className="h-8 w-8 rounded-lg ml-auto" />
      </TableCell>
    </TableRow>
  );
}

export function UsersTableSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/30 border-b border-border/40">
            <TableRow className="hover:bg-transparent">
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Staff Member
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Assigned Role
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Account Status
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Last Activity
              </TableHead>
              <TableHead className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-muted-foreground text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <UserRowSkeleton key={i} />
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function UsersPageSkeleton() {
  return (
    <div className="space-y-6 sm:space-y-8 animate-pulse">
      {/* Header Skeleton */}
      <div className="rounded-3xl border border-border/40 bg-card/60 p-6 sm:p-8 backdrop-blur-xl flex flex-col gap-3">
        <Skeleton className="h-4 w-36 rounded-full" />
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-96 rounded" />
      </div>

      {/* KPI Stats Skeleton */}
      <UsersStatsSkeleton />

      {/* Filter Bar Skeleton */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl border border-border/40 bg-card/60 backdrop-blur-xl">
        <Skeleton className="h-10 w-full sm:w-80 rounded-lg" />
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Skeleton className="h-10 w-28 rounded-lg" />
          <Skeleton className="h-10 w-36 rounded-lg" />
        </div>
      </div>

      {/* Table Skeleton */}
      <UsersTableSkeleton />
    </div>
  );
}

export default UsersPageSkeleton;
