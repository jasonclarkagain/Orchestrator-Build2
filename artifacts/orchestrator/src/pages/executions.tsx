import { PageWrapper } from "@/components/layout/page-wrapper";
import { useListExecutions } from "@workspace/api-client-react";
import { RuntimeBadge } from "@/components/runtime-badge";
import { StatusDot } from "@/components/status-dot";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { format } from "date-fns";

import { ExecutionDetailDialog } from "@/components/execution-detail-dialog";

export function Executions() {
  const [status, setStatus] = useState<"completed" | "failed" | "running" | "all">("all");
  const [selectedExecutionId, setSelectedExecutionId] = useState<number | null>(null);
  
  const queryParams = status !== "all" ? { status } : undefined;
  const { data: executions } = useListExecutions(queryParams);

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl text-primary uppercase tracking-wider font-bold">EXECUTION LOG</h1>
        
        <div className="w-48">
          <Select value={status} onValueChange={(v: any) => setStatus(v)}>
            <SelectTrigger className="rounded-none border-border bg-card font-mono text-sm">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent className="rounded-none border-border bg-card font-mono">
              <SelectItem value="all">ALL STATUSES</SelectItem>
              <SelectItem value="completed">COMPLETED</SelectItem>
              <SelectItem value="failed">FAILED</SelectItem>
              <SelectItem value="running">RUNNING</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="border border-border bg-card">
        <Table>
          <TableHeader>
            <TableRow className="border-border hover:bg-transparent">
              <TableHead className="font-mono text-xs w-[100px]">ID</TableHead>
              <TableHead className="font-mono text-xs w-[120px]">STATUS</TableHead>
              <TableHead className="font-mono text-xs">TOOL NAME</TableHead>
              <TableHead className="font-mono text-xs w-[120px]">RUNTIME</TableHead>
              <TableHead className="font-mono text-xs w-[150px]">DURATION</TableHead>
              <TableHead className="font-mono text-xs w-[200px]">STARTED AT</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {executions?.map((execution) => (
              <TableRow 
                key={execution.id} 
                className="border-border hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => setSelectedExecutionId(execution.id)}
              >
                <TableCell className="font-mono text-sm text-muted-foreground">
                  EXE_{execution.id.toString().padStart(4, "0")}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 font-mono text-xs uppercase">
                    <StatusDot status={execution.status} />
                    {execution.status}
                  </div>
                </TableCell>
                <TableCell className="font-mono font-medium">
                  {execution.toolName}
                </TableCell>
                <TableCell>
                  <RuntimeBadge runtime={execution.runtime} />
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {execution.durationMs !== null ? `${execution.durationMs}ms` : "-"}
                </TableCell>
                <TableCell className="font-mono text-sm text-muted-foreground">
                  {format(new Date(execution.startedAt), "yyyy-MM-dd HH:mm:ss")}
                </TableCell>
              </TableRow>
            ))}
            
            {(!executions || executions.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-muted-foreground font-mono border-none">
                  No executions found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ExecutionDetailDialog 
        executionId={selectedExecutionId}
        open={selectedExecutionId !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedExecutionId(null);
        }}
      />
    </PageWrapper>
  );
}
