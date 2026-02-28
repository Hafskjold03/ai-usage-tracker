"use client";

import { useEffect, useState } from "react";
import UsageChart from "@/components/dashboard/usagecharts";

type Stats = {
  month: string;
  count: number;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats[]>([]);

  useEffect(() => {
    fetch("/api/ai-usage/stats", { credentials: "include" })
      .then((res) => res.json())
      .then(setStats);
  }, []);

  const labels = stats.map((s) => s.month);
  const data = stats.map((s) => s.count);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <h1 className="text-2xl font-bold">AI Usage Dashboard</h1>
      {stats.length ? (
        <UsageChart labels={labels} data={data} />
      ) : (
        <p className="text-muted-foreground">No AI logs yet.</p>
      )}
    </div>
  );
}
