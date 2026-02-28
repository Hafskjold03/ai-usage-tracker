"use client";

import { Guideline } from "@/lib/guidelines";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface GuidelineCardProps {
  guideline: Guideline;
}

export function GuidelineCard({ guideline }: GuidelineCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">{guideline.title}</CardTitle>
          <Badge variant="secondary">{guideline.category}</Badge>
        </div>
        <CardDescription>
          {guideline.shortDescription}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        <p className="text-sm text-muted-foreground whitespace-pre-line">
          {guideline.content}
        </p>

        <p className="text-xs text-muted-foreground">
          Last updated: {guideline.lastUpdated}
        </p>
      </CardContent>
    </Card>
  );
}