import axios from "axios";

const baseUrl = process.env.NEXT_PUBLIC_API_URL
  ? `https://${process.env.NEXT_PUBLIC_API_URL}`
  : "http://localhost:3001";

const api = axios.create({
  baseURL: `${baseUrl}/api`,
  timeout: 10000,
});

export const TRANSACTIONS_ENDPOINT = "/transactions";
export const ALLOWANCES_ENDPOINT = "/allowances";
export const DAILY_VOLUME_ENDPOINT = "/daily-volume";

export const WS_URL = process.env.NEXT_PUBLIC_API_URL
  ? `wss://${process.env.NEXT_PUBLIC_API_URL}`
  : "ws://localhost:8000";

export default api;
