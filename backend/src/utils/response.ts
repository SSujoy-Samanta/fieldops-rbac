import type { Response } from "express";

export interface SuccessResponse<T = unknown> {
  success: true;
  data?: T;
  message?: string;
  meta?: Record<string, unknown>;
}

export function sendSuccess<T>(
  res: Response,
  data?: T,
  message?: string,
  meta?: Record<string, unknown>
): void {
  const body: SuccessResponse<T> = { success: true };
  if (data !== undefined) body.data = data;
  if (message !== undefined) body.message = message;
  if (meta !== undefined) body.meta = meta;
  res.status(200).json(body);
}

export function sendCreated<T>(
  res: Response,
  data?: T,
  message?: string,
  meta?: Record<string, unknown>
): void {
  const body: SuccessResponse<T> = { success: true };
  if (data !== undefined) body.data = data;
  if (message !== undefined) body.message = message;
  if (meta !== undefined) body.meta = meta;
  res.status(201).json(body);
}

export function sendNoContent(res: Response): void {
  res.status(204).end();
}
