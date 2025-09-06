export type Suggestion = {
  id: number;
  youtube_id: string;
  status: "pending" | "approved" | "rejected" | "deleted";
  title?: string;
  view_count?: number;
  reviewer_id?: number | null;
  reviewed_at?: string | null;
  youtube_url?: string;
  thumbnail_url?: string;
  song_id?: number | null;
  removed_at?: string | null;
  removed_reason?: string | null;
};
