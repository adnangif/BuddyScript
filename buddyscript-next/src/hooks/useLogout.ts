import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";

export const useLogout = () => {
    const router = useRouter();
    const clearUser = useAuthStore((state) => state.clearUser);

    const logout = () => {
        // Clear user from store (this will also clear localStorage due to persist middleware)
        clearUser();

        // Redirect to login page
        router.push("/login");
    };

    return { logout };
};
