import { memo, useMemo } from "react";
import { useGetDashboardStats, useGetRevenueAnalytics, useGetOccupancyAnalytics, useGetRecentPayments, useGetDuesToday } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Users, Grid, Wallet, AlertCircle, Clock, TrendingUp, SearchX, type LucideIcon } from "lucide-react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, CartesianGrid } from "recharts";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const PIE_COLORS = ['hsl(var(--chart-1))', 'hsl(var(--chart-4))'];

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetDashboardStats();
  const { data: revenue, isLoading: revLoading } = useGetRevenueAnalytics();
  const { data: occupancy, isLoading: occLoading } = useGetOccupancyAnalytics();
  const { data: recentPayments, isLoading: payLoading } = useGetRecentPayments();
  const { data: duesToday, isLoading: duesLoading } = useGetDuesToday();

  const occupancyData = useMemo(() => [
    { name: 'Occupied', value: occupancy?.occupied || 0 },
    { name: 'Vacant', value: occupancy?.vacant || 0 }
  ], [occupancy?.occupied, occupancy?.vacant]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Overview</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Welcome back. Here is your library's status today.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard title="Total Students" value={stats?.totalStudents} icon={Users} loading={statsLoading} color="blue" />
        <StatCard title="Vacant Seats" value={stats?.vacantSeats} icon={Grid} loading={statsLoading} color="gray" />
        <StatCard title="Occupancy Rate" value={occupancy ? `${Math.round((occupancy.occupied / occupancy.total) * 100)}%` : undefined} subtitle={`${stats?.occupiedSeats} of ${stats?.totalSeats} seats`} icon={Grid} loading={occLoading} color="indigo" />
        <StatCard title="Today's Revenue" value={stats?.todayCollection ? `₹${stats.todayCollection}` : '₹0'} icon={Wallet} loading={statsLoading} color="emerald" />
        <StatCard title="Monthly Revenue" value={stats?.monthlyCollection ? `₹${stats.monthlyCollection}` : '₹0'} icon={TrendingUp} loading={statsLoading} color="violet" />
        <StatCard title="Pending Dues" value={stats?.pendingFees ? `₹${stats.pendingFees}` : '₹0'} subtitle={`${stats?.overdueCount || 0} students overdue`} icon={AlertCircle} loading={statsLoading} color="red" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Charts Area */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="h-[400px] flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Revenue Analytics</CardTitle>
              <CardDescription>Monthly collection over the last 12 months</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 pb-6">
              {revLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenue} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="monthLabel" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val}`} />
                    <Tooltip 
                      cursor={{ fill: 'hsl(var(--muted))' }}
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                      itemStyle={{ color: 'hsl(var(--foreground))' }}
                    />
                    <Bar dataKey="revenue" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} maxBarSize={50} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base">Recent Payments</CardTitle>
                  <CardDescription>Last 10 transactions recorded</CardDescription>
                </div>
                <Badge variant="outline" className="font-normal text-xs gap-1"><Clock className="w-3 h-3"/> Live</Badge>
              </div>
            </CardHeader>
            <CardContent>
              {payLoading ? <Skeleton className="h-[300px] w-full" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Seat</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Receipt</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!recentPayments || recentPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                            No recent payments
                          </TableCell>
                        </TableRow>
                      ) : (
                        recentPayments.map((payment) => (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.studentName}</TableCell>
                            <TableCell><span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">#{payment.seatNumber}</span></TableCell>
                            <TableCell className="text-emerald-600 font-semibold">₹{payment.amount}</TableCell>
                            <TableCell className="text-sm text-muted-foreground">{format(new Date(payment.paymentDate), "dd MMM, yyyy")}</TableCell>
                            <TableCell className="text-right font-mono text-xs text-muted-foreground">{payment.receiptNumber}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Side Panel Area */}
        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Seat Occupancy</CardTitle>
            </CardHeader>
            <CardContent>
              {occLoading ? <Skeleton className="h-[200px] w-full" /> : (
                <div className="h-[200px] relative flex flex-col items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={occupancyData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        stroke="none"
                      >
                        {PIE_COLORS.map((color, index) => (
                          <Cell key={`cell-${index}`} fill={color} />
                        ))}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderRadius: '8px', border: '1px solid hsl(var(--border))', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                    <span className="text-3xl font-bold text-foreground">{occupancy?.occupied}</span>
                    <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Occupied</span>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                  <span className="text-xs font-medium text-muted-foreground">Occupied ({occupancy?.occupied})</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-muted-foreground/30" />
                  <span className="text-xs font-medium text-muted-foreground">Vacant ({occupancy?.vacant})</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-semibold flex items-center gap-2 text-destructive">
                <AlertCircle className="w-4 h-4" />
                Dues Today & Overdue
              </CardTitle>
            </CardHeader>
            <CardContent>
              {duesLoading ? <Skeleton className="h-[200px] w-full" /> : (
                <div className="space-y-2.5">
                  {!duesToday || duesToday.length === 0 ? (
                    <div className="text-center py-6 text-muted-foreground flex flex-col items-center">
                      <SearchX className="w-8 h-8 mb-2 opacity-30" />
                      <p className="text-sm">No dues expected today</p>
                    </div>
                  ) : (
                    duesToday.slice(0, 5).map(student => (
                      <div key={student.id} className="flex items-center justify-between p-3 bg-muted/40 rounded-lg border border-border/50 hover:bg-muted/60 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm truncate">{student.name}</p>
                          <p className="text-xs text-muted-foreground">Seat {student.seatNumber}</p>
                          {(student as any).shifts && (student as any).shifts.length > 0 && (
                            <div className="flex gap-1 mt-1 flex-wrap">
                              {(student as any).shifts.slice(0, 2).map((shift: string) => (
                                <span key={shift} className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium capitalize">
                                  {shift}
                                </span>
                              ))}
                              {(student as any).shifts.length > 2 && (
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-600 font-medium">
                                  +{(student as any).shifts.length - 2}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                        <div className="text-right shrink-0 ml-3">
                          <p className="font-semibold text-sm">₹{student.monthlyFee}</p>
                          <Badge variant="destructive" className="mt-1 text-[10px] px-1.5 h-4">Unpaid</Badge>
                        </div>
                      </div>
                    ))
                  )}
                  {duesToday && duesToday.length > 5 && (
                    <p className="text-xs text-center text-muted-foreground pt-2 border-t border-border/50">
                      + {duesToday.length - 5} more students
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

const colorClasses: Record<string, { bg: string; icon: string }> = {
  blue: { bg: 'bg-blue-50', icon: 'text-blue-600' },
  gray: { bg: 'bg-slate-50', icon: 'text-slate-500' },
  indigo: { bg: 'bg-indigo-50', icon: 'text-indigo-600' },
  emerald: { bg: 'bg-emerald-50', icon: 'text-emerald-600' },
  violet: { bg: 'bg-violet-50', icon: 'text-violet-600' },
  red: { bg: 'bg-red-50', icon: 'text-red-500' },
};

const StatCard = memo(function StatCard({ title, value, subtitle, icon: Icon, loading, color = "blue" }: { title: string, value?: string | number, subtitle?: string, icon: LucideIcon, loading: boolean, color?: string }) {
  const c = colorClasses[color] || colorClasses.blue;
  return (
    <Card className="hover:shadow-md transition-shadow duration-200">
      <CardContent className="p-5 flex items-center gap-4">
        <div className={`p-3 rounded-xl ${c.bg}`}>
          <Icon className={`w-5 h-5 ${c.icon}`} />
        </div>
        <div className="space-y-0.5">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <p className="text-2xl font-bold tracking-tight text-foreground">{value || "0"}</p>
          )}
          {subtitle && !loading && (
            <p className="text-[11px] text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
});
