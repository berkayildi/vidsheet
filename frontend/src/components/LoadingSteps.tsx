import type { PipelineState } from "../types";

interface LoadingStepsProps {
  state: PipelineState;
}

const steps = [
  { key: "analyzing", label: "Transcript fetched" },
  { key: "generating-image", label: "Content analyzed" },
  { key: "complete", label: "Infographic generated" },
] as const;

function getStepStatus(
  stepKey: string,
  state: PipelineState
): "pending" | "active" | "done" {
  const order = ["analyzing", "generating-image", "complete"];
  const stepIndex = order.indexOf(stepKey);
  const stateIndex = order.indexOf(state);

  if (stateIndex > stepIndex) return "done";
  if (state === stepKey) return "active";
  return "pending";
}

export function LoadingSteps({ state }: LoadingStepsProps) {
  if (state === "idle" || state === "error") return null;

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const status = getStepStatus(step.key, state);
        return (
          <div key={step.key} className="flex items-center gap-2.5">
            <div
              className={`h-2 w-2 rounded-full transition-colors ${
                status === "active" ? "animate-pulse" : ""
              }`}
              style={{
                background:
                  status === "done"
                    ? "var(--success)"
                    : status === "active"
                      ? "var(--accent)"
                      : "var(--text-ghost)",
              }}
            />
            <span
              className="text-xs"
              style={{
                color:
                  status === "done"
                    ? "var(--text-muted)"
                    : status === "active"
                      ? "var(--text-primary)"
                      : "var(--text-ghost)",
              }}
            >
              {status === "active" && step.key !== "complete"
                ? `${step.label}...`
                : step.label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
