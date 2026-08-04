export type Folder = "inbox" | "sent" | "spam";

export interface Email {
  id: number;
  subject: string;
  body: string;
  folder: Folder;
  is_read: boolean;
  priority_score: number; // 0.0 to 1.0
  sender_name: string;
  sender_email: string;
  created_at: string;
}

export interface EmailListResponse {
  total: number;
  items: Email[];
}