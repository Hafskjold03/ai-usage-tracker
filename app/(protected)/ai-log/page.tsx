"use client";

import AILogForm from "@/components/ai-log/ailogform";
import AILogList from "@/components/ai-log/ailoglist";

export default function AILogPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold">AI Usage Log</h1>
      <AILogForm />
      <AILogList />
    </div>
  );
}
