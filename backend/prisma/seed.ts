/**
 * FieldOps Access Test — Prisma Seed Script
 * Seeds: Permissions → System Roles → Role-Permission Assignments → Test Users → Attendance → Visits
 * Idempotent: Safe to re-run. Uses upsert throughout.
 */

import "dotenv/config";
import bcrypt from "bcrypt";
import { prisma } from "../src/lib/prisma";
import { PERMISSIONS, SYSTEM_ROLE_DEFINITIONS, SYSTEM_ROLE } from "../src/types/rbac";

// ─────────────────────────────────────────────────────────────────
// TEST USERS SEED DATA
// ─────────────────────────────────────────────────────────────────

const USERS = [
  {
    name: "Sujoy Samanta",
    email: "owner@fieldops.dev",
    password: "Owner@1234",
    roleName: SYSTEM_ROLE.OWNER,
    avatar: null,
  },
  {
    name: "Rajesh Kumar",
    email: "manager@fieldops.dev",
    password: "Manager@1234",
    roleName: SYSTEM_ROLE.MANAGER,
    avatar: null,
  },
  {
    name: "Priya Sharma",
    email: "employee@fieldops.dev",
    password: "Employee@1234",
    roleName: SYSTEM_ROLE.FIELD_EMPLOYEE,
    avatar: null,
  },
];

// ─────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

