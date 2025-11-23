import { useMutation } from "@tanstack/react-query";
import { RegisterInput } from "@/lib/validators/auth";
import { useAuthStore } from "@/stores/auth-store";

type RegisterResponse = {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  token: string;
  expiresInSeconds: number;
};

type ErrorResponse = {
  message?: string;
  errors?: Record<string, string[]>;
};

const registerRequest = async (payload: RegisterInput) => {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = (await response
      .json()
      .catch(() => ({}))) as ErrorResponse;
    const message =
      errorBody.message ??
      Object.values(errorBody.errors ?? {})?.[0]?.[0] ??
      "Unable to register";
    throw new Error(message);
  }

  return (await response.json()) as RegisterResponse;
};

export const useRegister = () => {
  const setUser = useAuthStore((state) => state.setUser);

  return useMutation({
    mutationFn: registerRequest,
    onSuccess: (data) => {
      setUser({
        ...data.user,
        token: data.token,
        tokenExpiresAt: Date.now() + data.expiresInSeconds * 1000,
      });
    },
  });
};

