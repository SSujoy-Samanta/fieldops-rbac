import { SYSTEM_ROLE } from "./rbac";

export const VISIT_PURPOSE = {
  ROUTINE_INSPECTION: "ROUTINE_INSPECTION",
  PRODUCT_DEMO: "PRODUCT_DEMO",
  ORDER_COLLECTION: "ORDER_COLLECTION",
  MAINTENANCE: "MAINTENANCE",
  CLIENT_MEETING: "CLIENT_MEETING",
  OTHER: "OTHER",
} as const;

export type VISIT_PURPOSE = (typeof VISIT_PURPOSE)[keyof typeof VISIT_PURPOSE];

export const VISIT_OUTCOME = {
  COMPLETED: "COMPLETED",
  FOLLOW_UP_REQUIRED: "FOLLOW_UP_REQUIRED",
  DEAL_CLOSED: "DEAL_CLOSED",
  RESCHEDULED: "RESCHEDULED",
  NO_SHOW: "NO_SHOW",
} as const;

export type VISIT_OUTCOME = (typeof VISIT_OUTCOME)[keyof typeof VISIT_OUTCOME];

export interface VisitUser {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  role?: {
    id: string;
    name: SYSTEM_ROLE;
    description?: string | null;
  };
}

export interface Visit {
  id: string;
  userId: string;
  customerName: string;
  purpose: VISIT_PURPOSE;
  outcome: VISIT_OUTCOME;
  address: string;
  visitDate: string;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  user?: VisitUser;
}

export interface CreateVisitInput {
  customerName: string;
  purpose: VISIT_PURPOSE;
  outcome: VISIT_OUTCOME;
  address: string;
  visitDate?: string;
  notes?: string;
}

export interface UpdateVisitInput {
  customerName?: string;
  purpose?: VISIT_PURPOSE;
  outcome?: VISIT_OUTCOME;
  address?: string;
  visitDate?: string;
  notes?: string | null;
}

export interface SelfVisitsQuery {
  page?: number;
  limit?: number;
  purpose?: VISIT_PURPOSE;
  outcome?: VISIT_OUTCOME;
  search?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: "visitDate" | "customerName" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface TeamVisitsQuery extends SelfVisitsQuery {
  userId?: string;
  role?: SYSTEM_ROLE;
}

export interface TeamVisitStatsQuery {
  startDate?: string;
  endDate?: string;
  role?: SYSTEM_ROLE;
}

export interface VisitsPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface PaginatedVisitsResponse {
  visits: Visit[];
  pagination: VisitsPagination;
}

export interface TeamVisitStats {
  totalVisits: number;
  activeFieldEmployeesCount: number;
  outcomes: Record<VISIT_OUTCOME, number>;
  purposes: Record<VISIT_PURPOSE, number>;
}

export const VISIT_PURPOSE_LABELS: Record<VISIT_PURPOSE, string> = {
  [VISIT_PURPOSE.ROUTINE_INSPECTION]: "Routine Inspection",
  [VISIT_PURPOSE.PRODUCT_DEMO]: "Product Demo",
  [VISIT_PURPOSE.ORDER_COLLECTION]: "Order Collection",
  [VISIT_PURPOSE.MAINTENANCE]: "Maintenance & Service",
  [VISIT_PURPOSE.CLIENT_MEETING]: "Client Meeting",
  [VISIT_PURPOSE.OTHER]: "Other / General",
};

export const VISIT_OUTCOME_LABELS: Record<VISIT_OUTCOME, string> = {
  [VISIT_OUTCOME.COMPLETED]: "Completed",
  [VISIT_OUTCOME.DEAL_CLOSED]: "Deal Closed",
  [VISIT_OUTCOME.FOLLOW_UP_REQUIRED]: "Follow-up Required",
  [VISIT_OUTCOME.RESCHEDULED]: "Rescheduled",
  [VISIT_OUTCOME.NO_SHOW]: "No Show / Cancelled",
};

export type VisitDatePreset = "ALL" | "TODAY" | "WEEK" | "MONTH";
