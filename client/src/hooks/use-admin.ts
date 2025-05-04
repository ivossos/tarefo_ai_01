import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export function useIsAdmin() {
  const { data, isLoading, error } = useQuery({
    queryKey: ["/api/me"],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/me");
        const userData = await response.json();
        return userData.role === "admin";
      } catch (error) {
        return false;
      }
    },
  });

  return {
    isAdmin: data || false,
    isLoading,
    error,
  };
}