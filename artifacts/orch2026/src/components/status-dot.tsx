import { cn } from "@/lib/utils";

type StatusDotProps = {
  status: "completed" | "failed" | "running" | "active" | "inactive" | string;
  className?: string;
};

export function StatusDot({ status, className }: StatusDotProps) {
  let colorClass = "bg-gray-500";
  let animate = false;

  switch (status.toLowerCase()) {
    case "completed":
    case "active":
      colorClass = "bg-primary";
      break;
    case "failed":
    case "inactive":
      colorClass = "bg-destructive";
      break;
    case "running":
      colorClass = "bg-primary";
      animate = true;
      break;
  }

  return (
    <div className={cn("relative flex items-center justify-center w-2 h-2", className)}>
      <div className={cn("absolute w-full h-full rounded-full", colorClass, animate && "animate-ping opacity-75")} />
      <div className={cn("relative w-full h-full rounded-full", colorClass)} />
    </div>
  );
}
