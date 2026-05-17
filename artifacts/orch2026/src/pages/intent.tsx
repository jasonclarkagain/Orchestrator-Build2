import { PageWrapper } from "@/components/layout/page-wrapper";
import { useParseIntent, useTriggerExecution } from "@workspace/api-client-react";
import { useState } from "react";
import { Terminal, Command, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RuntimeBadge } from "@/components/runtime-badge";
import { useToast } from "@/hooks/use-toast";

export function Intent() {
  const [query, setQuery] = useState("");
  const parseIntent = useParseIntent();
  const triggerExecution = useTriggerExecution();
  const { toast } = useToast();

  const handleParse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    parseIntent.mutate({ data: { query } });
  };

  const handleExecute = (toolId: number) => {
    triggerExecution.mutate({ data: { toolId } }, {
      onSuccess: () => {
        toast({
          title: "Execution Triggered",
          description: "Sequence has been successfully started.",
        });
      },
      onError: () => {
        toast({
          title: "Execution Failed",
          description: "Could not trigger execution sequence.",
          variant: "destructive",
        });
      }
    });
  };

  return (
    <PageWrapper className="max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Terminal className="w-6 h-6 text-primary" />
        <h1 className="text-2xl text-primary uppercase tracking-wider font-bold">INTENT ENGINE</h1>
      </div>

      <div className="border border-border bg-card mb-8">
        <div className="bg-muted px-4 py-2 border-b border-border flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-destructive/50" />
            <div className="w-3 h-3 rounded-full bg-amber-500/50" />
            <div className="w-3 h-3 rounded-full bg-primary/50" />
          </div>
          <span className="font-mono text-xs text-muted-foreground ml-2">sys@orch2026:~</span>
        </div>
        
        <form onSubmit={handleParse} className="p-4 flex flex-col gap-4">
          <label className="font-mono text-xs text-primary uppercase">QUERY INPUT</label>
          <div className="relative">
            <ChevronRight className="absolute left-2 top-3 w-4 h-4 text-muted-foreground" />
            <textarea
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-transparent border border-border p-2 pl-8 font-mono text-sm min-h-[100px] focus:outline-none focus:border-primary resize-none"
              placeholder="Describe what you want to execute (e.g. 'run python data analyzer tool')"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleParse(e);
                }
              }}
            />
          </div>
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="rounded-none font-mono tracking-wider"
              disabled={!query.trim() || parseIntent.isPending}
            >
              <Command className="w-4 h-4 mr-2" />
              {parseIntent.isPending ? "PARSING..." : "PARSE INTENT"}
            </Button>
          </div>
        </form>
      </div>

      {parseIntent.data && (
        <div className="border border-primary bg-primary/5 p-6 font-mono">
          <h2 className="text-primary font-bold mb-4 flex items-center gap-2">
            <ChevronRight className="w-4 h-4" /> PARSE_RESULT
          </h2>
          
          <div className="space-y-6 text-sm">
            <div>
              <span className="text-muted-foreground block mb-1">EXPLANATION:</span>
              <p className="text-foreground">{parseIntent.data.explanation}</p>
            </div>
            
            {parseIntent.data.matchedTools.length > 0 ? (
              <div>
                <span className="text-muted-foreground block mb-2">MATCHED_TOOLS:</span>
                <div className="flex flex-col gap-2">
                  {parseIntent.data.matchedTools.map(tool => (
                    <div key={tool.id} className="border border-primary/30 p-3 bg-card flex justify-between items-center">
                      <div>
                        <span className="font-bold">{tool.name}</span>
                        <span className="text-muted-foreground ml-2 text-xs">{tool.description}</span>
                      </div>
                      <RuntimeBadge runtime={tool.runtime} />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-amber-500">NO TOOLS MATCHED THIS INTENT.</div>
            )}
            
            {parseIntent.data.suggestedExecution && parseIntent.data.matchedTools.length > 0 && (
              <div className="pt-4 border-t border-primary/20 flex items-center gap-4">
                <span className="text-muted-foreground">SUGGESTED_ACTION:</span>
                <Button 
                  onClick={() => handleExecute(parseIntent.data.matchedTools[0].id)}
                  disabled={triggerExecution.isPending}
                  variant="outline" 
                  className="rounded-none border-primary text-primary hover:bg-primary hover:text-primary-foreground font-mono h-8"
                >
                  {triggerExecution.isPending ? "EXECUTING..." : "EXECUTE SEQUENCE"}
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </PageWrapper>
  );
}
