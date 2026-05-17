import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useGetExecution, getGetExecutionQueryKey } from "@workspace/api-client-react";
import { RuntimeBadge } from "./runtime-badge";
import { StatusDot } from "./status-dot";
import { format } from "date-fns";

export function ExecutionDetailDialog({ 
  executionId, 
  open, 
  onOpenChange 
}: { 
  executionId: number | null; 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
}) {
  const { data: execution, isLoading } = useGetExecution(executionId!, {
    query: {
      enabled: !!executionId && open,
      queryKey: getGetExecutionQueryKey(executionId!),
    }
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] rounded-none border-primary/50 bg-card font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold uppercase tracking-wider flex items-center gap-2">
            EXECUTION DETAIL
            {execution && <span className="text-muted-foreground text-sm font-normal ml-2">EXE_{execution.id.toString().padStart(4, "0")}</span>}
          </DialogTitle>
        </DialogHeader>

        {isLoading && <div className="p-8 text-center text-primary animate-pulse-fast">LOADING...</div>}

        {execution && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 border border-border p-4 bg-background">
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Tool</span>
                <div className="font-bold text-lg">{execution.toolName}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Status</span>
                <div className="flex items-center gap-2 uppercase">
                  <StatusDot status={execution.status} />
                  {execution.status}
                </div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Runtime</span>
                <RuntimeBadge runtime={execution.runtime} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Started At</span>
                <div className="text-sm">{format(new Date(execution.startedAt), "yyyy-MM-dd HH:mm:ss")}</div>
              </div>
              <div>
                <span className="text-xs text-muted-foreground uppercase block mb-1">Duration</span>
                <div className="text-sm">{execution.durationMs !== null ? `${execution.durationMs}ms` : "-"}</div>
              </div>
            </div>

            <div>
              <span className="text-xs text-primary uppercase block mb-2 font-bold">OUTPUT_LOG</span>
              <div className="border border-border bg-black p-4 text-xs h-48 overflow-auto text-gray-300">
                {execution.output ? (
                  <pre className="whitespace-pre-wrap font-mono m-0">{execution.output}</pre>
                ) : (
                  <div className="text-muted-foreground text-center italic opacity-50 mt-16">No output log available</div>
                )}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
