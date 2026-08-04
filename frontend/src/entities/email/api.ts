import { apiClient } from "../../shared/api/client";
import type { Email, EmailListResponse, Folder } from "./types";

export async function fetchEmails(folder: Folder, sort?: "priority", q?: string): Promise<Email[]> {
  const params = new URLSearchParams({ folder });
  if (sort) params.set("sort", sort);
  if (q) params.set("q", q);
  const res = await apiClient<EmailListResponse>(`/emails?${params.toString()}`);
  return res.items;
}

export function fetchEmailById(id: number) {
  return apiClient<Email>(`/emails/${id}`);
}

export interface ComposePayload {
  recipient_email: string;
  subject: string;
  body: string;
}

export function sendEmail(payload: ComposePayload) {
  return apiClient<Email>("/emails", {
    method: "POST",
    body: payload,
  });
}