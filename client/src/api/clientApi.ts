import axios from "axios";
import jobs from "./mockDb";
import type { Job } from "./mockDb";

const api = axios.create({ baseURL: "/api" });

export const fetchJobs = async (): Promise<Job[]> => {
  await new Promise((r) => setTimeout(r, 120));
  return jobs;
};

export const fetchJobById = async (id: number): Promise<Job | undefined> => {
  await new Promise((r) => setTimeout(r, 80));
  return jobs.find((j) => j.id === id);
};

export const postRegister = async (payload: { email: string; password: string }) => {
  try {
    return await api.post("/auth/register", payload);
  } catch {
    return { status: 200, data: { message: "mock registered" } };
  }
};

export const postLogin = async (payload: { email: string; password: string }) => {
  try {
    return await api.post("/auth/login", payload);
  } catch {
    return { status: 200, data: { token: "mock-token" } };
  }
};

export default api;
