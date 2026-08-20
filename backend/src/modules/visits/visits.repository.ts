import { prisma } from "@/lib/prisma";
import {
  type Prisma,
  VISIT_PURPOSE,
  VISIT_OUTCOME,
} from "@/generated/prisma/client";
import { normalizeDateRange } from "@/utils/date-schemas";
import type {
  CreateVisitInput,
  UpdateVisitInput,
  SelfVisitsQueryInput,
  TeamVisitsQueryInput,
  TeamVisitStatsQueryInput,
} from "./visits.schemas";

export const visitsRepository = {
  /**
   * Creates a new field visit log in PostgreSQL
   */
  async createVisit(
    userId: string,
    data: CreateVisitInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.visit.create({
      data: {
        userId,
        customerName: data.customerName,
        purpose: data.purpose,
        outcome: data.outcome,
        address: data.address,
        visitDate: data.visitDate ?? new Date(),
        notes: data.notes ?? null,
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
                description: true,
              },
            },
          },
        },
      },
    });
  },

  /**
   * Finds a single visit by ID using unique index
   */
  async findVisitById(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.visit.findUnique({
      where: { id },
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
    });
  },

  /**
   * Updates an existing field visit log
   */
  async updateVisit(
    id: string,
    data: UpdateVisitInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    return client.visit.update({
      where: { id },
      data: {
        customerName: data.customerName,
        purpose: data.purpose,
        outcome: data.outcome,
        address: data.address,
        visitDate: data.visitDate,
        notes: data.notes !== undefined ? data.notes : undefined,
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
   * Deletes a visit by ID
   */
  async deleteVisit(id: string, tx?: Prisma.TransactionClient) {
    const client = tx ?? prisma;
    return client.visit.delete({
      where: { id },
    });
  },

  /**
   * Retrieves paginated personal visit logs for the logged-in user
   */
  async findSelfVisits(
    userId: string,
    query: SelfVisitsQueryInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const { page, limit, purpose, outcome, search, sortBy, sortOrder } = query;
    const { startDate, endDate } = normalizeDateRange(query.startDate, query.endDate);
    const skip = (page - 1) * limit;

    const where: Prisma.VisitWhereInput = {
      userId,
      ...(purpose ? { purpose } : {}),
      ...(outcome ? { outcome } : {}),
      ...(startDate || endDate
        ? {
            visitDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
              { notes: { contains: search, mode: "insensitive" } },
            ],
          }
        : {}),
    };

    const [visits, total] = await Promise.all([
      client.visit.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sortBy]: sortOrder },
      }),
      client.visit.count({ where }),
    ]);

    return {
      visits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Retrieves paginated team-wide field visits across all employees
   */
  async findTeamVisits(
    query: TeamVisitsQueryInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const {
      page,
      limit,
      userId,
      role,
      purpose,
      outcome,
      search,
      sortBy,
      sortOrder,
    } = query;
    const { startDate, endDate } = normalizeDateRange(query.startDate, query.endDate);
    const skip = (page - 1) * limit;

    const where: Prisma.VisitWhereInput = {
      ...(userId ? { userId } : {}),
      ...(purpose ? { purpose } : {}),
      ...(outcome ? { outcome } : {}),
      ...(startDate || endDate
        ? {
            visitDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      user: {
        deletedAt: null,
        ...(role ? { role: { name: role } } : {}),
      },
      ...(search
        ? {
            OR: [
              { customerName: { contains: search, mode: "insensitive" } },
              { address: { contains: search, mode: "insensitive" } },
              { notes: { contains: search, mode: "insensitive" } },
              { user: { name: { contains: search, mode: "insensitive" } } },
              { user: { email: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    };

    const [visits, total] = await Promise.all([
      client.visit.findMany({
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
      client.visit.count({ where }),
    ]);

    return {
      visits,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  },

  /**
   * Retrieves aggregated team visit stats (totals, breakdown by outcome, breakdown by purpose)
   */
  async getTeamVisitStats(
    query: TeamVisitStatsQueryInput,
    tx?: Prisma.TransactionClient
  ) {
    const client = tx ?? prisma;
    const { role } = query;
    const { startDate, endDate } = normalizeDateRange(query.startDate, query.endDate);

    const where: Prisma.VisitWhereInput = {
      ...(startDate || endDate
        ? {
            visitDate: {
              ...(startDate ? { gte: startDate } : {}),
              ...(endDate ? { lte: endDate } : {}),
            },
          }
        : {}),
      user: {
        isActive: true,
        deletedAt: null,
        ...(role ? { role: { name: role } } : {}),
      },
    };

    const [totalVisits, outcomeGroups, purposeGroups, distinctEmployees] =
      await Promise.all([
        client.visit.count({ where }),
        client.visit.groupBy({
          by: ["outcome"],
          where,
          _count: { outcome: true },
        }),
        client.visit.groupBy({
          by: ["purpose"],
          where,
          _count: { purpose: true },
        }),
        client.visit.findMany({
          where,
          distinct: ["userId"],
          select: { userId: true },
        }),
      ]);

    const outcomeBreakdown: Record<VISIT_OUTCOME, number> = {
      COMPLETED: 0,
      DEAL_CLOSED: 0,
      FOLLOW_UP_REQUIRED: 0,
      RESCHEDULED: 0,
      NO_SHOW: 0,
    };

    outcomeGroups.forEach((g) => {
      outcomeBreakdown[g.outcome] = g._count.outcome;
    });

    const purposeBreakdown: Record<VISIT_PURPOSE, number> = {
      ROUTINE_INSPECTION: 0,
      PRODUCT_DEMO: 0,
      ORDER_COLLECTION: 0,
      MAINTENANCE: 0,
      CLIENT_MEETING: 0,
      OTHER: 0,
    };

    purposeGroups.forEach((g) => {
      purposeBreakdown[g.purpose] = g._count.purpose;
    });

    return {
      totalVisits,
      activeFieldEmployeesCount: distinctEmployees.length,
      outcomes: outcomeBreakdown,
      purposes: purposeBreakdown,
    };
  },
};

export default visitsRepository;
