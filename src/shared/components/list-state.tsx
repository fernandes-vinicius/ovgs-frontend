import { AlertCircle, Loader2, Package } from "@/shared/components/icons";
import { cn } from "@/shared/lib/utils";

interface ListStateProps {
  message: string;
  className?: string;
}

export function LoadingState({ message, className }: ListStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground",
        className,
      )}
    >
      <Loader2 className="size-4 animate-spin" />
      {message}
    </div>
  );
}

export function ErrorState({ message, className }: ListStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-destructive",
        className,
      )}
    >
      <AlertCircle className="size-6" />
      {message}
    </div>
  );
}

export function EmptyState({ message, className }: ListStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2 py-16 text-center text-sm text-muted-foreground",
        className,
      )}
    >
      <Package className="size-6" />
      {message}
    </div>
  );
}
