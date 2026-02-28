"use client";

import { useEffect, useState } from "react";
import UsageChart from "@/components/dashboard/usagecharts";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

type Stats = {
  month: string;
  count: number;
};

type Log = {
  id: number;
  tool: string;
  purpose: string;
  description?: string;
  createdAt: string;
};

export default function DashboardPage() {
  const [monthlyStats, setMonthlyStats] = useState<Stats[]>([]);
  const [totalLogs, setTotalLogs] = useState(0);
  const [lastLogs, setLastLogs] = useState<Log[]>([]);

  useEffect(() => {
    fetch("/api/ai-usage/stats", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        setMonthlyStats(data.monthlyStats);
        setTotalLogs(data.totalLogs);
        setLastLogs(data.lastLogs);
      });
  }, []);

  const labels = monthlyStats.map((s) => s.month);
  const data = monthlyStats.map((s) => s.count);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-8">
      <h1 className="text-2xl font-bold">AI Usage Dashboard</h1>

      {/* Total logs summary */}
      <Card>
        <CardHeader>
          <CardTitle>Total AI Logs</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{totalLogs}</p>
        </CardContent>
      </Card>

      {/* Chart */}
      {monthlyStats.length > 0 && <UsageChart labels={labels} data={data} />}

      {/* Last 3 logs */}
      <Card>
        <CardHeader>
          <CardTitle>Last AI Logs</CardTitle>
        </CardHeader>
        <CardContent>
          {lastLogs.length === 0 ? (
            <p className="text-muted-foreground">No AI logs yet.</p>
          ) : (
            <ul className="space-y-2">
              {lastLogs.map((log) => (
                <li key={log.id} className="border rounded p-3">
                  <div className="font-semibold">{log.tool}</div>
                  <div className="text-sm text-muted-foreground">
                    {log.purpose} · {new Date(log.createdAt).toLocaleString()}
                  </div>
                  {log.description && (
                    <p className="mt-1 text-sm">{log.description}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
