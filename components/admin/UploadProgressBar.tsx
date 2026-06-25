import type { AdminImageUploadProgress } from "@/lib/admin-image-upload";

interface UploadProgressBarProps {
  progress: AdminImageUploadProgress;
}

export default function UploadProgressBar({ progress }: UploadProgressBarProps) {
  return (
    <div
      className="mt-3 rounded-lg border border-orange/25 bg-orange/[0.06] px-3 py-3"
      role="status"
      aria-live="polite"
      aria-busy={progress.phase !== "done"}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm text-steel-light">{progress.message}</p>
          {progress.fileName ? (
            <p className="mt-0.5 truncate text-[11px] text-steel-dark">
              {progress.fileName}
            </p>
          ) : null}
        </div>
        <span className="shrink-0 text-sm font-medium tabular-nums text-orange">
          {progress.percent}%
        </span>
      </div>

      <div
        className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/[0.08]"
        aria-hidden
      >
        <div
          className="h-full rounded-full bg-orange transition-[width] duration-200 ease-out"
          style={{ width: `${progress.percent}%` }}
        />
      </div>
    </div>
  );
}
