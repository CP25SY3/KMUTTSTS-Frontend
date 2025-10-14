import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { LoginInput, StrapiUser } from "./authTypes";
import { login, logout, me } from "./authApi";

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) => login(input),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
    },
  });
}

export function useMe(enabled = true) {
  return useQuery<StrapiUser>({
    queryKey: ["me"],
    queryFn: () => me(),
    enabled,
    staleTime: 60_000,
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return () => {
    logout();
    qc.removeQueries({ queryKey: ["me"] });
  };
}
