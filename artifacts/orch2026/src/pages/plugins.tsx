import { PageWrapper } from "@/components/layout/page-wrapper";
import { useListPlugins, useInstallPlugin, useUninstallPlugin, getListPluginsQueryKey } from "@workspace/api-client-react";
import { RuntimeBadge } from "@/components/runtime-badge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Trash2, CheckCircle2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";

export function Plugins() {
  const { data: plugins } = useListPlugins();
  const installPlugin = useInstallPlugin();
  const uninstallPlugin = useUninstallPlugin();
  const queryClient = useQueryClient();

  const handleInstall = (id: number) => {
    installPlugin.mutate({ id }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPluginsQueryKey() })
    });
  };

  const handleUninstall = (id: number) => {
    if (confirm("Are you sure you want to uninstall this plugin?")) {
      uninstallPlugin.mutate({ id }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListPluginsQueryKey() })
      });
    }
  };

  return (
    <PageWrapper>
      <h1 className="text-2xl text-primary uppercase tracking-wider font-bold mb-8">PLUGIN REGISTRY</h1>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <AnimatePresence>
          {plugins?.map((plugin, index) => (
            <motion.div
              key={plugin.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ delay: index * 0.05 }}
              className={`border bg-card p-5 flex flex-col sm:flex-row gap-4 justify-between transition-colors ${
                plugin.installed ? 'border-primary/50 bg-primary/5' : 'border-border'
              }`}
            >
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="font-bold text-lg font-mono truncate">{plugin.name}</h3>
                  <Badge variant="secondary" className="rounded-none font-mono text-[10px] uppercase bg-muted text-muted-foreground border-border">
                    {plugin.category}
                  </Badge>
                </div>
                
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{plugin.description}</p>
                
                <div className="flex items-center gap-4 mt-auto">
                  <RuntimeBadge runtime={plugin.runtime} />
                  <span className="font-mono text-xs text-muted-foreground">v{plugin.version}</span>
                  {plugin.installed && (
                    <div className="flex items-center gap-1 text-primary text-xs font-mono ml-auto">
                      <CheckCircle2 className="w-3 h-3" /> INSTALLED
                    </div>
                  )}
                </div>
              </div>

              <div className="flex sm:flex-col items-center justify-center sm:border-l sm:border-border sm:pl-4 sm:ml-2 gap-2 mt-4 sm:mt-0">
                {plugin.installed ? (
                  <Button 
                    variant="outline" 
                    className="w-full sm:w-[120px] rounded-none border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-mono text-xs uppercase"
                    onClick={() => handleUninstall(plugin.id)}
                    disabled={uninstallPlugin.isPending}
                  >
                    <Trash2 className="w-4 h-4 mr-2" /> Uninstall
                  </Button>
                ) : (
                  <Button 
                    className="w-full sm:w-[120px] rounded-none font-mono text-xs uppercase"
                    onClick={() => handleInstall(plugin.id)}
                    disabled={installPlugin.isPending}
                  >
                    <Download className="w-4 h-4 mr-2" /> Install
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {(!plugins || plugins.length === 0) && (
          <div className="col-span-full py-12 text-center border border-dashed border-border text-muted-foreground font-mono">
            No plugins available.
          </div>
        )}
      </div>
    </PageWrapper>
  );
}