function clockInAt(daysBack: number, hour: number, minute = 0): Date {
  const d = daysAgo(daysBack);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function clockOutAt(daysBack: number, hour: number, minute = 0): Date {
  const d = daysAgo(daysBack);
  d.setHours(hour, minute, 0, 0);
  return d;
}

function minutesBetween(from: Date, to: Date): number {
  return Math.floor((to.getTime() - from.getTime()) / 60000);
}

// ─────────────────────────────────────────────────────────────────
// MAIN SEED EXECUTION
// ─────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Starting database seed...\n");

  // ── 1. Seed Permissions ────────────────────────────────────────
  console.log("⚡ Seeding permissions...");
  const permissionMap = new Map<string, string>(); // key → id

  for (const perm of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { key: perm.key },
      update: { name: perm.name, module: perm.module, description: perm.description },
      create: { key: perm.key, name: perm.name, module: perm.module, description: perm.description },
    });
    permissionMap.set(perm.key, record.id);
    console.log(`   ✅ Permission: [${perm.module}] ${perm.key}`);
  }

  // ── 2. Seed System Roles ───────────────────────────────────────
  console.log("\n⚡ Seeding system roles...");
  const roleMap = new Map<string, string>(); // name → id

  for (const role of SYSTEM_ROLE_DEFINITIONS) {
    const record = await prisma.role.upsert({
      where: { name: role.name },
      update: { description: role.description },
      create: { name: role.name, description: role.description },
    });
    roleMap.set(role.name, record.id);
    console.log(`   ✅ Role: ${role.name}`);
  }

  // ── 3. Assign Permissions to Roles ────────────────────────────
  console.log("\n⚡ Assigning permissions to roles...");
  for (const role of SYSTEM_ROLE_DEFINITIONS) {
    const roleId = roleMap.get(role.name)!;

    for (const permKey of role.permissions) {
      const permissionId = permissionMap.get(permKey)!;
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId, permissionId } },
        update: {},
        create: { roleId, permissionId },
      });
    }
    console.log(`   ✅ ${role.name}: ${role.permissions.length} permission(s) assigned`);
  }

  // ── 4. Seed Test Users ─────────────────────────────────────────
  console.log("\n⚡ Seeding test users...");
  const SALT_ROUNDS = 12;
  const userMap = new Map<string, string>(); // email → id

  for (const u of USERS) {
    const roleId = roleMap.get(u.roleName)!;
    const passwordHash = await bcrypt.hash(u.password, SALT_ROUNDS);

    const user = await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, roleId },
      create: {
        email: u.email,
        name: u.name,
        passwordHash,
        roleId,
        isActive: true,
        isVerified: true,
        emailVerifiedAt: new Date(),
        avatar: u.avatar,
      },
    });
    userMap.set(u.email, user.id);
    console.log(`   ✅ User: ${u.name} <${u.email}> [${u.roleName}]`);
  }

  // ── 5. Seed Attendance Records ─────────────────────────────────
  console.log("\n⚡ Seeding realistic attendance records...");

  const attendanceData = [
    // Manager (Rajesh)
    { email: "manager@fieldops.dev", daysBack: 4, inHour: 9, inMin: 5, outHour: 18, outMin: 30 },
    { email: "manager@fieldops.dev", daysBack: 3, inHour: 8, inMin: 55, outHour: 17, outMin: 45 },
    { email: "manager@fieldops.dev", daysBack: 2, inHour: 9, inMin: 10, outHour: 18, outMin: 0 },
    { email: "manager@fieldops.dev", daysBack: 1, inHour: 9, inMin: 0, outHour: 18, outMin: 15 },
    // Field Employee (Priya)
    { email: "employee@fieldops.dev", daysBack: 4, inHour: 9, inMin: 15, outHour: 17, outMin: 30 },
    { email: "employee@fieldops.dev", daysBack: 3, inHour: 9, inMin: 5, outHour: 17, outMin: 0 },
    { email: "employee@fieldops.dev", daysBack: 2, inHour: 8, inMin: 50, outHour: 17, outMin: 45 },
    { email: "employee@fieldops.dev", daysBack: 1, inHour: 9, inMin: 20, outHour: 17, outMin: 30 },
  ];

  for (const record of attendanceData) {
    const userId = userMap.get(record.email)!;
    const clockIn = clockInAt(record.daysBack, record.inHour, record.inMin);
    const clockOut = clockOutAt(record.daysBack, record.outHour, record.outMin);
    const durationMinutes = minutesBetween(clockIn, clockOut);

    await prisma.attendance.create({
      data: {
        userId,
        clockIn,
        clockOut,
        durationMinutes,
        date: clockIn,
        status: "CLOCKED_OUT",
        locationNotes: "Office HQ, Kolkata",
      },
    });
  }
  console.log(`   ✅ ${attendanceData.length} attendance records created`);

  // ── 6. Seed Field Visit Records ────────────────────────────────
  console.log("\n⚡ Seeding realistic field visit records...");

  const visitData = [
    // Manager (Rajesh)
    {
      email: "manager@fieldops.dev",
      daysBack: 4,
      customerName: "TechEdge Solutions",
      purpose: "CLIENT_MEETING" as const,
      outcome: "DEAL_CLOSED" as const,
      address: "12, Park Street, Kolkata, WB",
      notes: "Signed 6-month service contract.",
    },
    {
      email: "manager@fieldops.dev",
      daysBack: 2,
      customerName: "Global Retail Mart",
      purpose: "ROUTINE_INSPECTION" as const,
      outcome: "COMPLETED" as const,
      address: "45, MG Road, Bengaluru, KA",
      notes: "Quarterly inspection completed. No issues found.",
    },
    // Field Employee (Priya)
    {
      email: "employee@fieldops.dev",
      daysBack: 4,
      customerName: "Sharma Electronics",
      purpose: "PRODUCT_DEMO" as const,
      outcome: "FOLLOW_UP_REQUIRED" as const,
      address: "78, Gandhi Nagar, Jaipur, RJ",
      notes: "Demo done. Client requested a follow-up with pricing details.",
    },
    {
      email: "employee@fieldops.dev",
      daysBack: 3,
      customerName: "City Supermart",
      purpose: "ORDER_COLLECTION" as const,
      outcome: "COMPLETED" as const,
      address: "23, Linking Road, Mumbai, MH",
      notes: "Collected monthly order. PO number: MH-2024-08.",
    },
    {
      email: "employee@fieldops.dev",
      daysBack: 2,
      customerName: "Apex Auto Parts",
      purpose: "MAINTENANCE" as const,
      outcome: "COMPLETED" as const,
      address: "15, Industrial Area, Pune, MH",
      notes: "Replaced faulty sensor unit. System running normally.",
    },
    {
      email: "employee@fieldops.dev",
      daysBack: 1,
      customerName: "Sunrise Traders",
      purpose: "PRODUCT_DEMO" as const,
      outcome: "DEAL_CLOSED" as const,
      address: "67, Nehru Place, New Delhi, DL",
      notes: "Customer placed an order after demo. Handover to sales team.",
    },
  ];

  for (const v of visitData) {
    const userId = userMap.get(v.email)!;
    await prisma.visit.create({
      data: {
        userId,
        customerName: v.customerName,
        purpose: v.purpose,
        outcome: v.outcome,
        address: v.address,
        visitDate: daysAgo(v.daysBack),
        notes: v.notes,
      },
    });
  }
  console.log(`   ✅ ${visitData.length} field visit records created`);

  // ─────────────────────────────────────────────────────────────────
  console.log("\n✅ Database seeded successfully!\n");
  console.log("────────────────────────────────────────");
  console.log("🔑 Default Test Accounts:");
  for (const u of USERS) {
    console.log(`   [${u.roleName}] ${u.email} / ${u.password}`);
  }
  console.log("────────────────────────────────────────\n");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
