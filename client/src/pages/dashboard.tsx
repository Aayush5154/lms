import { useMemo } from "react";
import { useGetDashboardStats, useGetRevenueAnalytics, useGetOccupancyAnalytics, useGetRecentPayments, useGetDuesToday } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Grid, ArrowUpRight, ArrowDownRight, IndianRupee, Receipt, UserPlus, FileText, ChevronDown, User } from "lucide-react";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { format, formatDistanceToNow } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number; name?: string; color?: string }>;
  label?: string;
}

function CustomTooltip({ active, payload, label }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-lg">
      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
      <p className="text-sm font-bold text-foreground">₹{payload[0].value?.toLocaleString()}</p>
    </div>
  );
}

export default function Dashboard() {
  const { data: stats } = useGetDashboardStats();
  const { data: revenue, isLoading: revLoading } = useGetRevenueAnalytics();
  const { data: occupancy } = useGetOccupancyAnalytics();
  const { data: recentPayments, isLoading: payLoading } = useGetRecentPayments();
  const { data: duesToday } = useGetDuesToday();

  const revenueData = useMemo(() => {
    if (!revenue || revenue.length === 0) return [];
    return revenue.map(r => ({
      name: r.monthLabel || r.month.toString(),
      value: r.revenue
    }));
  }, [revenue]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Overview of your library management system</p>
        </div>
        <Button variant="outline" className="shadow-sm bg-card text-foreground font-medium h-9 text-sm">
          <CalendarIcon className="w-4 h-4 mr-2 text-muted-foreground" />
          May 20 - May 27, 2024
          <ChevronDown className="w-4 h-4 ml-2 opacity-50" />
        </Button>
      </div>

      {/* Stats Row - 4 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Students" 
          value={stats?.totalStudents || 0} 
          icon={<Users className="w-5 h-5 text-indigo-500"/>} 
          trend="+12.5%" 
          trendUp={true}
          delay={0}
        />
        <StatCard 
          title="Total Seats" 
          value={stats?.totalSeats || 0} 
          icon={<Grid className="w-5 h-5 text-blue-500"/>} 
          trend="+5.3%" 
          trendUp={true}
          delay={1}
        />
        <StatCard 
          title="Monthly Collection" 
          value={`₹${(stats?.monthlyCollection || 0).toLocaleString()}`} 
          icon={<IndianRupee className="w-5 h-5 text-emerald-500"/>} 
          trend="+18.7%" 
          trendUp={true}
          delay={2}
        />
        <StatCard 
          title="Pending Payments" 
          value={`₹${(stats?.pendingFees || 0).toLocaleString()}`} 
          icon={<Receipt className="w-5 h-5 text-red-500"/>} 
          trend="-8.4%" 
          trendUp={false}
          delay={3}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Monthly Collection Overview */}
          <Card className="card-shadow card-enter card-enter-delay-2 h-[380px] flex flex-col">
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Monthly Collection Overview</CardTitle>
              <Button variant="outline" size="sm" className="h-8 text-xs bg-muted/50 border-border">
                This Year <ChevronDown className="w-3 h-3 ml-1 opacity-50" />
              </Button>
            </CardHeader>
            <CardContent className="flex-1 pb-6 mt-4">
              {revLoading ? <Skeleton className="w-full h-full" /> : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val >= 1000 ? val/1000 + 'k' : val}`} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(var(--muted-foreground))', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'hsl(var(--background))' }} activeDot={{ r: 6 }} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="card-shadow card-enter card-enter-delay-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <QuickAction icon={<UserPlus className="w-6 h-6 text-amber-500" />} label="Add Student" bg="bg-amber-50 dark:bg-amber-500/10" border="border-amber-100 dark:border-amber-500/20" />
                <QuickAction icon={<IndianRupee className="w-6 h-6 text-emerald-500" />} label="Add Payment" bg="bg-emerald-50 dark:bg-emerald-500/10" border="border-emerald-100 dark:border-emerald-500/20" />
                <QuickAction icon={<User className="w-6 h-6 text-indigo-500" />} label="Allocate Seat" bg="bg-indigo-50 dark:bg-indigo-500/10" border="border-indigo-100 dark:border-indigo-500/20" />
                <QuickAction icon={<FileText className="w-6 h-6 text-blue-500" />} label="Generate Report" bg="bg-blue-50 dark:bg-blue-500/10" border="border-blue-100 dark:border-blue-500/20" />
              </div>
            </CardContent>
          </Card>

          {/* Recent Payments Preview */}
          <Card className="card-shadow card-enter card-enter-delay-4">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Payments Preview</CardTitle>
              <Button variant="link" className="text-sm text-indigo-600 h-auto p-0 font-semibold">View All Payments</Button>
            </CardHeader>
            <CardContent>
              {payLoading ? <Skeleton className="h-[200px] w-full" /> : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-muted/50 hover:bg-muted/50 border-b border-border">
                        <TableHead className="font-semibold text-muted-foreground">Student</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Amount</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Plan</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Payment Method</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                        <TableHead className="font-semibold text-muted-foreground">Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {!recentPayments || recentPayments.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">No recent payments</TableCell>
                        </TableRow>
                      ) : (
                        recentPayments.slice(0, 4).map((payment) => (
                          <TableRow key={payment.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                            <TableCell className="font-medium text-foreground">{payment.studentName}</TableCell>
                            <TableCell className="text-foreground">₹{payment.amount}</TableCell>
                            <TableCell className="text-muted-foreground">Monthly</TableCell>
                            <TableCell className="text-muted-foreground">UPI</TableCell>
                            <TableCell>
                              <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-500/20 shadow-none font-medium">Paid</Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground text-xs">{format(new Date(payment.paymentDate), "dd MMM")}</TableCell>
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

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Today's Summary */}
          <Card className="card-shadow card-enter card-enter-delay-3">
            <CardHeader className="pb-4">
              <CardTitle className="text-base font-bold">Today's Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <SummaryItem icon={<IndianRupee className="w-5 h-5 text-emerald-500"/>} label="Today's Collection" value={`₹${(stats?.todayCollection || 0).toLocaleString()}`} />
                <SummaryItem icon={<UserPlus className="w-5 h-5 text-emerald-500"/>} label="New Admissions" value="5" />
                <SummaryItem icon={<Grid className="w-5 h-5 text-amber-500"/>} label="Vacant Seats" value={String(occupancy?.vacant || 0)} />
                <SummaryItem icon={<User className="w-5 h-5 text-red-500"/>} label="Students Due Today" value={String(duesToday?.length || 0)} />
              </div>
            </CardContent>
          </Card>

          {/* Recent Activities */}
          <Card className="card-shadow card-enter card-enter-delay-4">
            <CardHeader className="pb-4 flex flex-row items-center justify-between">
              <CardTitle className="text-base font-bold">Recent Activities</CardTitle>
              <Button variant="link" className="text-sm text-indigo-600 h-auto p-0 font-semibold">View All</Button>
            </CardHeader>
            <CardContent>
              {payLoading ? <Skeleton className="h-[200px] w-full" /> : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                  {!recentPayments || recentPayments.length === 0 ? (
                    <div className="text-center text-muted-foreground text-sm py-8">No recent activities</div>
                  ) : (
                    recentPayments.slice(0, 4).map((payment, i) => (
                      <ActivityItem 
                        key={payment.id || i}
                        icon={<IndianRupee className="w-4 h-4 text-emerald-500"/>} 
                        title="Payment received" 
                        subtitle={`${payment.studentName} - ₹${payment.amount}`} 
                        time={formatDistanceToNow(new Date(payment.paymentDate), { addSuffix: true })} 
                      />
                    ))
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

function CalendarIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>
    </svg>
  );
}

function StatCard({ title, value, icon, trend, trendUp, delay = 0 }: any) {
  return (
    <Card className={`shadow-sm card-enter`} style={{ animationDelay: `${delay * 60}ms` }}>
      <CardContent className="p-5">
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-muted border border-border shadow-sm">{icon}</div>
            <span className="text-sm font-semibold text-muted-foreground">{title}</span>
          </div>
        </div>
        <div className="mt-2 flex items-baseline justify-between gap-2">
          <span className="text-3xl font-bold tracking-tight text-foreground">{value}</span>
        </div>
        <div className={`text-xs font-semibold flex items-center mt-2 ${trendUp ? "text-emerald-500" : "text-destructive"}`}>
          {trendUp ? <ArrowUpRight className="w-3.5 h-3.5 mr-1" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-1" />}
          {trend} <span className="text-muted-foreground ml-1.5 font-normal">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}

function SummaryItem({ icon, label, value }: { icon: any, label: string, value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-muted rounded-md border border-border shadow-sm">
          {icon}
        </div>
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
      </div>
      <span className="text-base font-bold text-foreground">{value}</span>
    </div>
  );
}

function QuickAction({ icon, label, bg, border }: { icon: any, label: string, bg: string, border: string }) {
  return (
    <div className={`flex flex-col items-center justify-center p-4 rounded-xl border ${border} ${bg} cursor-pointer hover:shadow-md transition-all`}>
      <div className="p-3 bg-background rounded-xl shadow-sm mb-3">
        {icon}
      </div>
      <span className="text-xs font-semibold text-foreground text-center">{label}</span>
    </div>
  );
}

function ActivityItem({ icon, title, subtitle, time }: { icon: any, title: string, subtitle: string, time: string }) {
  return (
    <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
      <div className="flex items-center justify-center w-10 h-10 rounded-full border border-border bg-background shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10">
        {icon}
      </div>
      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-3 rounded-lg border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between mb-0.5">
          <div className="font-semibold text-sm text-foreground">{title}</div>
          <div className="text-xs font-medium text-muted-foreground">{time}</div>
        </div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
    </div>
  );
}
