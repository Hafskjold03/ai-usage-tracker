"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function AILogForm() {
  const [tool, setTool] = useState("");
  const [purpose, setPurpose] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/ai-usage", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tool, purpose, description }),
    });

    setTool("");
    setPurpose("");
    setDescription("");
    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>AI Tool</Label>
        <Input
          placeholder="e.g. ChatGPT"
          value={tool}
          onChange={(e) => setTool(e.target.value)}
        />
      </div>

      <div>
        <Label>Purpose</Label>
        <Input
          placeholder="e.g. Homework, Research"
          value={purpose}
          onChange={(e) => setPurpose(e.target.value)}
        />
      </div>

      <div>
        <Label>Description (optional)</Label>
        <Textarea
          placeholder="Describe what you used AI for"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <Button type="submit" disabled={loading}>
        Log AI usage
      </Button>
    </form>
  );
}
