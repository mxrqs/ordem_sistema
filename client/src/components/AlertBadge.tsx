import { AlertCircle } from "lucide-react";

interface AlertBadgeProps {
  count: number;
  showLabel?: boolean;
}

export function AlertBadge({ count, showLabel = true }: AlertBadgeProps) {
  if (count === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1 bg-red-100 border border-red-300 rounded-full">
      <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
      {showLabel && (
        <span className="text-sm font-semibold text-red-700">
          {count} {count === 1 ? "pendência" : "pendências"}
        </span>
      )}
      {!showLabel && (
        <span className="text-xs font-bold text-red-700 bg-red-200 px-2 py-0.5 rounded-full">
          {count}
        </span>
      )}
    </div>
  );
}
