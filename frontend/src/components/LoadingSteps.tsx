import type { PipelineState, SourceMode } from "../types";

interface LoadingStepsProps {
  state: PipelineState;
  generateImage: boolean;
  sourceMode?: SourceMode;
}

function getStepStatus(
  stepKey: string,
  state: PipelineState,
  order: string[]
): "pending" | "active" | "done" {
  const stepIndex = order.indexOf(stepKey);
  const stateIndex = order.indexOf(state);

  if (stateIndex > stepIndex) return "done";
  if (state === stepKey) return "active";
  return "pending";
}

export function LoadingSteps({ state, generateImage, sourceMode = "youtube" }: LoadingStepsProps) {
  if (state === "idle" || state === "error") return null;

  const isX = sourceMode === "x-feed";

  const analyzeLabel = isX ? "Posts fetched from X" : "Transcript fetched";
  const doneLabel = isX ? "Digest generated" : "Content analyzed";

  const steps = generateImage
    ? [
        { key: "analyzing", label: analyzeLabel },
        { key: "generating-image", label: doneLabel },
        { key: "complete", label: "Infographic generated" },
      ]
    : [
        { key: "analyzing", label: analyzeLabel },
        { key: "complete", label: doneLabel },
      ];

  const order = steps.map((s) => s.key);

  return (
    <div className="flex flex-col gap-2">
      {steps.map((step) => {
        const status = getStepStatus(step.key, state, order);
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
