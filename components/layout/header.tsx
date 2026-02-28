"use client";

import Link from "next/link";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="w-full border-b bg-background">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        {/* Left: App title */}
        <div className="flex items-center gap-6">
          <Link
            href="/dashboard"
            className="text-lg font-semibold tracking-tight"
          >
            AI Guidebook for Student
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-4 text-sm">
            <Link
              href="/dashboard"
              className="text-muted-foreground hover:text-foreground"
            >
              Dashboard
            </Link>
            <Link
              href="/ai-log"
              className="text-muted-foreground hover:text-foreground"
            >
              AI Log
            </Link>
            <Link
              href="/guidelines"
              className="text-muted-foreground hover:text-foreground"
            >
              Guidelines
            </Link>
          </nav>
        </div>

        {/* Right: Account avatar */}
        <Link href="/profile">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Profile"
            className="border border-muted-foreground/30 hover:border-muted-foreground"
          >
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </header>
  );
}
