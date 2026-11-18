export const API_URL: string = import.meta.env.VITE_API_URL;

if (!API_URL) throw new Error("VITE_API_URL is not set");

export const WS_URL = API_URL.replace(/^http/, "ws").replace(/\/api\/v1\/?$/, "");
