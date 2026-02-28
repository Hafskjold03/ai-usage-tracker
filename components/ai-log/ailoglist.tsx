"use client";

import { useEffect, useState } from "react";

type AILog = {
  id: number;
  tool: string;
  purpose: string;
  description?: string;
  createdAt: string;
};

export default function AILogList() {
  const [logs, setLogs] = useState<AILog[]>([]);

  useEffect(() => {
    fetch("/api/ai-usage", { credentials: "include" })
      .then((res) => res.json())
      .then(setLogs);
  }, []);

  if (!logs.length)
    return <p className="text-muted-foreground">No AI usage logged yet.</p>;

  return (
    <ul className="space-y-4">
      {logs.map((log) => (
        <li key={log.id} className="border rounded p-4">
          <div className="font-medium">{log.tool}</div>
          <div className="text-sm text-muted-foreground">
            {log.purpose} · {new Date(log.createdAt).toLocaleString()}
          </div>
          {log.description && <p className="mt-2 text-sm">{log.description}</p>}
        </li>
      ))}
    </ul>
  );
}
