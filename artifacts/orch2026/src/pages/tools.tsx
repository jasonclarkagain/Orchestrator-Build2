import { PageWrapper } from "@/components/layout/page-wrapper";
import { useListTools, useDeleteTool, useToggleTool, getListToolsQueryKey } from "@workspace/api-client-react";
import { RuntimeBadge } from "@/components/runtime-badge";
import { StatusDot } from "@/components/status-dot";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Trash2, Power, PowerOff } from "lucide-react";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";
import { CreateToolDialog } from "@/components/create-tool-dialog";

export function Tools() {
  const [search, setSearch] = useState("");
  const { data: tools } = useListTools(search ? { search } : undefined);
  const deleteTool = useDeleteTool();
  const toggleTool = useToggleTool();
  const queryClient = useQueryClient();

  const handleToggle = (id: number) => {
    toggleTool.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() })
    });
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      deleteTool.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() })
      });
    }
  };

  return (
    <PageWrapper>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <h1 className="text-2xl text-primary uppercase tracking-wider font-bold">TOOL REGISTRY</h1>
        <div className="flex items-center gap-4">
          <div className="relative w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search tools..." 
              className="pl-8 rounded-none border-border bg-card font-mono text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <CreateToolDialog />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {tools?.map((tool, index) => (
            <motion.div
              key={tool.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
              className="relative border border-border bg-card p-5 group hover:border-primary/50 transition-colors"
            >
              <div className="flex justify-between items-start mb-4">
                <RuntimeBadge runtime={tool.runtime} />
                <div className="flex items-center gap-1 opacity-50 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-none hover:text-primary hover:bg-primary/10"
                    onClick={() => handleToggle(tool.id)}
                    disabled={toggleTool.isPending}
                  >
                    {tool.status === 'active' ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-7 w-7 rounded-none hover:text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(tool.id)}
                    disabled={deleteTool.isPending}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <div className="mb-2">
                <h3 className="font-bold text-lg font-mono truncate" title={tool.name}>{tool.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{tool.description || "No description provided."}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between font-mono text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <StatusDot status={tool.status} />
                  <span className="uppercase">{tool.status}</span>
                </div>
                <div>v{tool.version}</div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        
        {(!tools || tools.length === 0) && (
          <div className="col-span-full py-12 text-center border border-dashed border-border text-muted-foreground font-mono">
            No tools found matching your criteria.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
