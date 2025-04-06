import axios from "axios";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

const Api = axios.create({
  baseURL: URL,
  headers: { "Content-Type": "application/json" },
});

Api.interceptors.request.use((config) => {
  if (typeof window !== "undefined" && window.Telegram?.WebApp) {
    const initData = window.Telegram.WebApp?.initData;
    if (initData) config.headers["x-telegram-init-data"] = initData;
  }
  return config;
});

Api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      error.response?.data?.message?.includes("initData")
    ) {
      console.error("Invalid or missing Telegram initData");
    }
    return Promise.reject(error);
  }
);

export default Api;
