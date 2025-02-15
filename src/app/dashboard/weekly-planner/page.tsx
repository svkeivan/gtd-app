"use client";

import { useState } from "react";
import * as aiPlanner from "@/actions/ai-planner";

export default function WeeklyPlannerPage() {
  const [weeklyPlan, setWeeklyPlan] = useState<string | null>(null);
  const [prompt, setPrompt] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShowPrompt = async () => {
    setLoading(true);
    setError(null);
    try {
      const promptText = await aiPlanner.buildWeeklyPlanPrompt();
      setPrompt(promptText);
    } catch (err: any) {
      setError(err.message || "Failed to show prompt");
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePlan = async () => {
    if (!prompt) return;
    setLoading(true);
    setError(null);
    try {
      // Cast prompt as string to satisfy type checking
      const generatedPlan = await aiPlanner.generateWeeklyPlan(prompt as string);
      setWeeklyPlan(generatedPlan as string);
    } catch (err: any) {
      setError(err.message || "Failed to generate plan");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Weekly Planner</h1>
      <div style={{ marginBottom: "1rem" }}>
        <button onClick={handleShowPrompt} disabled={loading} style={{ marginRight: "1rem" }}>
          {loading ? "Loading Prompt..." : "Show Prompt"}
        </button>
        {prompt && (
          <button onClick={handleGeneratePlan} disabled={loading}>
            {loading ? "Generating Plan..." : "Generate Plan"}
          </button>
        )}
      </div>
      {error && <div style={{ color: "red", marginBottom: "1rem" }}>Error: {error}</div>}
      {prompt && (
        <div style={{ marginBottom: "1rem" }}>
          <h2>Prompt:</h2>
          <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem" }}>
            {prompt}
          </pre>
        </div>
      )}
      {weeklyPlan && (
        <div>
          <h2>Weekly Plan:</h2>
          <pre style={{ whiteSpace: "pre-wrap", border: "1px solid #ccc", padding: "1rem" }}>
            {weeklyPlan}
          </pre>
        </div>
      )}
    </div>
  );
}
