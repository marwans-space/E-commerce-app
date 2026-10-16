import { queryOptions } from "@tanstack/react-query";
import API_URL from "../config.ts";

export default function meQueryOptions() {
  return queryOptions({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch(API_URL + "/auth/me", {
        headers: { Accept: "application/json" },
        credentials: "include",
      });
      if (res.status === 401) return null;
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
      const body = await res.json();
      return body.user;
    },
  });
}
