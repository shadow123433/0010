import { Auth } from "./auth.js";

const API_URL = "http://localhost:3000";

export async function apiFetch(url, options = {}) {
  const token = Auth.getToken();

  options.headers = {
    ...(options.headers || {}),
    Authorization: token ? `Bearer ${token}` : ""
  };

  const res = await fetch(API_URL + url, options);

  if (res.status === 401) {
    Auth.logout();
    throw new Error("Não autorizado");
  }

  return res;
}