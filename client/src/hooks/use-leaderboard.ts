import { useQuery } from "@tanstack/react-query";
import React, { useState, useEffect } from "react";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";

export type TimePeriod = "today" | "weekly" | "monthly" | "all_time";

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

export function useLeaderboard(timePeriod: TimePeriod) {
  const [previousData, setPreviousData] = useState<LeaderboardEntry[]>([]);
  
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["/api/affiliate/stats"],
    refetchInterval: 30000,
    select: (response: any) => {
      if (!response?.data) return { data: {} };
      
      const periodMap = {
        today: 'today',
        weekly: 'weekly',
        monthly: 'monthly',
        all_time: 'all_time'
      };
      
      const periodKey = periodMap[timePeriod];
      const entries = response.data[periodKey]?.data || [];
      
      return entries.map((entry: any) => ({
        uid: entry.uid,
        name: entry.name,
        wagered: {
          today: entry.wagered?.today || 0,
          this_week: entry.wagered?.this_week || 0,
          this_month: entry.wagered?.this_month || 0,
          all_time: entry.wagered?.all_time || 0
        }
      }));
    }
  });

  useEffect(() => {
    if (data) {
      setPreviousData(data);
    }
  }, [data]);

  return {
    data: data || [],
    isLoading,
    error,
    refetch
  };
}

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
  const [ws, setWs] = React.useState<WebSocket | null>(null);
  const [previousData, setPreviousData] = useState<LeaderboardEntry[]>([]);

  React.useEffect(() => {
    let reconnectTimer: NodeJS.Timeout;
    let ws: WebSocket;

    const connect = () => {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      ws = new WebSocket(`${protocol}//${window.location.host}/ws/leaderboard`);

      ws.onmessage = (event: MessageEvent) => {
        try {
          const update = JSON.parse(event.data);
          if (update.type === "LEADERBOARD_UPDATE") {
            refetch();
          }
        } catch (err) {
          console.error('WebSocket message parsing error:', err);
        }
      };

      ws.onclose = () => {
        reconnectTimer = setTimeout(connect, 3000);
      };

      ws.onerror = (error: Event) => {
        console.error('WebSocket error:', error);
        ws.close();
      };

      setWs(ws);
    };

    connect();

    return () => {
      clearTimeout(reconnectTimer);
      if (ws) ws.close();
    };
  }, []);

  // Primary data fetch hook using React Query
// This is the main entry point for leaderboard data in the frontend
const { data, isLoading, error, refetch } = useQuery<APIResponse, Error>({
    // Unique key for React Query cache - changes when time period or page changes
    queryKey: ["/api/affiliate/stats", timePeriod, page],
    queryFn: async () => {
      const response = await fetch(`/api/affiliate/stats?period=${timePeriod}&page=${page}&limit=10`, {
        headers: {
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const freshData = await response.json() as APIResponse;

      sessionStorage.setItem(`leaderboard-${timePeriod}-${page}`, JSON.stringify({
        data: freshData,
        timestamp: Date.now()
      }));

      return freshData;
    },
    refetchInterval: 60000, // Poll every minute instead of 30 seconds
    staleTime: 45000, // Consider data fresh for 45 seconds
    cacheTime: 300000,
    retry: 3,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false
  });

  const periodKey =
    timePeriod === "weekly"
      ? "weekly"
      : timePeriod === "monthly"
        ? "monthly"
        : timePeriod === "today"
          ? "today"
          : "all_time";

  const sortedData = data?.data[periodKey]?.data.map((entry: LeaderboardEntry) => {
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
  }) || [];

  useEffect(() => {
    if (data?.data[periodKey]?.data) {
      setPreviousData(data.data[periodKey].data);
    }
  }, [data, periodKey]);

  return {
    data: sortedData,
    metadata: data?.metadata,
    isLoading,
    error,
    refetch,
  };
}