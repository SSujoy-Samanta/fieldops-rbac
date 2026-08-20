import { prisma } from "@/lib/prisma";
import {
  type Prisma,
  ATTENDANCE_STATUS,
  SYSTEM_ROLE,
} from "@/generated/prisma/client";
import { normalizeDateRange } from "@/utils/date-schemas";
import type {
  SelfAttendanceQueryInput,
  TeamAttendanceQueryInput,
} from "./attendance.schemas";

export const attendanceRepository = {
  /**
   * Finds the currently open CLOCKED_IN session for a user (if any)
   */
  async findActiveSession(userId: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.attendance.findFirst({
      where: {
        userId,
        status: ATTENDANCE_STATUS.CLOCKED_IN,
      },
      orderBy: { clockIn: "desc" },
    });
  },

  /**
   * Creates a new Clock-In record
   */
  async createClockIn(
    data: {
      userId: string;
      locationNotes?: string;
      clockIn?: Date;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const now = data.clockIn ?? new Date();

    return client.attendance.create({
      data: {
        userId: data.userId,
        clockIn: now,
        date: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        status: ATTENDANCE_STATUS.CLOCKED_IN,
        locationNotes: data.locationNotes ?? null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Updates an existing session with Clock-Out time and duration
   */
  async updateClockOut(
    id: string,
    data: {
      clockOut: Date;
      durationMinutes: number;
      locationNotes?: string;
    },
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.attendance.update({
      where: { id },
      data: {
        clockOut: data.clockOut,
        durationMinutes: data.durationMinutes,
        status: ATTENDANCE_STATUS.CLOCKED_OUT,
        locationNotes: data.locationNotes !== undefined ? data.locationNotes : undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Retrieves all sessions for a user within a specific date range (e.g. today)
   */
  async findUserSessionsForRange(
    userId: string,
    start: Date,
    end: Date,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.attendance.findMany({
      where: {
        userId,
        clockIn: {
          gte: start,
          lte: end,
        },
      },
      orderBy: { clockIn: "desc" },
    });
  },

  /**
   * Retrieves paginated attendance history for a single user
   */
  async findSelfAttendance(
    userId: string,
    query: SelfAttendanceQueryInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const { page, limit, status, sortBy, sortOrder } = query;
    const { startDate, endDate } = normalizeDateRange(query.startDate, query.endDate);
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      userId,
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            clockIn: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
    };

    const [logs, total] = await Promise.all([
      client.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      client.attendance.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Retrieves paginated team attendance with user filtering, search, and date range
   */
  async findTeamAttendance(
    query: TeamAttendanceQueryInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const {
      page,
      limit,
      userId,
      role,
      search,
      status,
      sortBy,
      sortOrder,
    } = query;
    const { startDate, endDate } = normalizeDateRange(query.startDate, query.endDate);
    const skip = (page - 1) * limit;

    const where: Prisma.AttendanceWhereInput = {
      ...(userId ? { userId } : {}),
      ...(status ? { status } : {}),
      ...(startDate || endDate
        ? {
            clockIn: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      user: {
        deletedAt: null,
        ...(role ? { role: { name: role } } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
              ],
            }
          : {}),
      },
    };

    const [logs, total] = await Promise.all([
      client.attendance.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
              role: {
                select: {
                  id: true,
                  name: true,
                  description: true,
                },
              },
            },
          },
        },
      }),
      client.attendance.count({ where }),
    ]);

    return {
      logs,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Retrieves aggregated attendance stats for the team for a given date
   */
  async getTeamAttendanceStats(
    start: Date,
    end: Date,
    role?: SYSTEM_ROLE,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;

    const userWhere: Prisma.UserWhereInput = {
      isActive: true,
      deletedAt: null,
      ...(role ? { role: { name: role } } : {}),
    };

    const totalActiveEmployees = await client.user.count({ where: userWhere });

    // Find all attendance records today for eligible users
    const todayLogs = await client.attendance.findMany({
      where: {
        clockIn: { gte: start, lte: end },
        user: userWhere,
      },
      select: {
        userId: true,
        status: true,
        durationMinutes: true,
      },
    });

    const activeClockedInUserIds = new Set<string>();
    const completedUserIds = new Set<string>();
    let totalMinutesWorked = 0;

    for (const log of todayLogs) {
      if (log.status === ATTENDANCE_STATUS.CLOCKED_IN) {
        activeClockedInUserIds.add(log.userId);
      } else if (log.status === ATTENDANCE_STATUS.CLOCKED_OUT) {
        completedUserIds.add(log.userId);
        totalMinutesWorked += log.durationMinutes ?? 0;
      }
    }

    const currentlyClockedIn = activeClockedInUserIds.size;
    // Users who completed sessions and are not currently clocked in
    const currentlyClockedOut = Array.from(completedUserIds).filter(
      (uid) => !activeClockedInUserIds.has(uid)
    ).length;

    const notClockedInToday = Math.max(
      0,
      totalActiveEmployees - (currentlyClockedIn + currentlyClockedOut)
    );

    return {
      totalActiveEmployees,
      currentlyClockedIn,
      currentlyClockedOut,
      notClockedInToday,
      totalMinutesWorked,
      totalHoursWorked: Number((totalMinutesWorked / 60).toFixed(1)),
      averageHoursPerActiveUser:
        currentlyClockedIn + currentlyClockedOut > 0
          ? Number(
              (
                totalMinutesWorked /
                60 /
                (currentlyClockedIn + currentlyClockedOut)
              ).toFixed(1)
            )
          : 0,
    };
  },
};

export default attendanceRepository;
