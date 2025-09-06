import { api } from "./api";

import { API_ROUTES } from "./routes";

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  password_confirmation: string;
  is_active?: boolean;
}) {
  const { data } = await api.post(API_ROUTES.admin.users, payload);
  return data;
}

export async function updateUser(
  id: number,
  payload: { name?: string; email?: string; is_active?: boolean },
) {
  const { data } = await api.put(`${API_ROUTES.admin.users}/${id}`, payload);
  return data;
}

export async function updateUserPassword(
  id: number,
  payload: { password: string; password_confirmation: string },
) {
  const { data } = await api.put(
    `${API_ROUTES.admin.users}/${id}/password`,
    payload,
  );
  return data;
}

export async function deleteUser(id: number) {
  const { data } = await api.delete(`${API_ROUTES.admin.users}/${id}`);
  return data;
}
