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

export function RoleCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div className="space-y-1.5">
            <Skeleton className="h-5 w-28 rounded-md" />
            <Skeleton className="h-3.5 w-40 rounded opacity-60" />
          </div>
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>

      <div className="space-y-2 pt-2 border-t border-border/40">
        <div className="flex justify-between items-center text-xs">
          <Skeleton className="h-3.5 w-24 rounded opacity-60" />
          <Skeleton className="h-3.5 w-12 rounded" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>
    </div>
  );
}

export function RoleCardsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <RoleCardSkeleton />
      <RoleCardSkeleton />
      <RoleCardSkeleton />
    </div>
  );
}

export function PermissionMatrixSkeleton() {
  return (
    <div className="rounded-2xl border border-border/60 bg-card/60 backdrop-blur-xl shadow-xs overflow-hidden">
      <div className="p-4 sm:p-6 border-b border-border/40 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <Skeleton className="h-6 w-56 rounded-md" />
          <Skeleton className="h-4 w-80 rounded opacity-60" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-32 rounded-xl" />
          <Skeleton className="h-9 w-40 rounded-xl" />
        </div>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow className="border-b border-border/60">
              <TableHead className="px-6 py-4 w-[350px]">
                <Skeleton className="h-4 w-32 rounded" />
              </TableHead>
              <TableHead className="px-6 py-4 text-center">
                <Skeleton className="h-4 w-20 mx-auto rounded" />
              </TableHead>
              <TableHead className="px-6 py-4 text-center">
                <Skeleton className="h-4 w-20 mx-auto rounded" />
              </TableHead>
              <TableHead className="px-6 py-4 text-center">
                <Skeleton className="h-4 w-20 mx-auto rounded" />
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <TableRow key={i} className="border-b border-border/40">
                <TableCell className="px-6 py-4">
                  <div className="space-y-1.5">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-3 w-64 rounded opacity-60" />
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Skeleton className="h-5 w-5 mx-auto rounded" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Skeleton className="h-5 w-5 mx-auto rounded" />
                </TableCell>
                <TableCell className="px-6 py-4 text-center">
                  <Skeleton className="h-5 w-5 mx-auto rounded" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

export function FullRolesPageSkeleton() {
  return (
    <div className="flex flex-col gap-8 pb-12 animate-fade-up">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64 rounded-lg" />
        <Skeleton className="h-4 w-96 rounded opacity-60" />
      </div>

      <RoleCardsSkeleton />
      <PermissionMatrixSkeleton />
    </div>
  );
}
