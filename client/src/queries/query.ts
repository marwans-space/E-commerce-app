import { queryOptions } from "@tanstack/react-query";
export default function meQueryOptions() {
  return queryOptions({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("http://localhost:3434/auth/me", {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      return await res.json();
    },
  });
}
