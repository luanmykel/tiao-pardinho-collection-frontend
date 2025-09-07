import { api } from "./api";
import { API_ROUTES } from "./routes";

export async function fetchTopSongs(limit = 5) {
  const { data } = await api.get(`${API_ROUTES.songs}/top`, {
    params: { limit },
  });
  return data;
}

export async function fetchRestSongs(params: {
  top?: number;
  page?: number;
  per_page?: number;
}) {
  const { data } = await api.get(`${API_ROUTES.songs}/rest`, { params });
  return data;
}

export async function fetchAllSongsPublic() {
  const acc: any[] = [];
  const topResp = await api.get(`${API_ROUTES.songs}/top`, {
    params: { limit: 5 },
  });
  if (Array.isArray(topResp.data)) acc.push(...topResp.data);

  let p = 1;
  const per = 50;
  while (true) {
    const { data } = await api.get(`${API_ROUTES.songs}/rest`, {
      params: { top: 5, page: p, per_page: per },
    });
    const arr = Array.isArray(data?.data) ? data.data : [];
    acc.push(...arr);
    if (!data?.has_more) break;
    p += 1;
  }
  return acc;
}

export async function createSongFromYoutube(payload: { youtube: string }) {
  const { data } = await api.post(`${API_ROUTES.songs}/add`, payload);
  return data;
}

export async function deleteSongById(id: number) {
  await api.delete(`${API_ROUTES.songs}/${id}`);
}

export async function updateSongTitle(id: number, payload: { title: string }) {
  const { data } = await api.patch(`${API_ROUTES.songs}/${id}`, payload);
  return data;
}
