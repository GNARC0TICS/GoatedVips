import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

type WageredData = {
  today: number;
  this_week: number;
  this_month: number;
  all_time: number;
};

type LeaderboardEntry = {
  uid: string;
  name: string;
  wagered: WageredData;
  wagerChange?: number;
  isWagering?: boolean;
};

type LeaderboardPeriodData = {
  data: LeaderboardEntry[];
};

type APIResponse = {
  status: "success";
  metadata?: {
    totalUsers: number;
    lastUpdated: string;
  };
  data: {
    today: LeaderboardPeriodData;
    weekly: LeaderboardPeriodData;
    monthly: LeaderboardPeriodData;
    all_time: LeaderboardPeriodData;
  };
};

export type TimePeriod = "today" | "weekly" | "monthly" | "all_time";

export function useLeaderboard(
  timePeriod: TimePeriod = "today",
  page: number = 0,
) {
  const { data, isLoading, error, refetch } = useQuery<APIResponse>({
    queryKey: ["/api/affiliate/stats", timePeriod, page],
    queryFn: async () => {
      const response = await fetch(`/api/affiliate/stats?page=${page}&limit=10`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    },
    refetchInterval: 30000, // Refetch every 30 seconds for live updates
  });

  const [previousData, setPreviousData] = useState<LeaderboardEntry[]>([]);

  const periodKey =
    timePeriod === "weekly"
      ? "weekly"
      : timePeriod === "monthly"
        ? "monthly"
        : timePeriod === "today"
          ? "today"
          : "all_time";

  // Compare current and previous wager amounts
  const sortedData = data?.data[periodKey]?.data?.map((entry) => {
    const prevEntry = previousData.find((p) => p.uid === entry.uid);
    const currentWager = entry.wagered[
      timePeriod === "weekly"
        ? "this_week"
        : timePeriod === "monthly"
          ? "this_month"
          : timePeriod === "today"
            ? "today"
            : "all_time"
    ];
    const previousWager = prevEntry
      ? prevEntry.wagered[
          timePeriod === "weekly"
            ? "this_week"
            : timePeriod === "monthly"
              ? "this_month"
              : timePeriod === "today"
                ? "today"
                : "all_time"
        ]
      : 0;

    return {
      ...entry,
      isWagering: currentWager > previousWager,
      wagerChange: currentWager - previousWager,
    };
  });

  // Update previous data after successful fetch
  useEffect(() => {
    if (data?.data[periodKey]?.data) {
      setPreviousData(data.data[periodKey].data);
    }
  }, [data, periodKey]);

  return {
    data: sortedData || [],
    metadata: data?.metadata,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}