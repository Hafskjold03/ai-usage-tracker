// lib/guidelines.ts

export interface Guideline {
  id: string;
  title: string;
  shortDescription: string;
  content: string;
  category: "General" | "Exams" | "Assignments" | "Ethics";
  lastUpdated: string;
}

export const guidelines: Guideline[] = [
  {
    id: "g1",
    title: "General AI Usage Policy",
    shortDescription: "Overview of acceptable AI use in academic work.",
    category: "General",
    lastUpdated: "2026-01-10",
    content: `
Students may use AI tools for brainstorming, grammar checking, and idea structuring.
However, AI must not replace independent academic thinking.
All AI usage must be documented transparently in submitted assignments.
    `,
  },
  {
    id: "g2",
    title: "AI Usage During Exams",
    shortDescription: "Rules regarding AI tools in exams.",
    category: "Exams",
    lastUpdated: "2026-01-10",
    content: `
The use of AI tools during exams is strictly prohibited unless explicitly permitted.
Violation may result in academic misconduct procedures.
    `,
  },
  {
    id: "g3",
    title: "AI Assistance in Assignments",
    shortDescription: "What level of AI support is allowed in coursework.",
    category: "Assignments",
    lastUpdated: "2026-01-10",
    content: `
AI may be used to:
- Generate outlines
- Improve language clarity
- Suggest references (must be verified)

Students remain fully responsible for submitted content.
    `,
  },
  {
    id: "g4",
    title: "Ethical Responsibility",
    shortDescription: "Ethical considerations when using AI tools.",
    category: "Ethics",
    lastUpdated: "2026-01-10",
    content: `
Students must ensure:
- No plagiarism
- No fabricated references
- No submission of AI-generated content without modification

Transparency is required in all academic submissions.
    `,
  },
];