import { Badge } from "@/components/ui/badge";

export function RuntimeBadge({ runtime }: { runtime: string }) {
  let colorClass = "bg-gray-800 text-gray-300 border-gray-700";

  switch (runtime.toLowerCase()) {
    case "bun":
      colorClass = "bg-amber-950 text-amber-500 border-amber-900";
      break;
    case "python":
      colorClass = "bg-blue-950 text-blue-400 border-blue-900";
      break;
    case "docker":
      colorClass = "bg-cyan-950 text-cyan-400 border-cyan-900";
      break;
    case "wasm":
      colorClass = "bg-purple-950 text-purple-400 border-purple-900";
      break;
  }

  return (
    <Badge variant="outline" className={`font-mono text-[10px] uppercase rounded-none tracking-wider ${colorClass}`}>
      {runtime}
    </Badge>
  );
}
