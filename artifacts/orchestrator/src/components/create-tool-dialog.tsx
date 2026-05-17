import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useCreateTool, getListToolsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string(),
  runtime: z.enum(["bun", "python", "docker", "wasm"]),
  version: z.string().min(1, "Version is required"),
});

export function CreateToolDialog() {
  const [open, setOpen] = useState(false);
  const createTool = useCreateTool();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      runtime: "bun",
      version: "1.0.0",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    createTool.mutate({ 
      data: {
        ...values,
        runtime: values.runtime as "bun" | "python" | "docker" | "wasm"
      } 
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        setOpen(false);
        form.reset();
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="rounded-none font-mono tracking-wider gap-2">
          <Plus className="h-4 w-4" /> NEW TOOL
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] rounded-none border-primary/50 bg-card font-mono text-foreground">
        <DialogHeader>
          <DialogTitle className="text-primary font-bold uppercase tracking-wider">REGISTER NEW TOOL</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase">Tool Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. data-analyzer" className="rounded-none bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase">Description</FormLabel>
                  <FormControl>
                    <Input placeholder="What does this tool do?" className="rounded-none bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="runtime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase">Runtime</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="rounded-none bg-background border-border">
                        <SelectValue placeholder="Select runtime" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="rounded-none border-border bg-card">
                      <SelectItem value="bun">BUN</SelectItem>
                      <SelectItem value="python">PYTHON</SelectItem>
                      <SelectItem value="docker">DOCKER</SelectItem>
                      <SelectItem value="wasm">WASM</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="version"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs text-muted-foreground uppercase">Version</FormLabel>
                  <FormControl>
                    <Input placeholder="1.0.0" className="rounded-none bg-background border-border" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end pt-4">
              <Button type="submit" disabled={createTool.isPending} className="rounded-none font-mono uppercase w-full">
                {createTool.isPending ? "REGISTERING..." : "REGISTER TOOL"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
