import { useState } from "react";
import { useGetMonthlyRevenueReport, useGetPendingFeesReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, BarChart3 } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function Reports() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const { data: revenue, isLoading: revLoading } = useGetMonthlyRevenueReport({ month: Number(month), year: Number(year) });
  const { data: pending, isLoading: pendingLoading } = useGetPendingFeesReport();

  const exportRevenue = () => {
    if (!revenue?.payments) return;
    const ws = XLSX.utils.json_to_sheet(revenue.payments.map(p => ({
      'Receipt': p.receiptNumber, 'Date': format(new Date(p.paymentDate), 'yyyy-MM-dd'),
      'Student': p.studentName, 'Seat': p.seatNumber, 'Amount': p.amount, 'Notes': p.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    XLSX.writeFile(wb, `Revenue_${year}_${month}.xlsx`);
  };

  const exportPending = () => {
    if (!pending) return;
    const ws = XLSX.utils.json_to_sheet(pending.map((s: any) => ({
      'Name': s.name, 'Phone': s.phone, 'Seat': s.seatNumber,
      'Monthly Fee': s.monthlyFee, 'Due Date': s.nextDueDate ? format(new Date(s.nextDueDate), 'yyyy-MM-dd') : ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Fees");
    XLSX.writeFile(wb, `Pending_Fees_${format(new Date(), 'yyyy_MM_dd')}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-50"><BarChart3 className="w-5 h-5 text-indigo-600" /></div>
          Reports
        </h1>
        <p className="text-sm text-muted-foreground mt-0.5 ml-[52px]">View and export analytical reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">Monthly Revenue</CardTitle>
                <CardDescription>Income and payments for selected month</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportRevenue} disabled={!revenue?.payments?.length} className="text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex gap-3 mb-4">
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger className="w-[140px]"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }).map((_, i) => (
                    <SelectItem key={i+1} value={(i+1).toString()}>{format(new Date(2000, i, 1), 'MMMM')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={year} onValueChange={setYear}>
                <SelectTrigger className="w-[120px]"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  {[0, 1, 2].map(offset => {
                    const y = (new Date().getFullYear() - offset).toString();
                    return <SelectItem key={y} value={y}>{y}</SelectItem>;
                  })}
                </SelectContent>
              </Select>
            </div>

            {revLoading ? <Skeleton className="h-32 w-full" /> : (
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Total Revenue</p>
                  <p className="text-2xl font-bold text-indigo-600">₹{revenue?.totalRevenue || 0}</p>
                </div>
                <div className="bg-muted/30 p-4 rounded-xl border border-border/60">
                  <p className="text-xs text-muted-foreground mb-1 font-medium">Payments Received</p>
                  <p className="text-2xl font-bold">{revenue?.payments?.length || 0}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-base">Pending Fees</CardTitle>
                <CardDescription>All students with unpaid dues</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportPending} disabled={!pending?.length} className="text-xs">
                <Download className="w-3.5 h-3.5 mr-1.5" /> Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {pendingLoading ? <Skeleton className="h-32 w-full" /> : (
              <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                <p className="text-xs text-red-600 font-medium mb-1">Total Pending Amount</p>
                <p className="text-2xl font-bold text-red-600">
                  ₹{pending?.reduce((acc: number, curr: any) => acc + curr.monthlyFee, 0) || 0}
                </p>
                <p className="text-xs text-red-500/80 mt-1">From {pending?.length || 0} students</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
