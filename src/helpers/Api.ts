import axios from "axios";

const URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333/api/v1";

const Api = axios.create({
  baseURL: URL,
  headers: { "Content-Type": "application/json" },
});

export default Api;
