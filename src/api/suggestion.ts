import { api } from "./api";
import { API_ROUTES } from "./routes";

export async function createSuggestion(payload: { youtube: string }) {
  const { data } = await api.post(API_ROUTES.suggestions, payload);
  return data;
}

export async function approveSuggestion(id: number) {
  await api.post(`${API_ROUTES.suggestions}/${id}/approve`);
}

export async function rejectSuggestion(id: number) {
  await api.post(`${API_ROUTES.suggestions}/${id}/reject`);
}
