import { PageWrapper } from "@/components/layout/page-wrapper";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  useGetDashboardStats,
  useGetExecutionVelocity,
  useGetRuntimeDistribution,
  useGetLiveActivity,
} from "@workspace/api-client-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Bar,
  BarChart,
  CartesianGrid,
} from "recharts";
import { StatusDot } from "@/components/status-dot";
import { RuntimeBadge } from "@/components/runtime-badge";
import { format } from "date-fns";

export function Dashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: velocity } = useGetExecutionVelocity();
  const { data: runtimeDist } = useGetRuntimeDistribution();
  const { data: liveActivity } = useGetLiveActivity({ limit: 10 });

  return (
    <PageWrapper>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 bg-primary/10 border border-primary text-primary">
            <div className="w-2 h-2 bg-primary animate-pulse-fast"></div>
          </div>
          <h1 className="text-2xl text-primary uppercase tracking-wider font-bold">SYSTEM OVERVIEW</h1>
        </div>
        <div className="flex items-center gap-2 border border-primary/30 px-3 py-1 bg-primary/5 text-primary text-xs">
          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-fast"></div>
          LIVE
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard title="ACTIVE TOOLS" value={`${stats?.activeTools || 0}/${stats?.totalTools || 0}`} />
        <StatCard title="EXECUTIONS 24H" value={stats?.executions24h || 0} />
        <StatCard title="SUCCESS RATE" value={`${((stats?.successRate || 0) * 100).toFixed(1)}%`} />
        <StatCard title="AVG DURATION" value={`${stats?.avgDurationMs || 0}ms`} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
        <Card className="lg:col-span-2 rounded-none border-border bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground">EXECUTION VELOCITY</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[300px]">
            {velocity && (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={velocity} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
                  <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(v) => format(new Date(v), "HH:mm")} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 0 }}
                    itemStyle={{ color: "hsl(var(--foreground))" }}
                    labelStyle={{ color: "hsl(var(--muted-foreground))" }}
                  />
                  <Area type="step" dataKey="count" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorCount)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card className="rounded-none border-border bg-card">
          <CardHeader className="pb-2 border-b border-border">
            <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground">RUNTIME DISTRIBUTION</CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-[300px]">
            {runtimeDist && (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={runtimeDist} layout="vertical" margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" horizontal={false} />
                  <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis type="category" dataKey="runtime" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "hsl(var(--card))", borderColor: "hsl(var(--border))", borderRadius: 0 }}
                    cursor={{ fill: "hsl(var(--muted))" }}
                  />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={0} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-none border-border bg-card">
        <CardHeader className="pb-2 border-b border-border">
          <CardTitle className="text-sm font-mono tracking-wider text-muted-foreground">LIVE ACTIVITY FEED</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-border">
            {liveActivity?.map((activity) => (
              <div key={activity.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-4">
                  <StatusDot status={activity.status} />
                  <div className="font-mono text-sm">
                    <span className="text-muted-foreground">EXE_{activity.id.toString().padStart(4, "0")}</span>
                    <span className="mx-2 text-border">|</span>
                    <span className="text-foreground">{activity.toolName}</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <RuntimeBadge runtime={activity.runtime} />
                  <span className="text-xs text-muted-foreground font-mono">
                    {format(new Date(activity.startedAt), "HH:mm:ss.SSS")}
                  </span>
                </div>
              </div>
            ))}
            {(!liveActivity || liveActivity.length === 0) && (
              <div className="p-8 text-center text-muted-foreground font-mono text-sm">No recent activity</div>
            )}
          </div>
        </CardContent>
      </Card>
    </PageWrapper>
  );
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card className="rounded-none border-border bg-card relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/50 group-hover:bg-primary transition-colors"></div>
      <CardHeader className="p-4 pb-2">
        <CardTitle className="text-xs font-mono text-muted-foreground tracking-wider">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-3xl font-bold font-mono text-foreground">{value}</div>
      </CardContent>
    </Card>
  );
}
