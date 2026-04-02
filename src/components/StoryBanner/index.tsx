import { useSearchParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  getPathBySlug,
  type LearningPath,
  type PathStep,
} from "@/data/learningPaths";
import type { CSSProperties } from "react";

interface StoryContext {
  path: LearningPath;
  step: PathStep;
  stepIndex: number;
  totalSteps: number;
  prevStep: PathStep | null;
  nextStep: PathStep | null;
}

function resolveStoryContext(
  lpSlug: string,
  stepId: string,
): StoryContext | null {
  const path = getPathBySlug(lpSlug);
  if (!path) return null;

  const allSteps = path.tiers.flatMap((t) => t.steps);
  const stepIndex = allSteps.findIndex((s) => s.id === stepId);
  if (stepIndex === -1) return null;

  return {
    path,
    step: allSteps[stepIndex],
    stepIndex,
    totalSteps: allSteps.length,
    prevStep: stepIndex > 0 ? allSteps[stepIndex - 1] : null,
    nextStep: stepIndex < allSteps.length - 1 ? allSteps[stepIndex + 1] : null,
  };
}

export function StoryBanner() {
  const [searchParams] = useSearchParams();
  const lpSlug = searchParams.get("lp");
  const stepId = searchParams.get("step");

  if (!lpSlug || !stepId) return null;

  const ctx = resolveStoryContext(lpSlug, stepId);
  if (!ctx) return null;

  const { path, step, stepIndex, totalSteps, prevStep, nextStep } = ctx;

  return (
    <div
      className="algostory-banner"
      style={{ ["--algostory-accent"]: path.accentColor } as CSSProperties}
    >
      <div className="algostory-banner-head">
        <span className="algostory-banner-path">
          {path.icon} {path.title} — Step {stepIndex + 1}/{totalSteps}
        </span>
        <span className="algostory-banner-setting">📍 {step.setting}</span>
      </div>
      <div className="algostory-banner-narrative">{step.narrative}</div>
      <div className="algostory-banner-nav">
        {prevStep ? (
          <Link
            to={`${prevStep.algorithmPath}?lp=${lpSlug}&step=${prevStep.id}`}
          >
            ← {prevStep.name}
          </Link>
        ) : (
          <Link to={`/learning-paths/${lpSlug}`}>← Back to path</Link>
        )}
        {nextStep ? (
          <Link
            to={`${nextStep.algorithmPath}?lp=${lpSlug}&step=${nextStep.id}`}
          >
            {nextStep.name} →
          </Link>
        ) : (
          <Link to={`/learning-paths/${lpSlug}`}>Complete path →</Link>
        )}
      </div>
    </div>
  );
}
