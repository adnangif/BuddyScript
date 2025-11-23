"use client";

import { useMutation } from "@tanstack/react-query";

import { LoginInput } from "@/lib/validators/auth";
import { AuthErrorResponse, AuthMutationResponse } from "@/hooks/types";
import { useAuthStore } from "@/stores/auth-store";

const loginRequest = async (payload: LoginInput) => {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => ({}))) as AuthErrorResponse;
    const message =
      errorBody.message ??
      Object.values(errorBody.errors ?? {})?.[0]?.[0] ??
      "Unable to login";
    throw new Error(message);
  }

  return (await response.json()) as AuthMutationResponse;
};

export const useLogin = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: loginRequest,
    onSuccess: (data) => {
      setUser({
        ...data.user,
        token: data.token,
        tokenExpiresAt: Date.now() + data.expiresInSeconds * 1000,
      });
    },
  });
};


