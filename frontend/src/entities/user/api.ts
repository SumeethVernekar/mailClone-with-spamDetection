import { apiClient } from "../../shared/api/client";
import type { AuthResponse, SignupResponse } from "./types";

export function login(email: string, password: string) {
  return apiClient<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function signup(name: string, email: string, password: string) {
  return apiClient<SignupResponse>("/auth/signup", {
    method: "POST",
    body: { name, email, password },
    auth: false,
  });
}