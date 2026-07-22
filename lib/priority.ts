/** Priority scoring (PRD §21.3). Positive factors add, cost factors subtract. */

export type PriorityFactors = {
  businessValue: number;
  urgency: number;
  dependencyImportance: number;
  clientImpact: number;
  revenueImpact: number;
  complexity: number;
  effort: number;
  risk: number;
};

export function priorityScore(f: PriorityFactors): number {
  return (
    f.businessValue +
    f.urgency +
    f.dependencyImportance +
    f.clientImpact +
    f.revenueImpact -
    f.complexity -
    f.effort -
    f.risk
  );
}

export type PriorityLevel = "critical" | "high" | "medium" | "low" | "someday";

export function scoreToLevel(score: number): PriorityLevel {
  if (score >= 8) return "critical";
  if (score >= 5) return "high";
  if (score >= 2) return "medium";
  if (score >= -1) return "low";
  return "someday";
}

// ponytail: tiny self-check for the money/priority-ish math. Run with `npx tsx lib/priority.ts`.
if (process.argv[1]?.endsWith("priority.ts")) {
  const base = {
    businessValue: 5,
    urgency: 5,
    dependencyImportance: 5,
    clientImpact: 5,
    revenueImpact: 5,
    complexity: 1,
    effort: 1,
    risk: 1,
  };
  const s = priorityScore(base);
  if (s !== 22) throw new Error(`expected 22, got ${s}`);
  if (scoreToLevel(s) !== "critical") throw new Error("expected critical");
  if (scoreToLevel(0) !== "low") throw new Error("expected low");
  if (scoreToLevel(-5) !== "someday") throw new Error("expected someday");
  console.log("priority.ts self-check OK");
}
