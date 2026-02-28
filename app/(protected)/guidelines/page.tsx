import { guidelines } from "@/lib/guidelines";
import { GuidelineCard } from "@/components/guidelines/guidelinecard"

export default function GuidelinesPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto space-y-8">
        
        <div className="space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Institutional AI Guidelines
          </h1>
          <p className="text-muted-foreground">
            Please review the official institutional guidelines regarding 
            the responsible and ethical use of AI tools in academic work.
          </p>
        </div>

        <div className="grid gap-6">
          {guidelines.map((guideline) => (
            <GuidelineCard 
              key={guideline.id} 
              guideline={guideline} 
            />
          ))}
        </div>

      </div>
    </div>
  );
}