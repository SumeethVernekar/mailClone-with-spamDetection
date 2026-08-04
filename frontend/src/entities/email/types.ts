export type Folder = "inbox" | "sent" | "spam";

export interface Email {
  id: string;
  subject: string;
  body: string;
  folder: Folder;
  is_read: boolean;
  priority_score: number; // 0.0 to 1.0
  sender_name: string;
  created_at: string;
}