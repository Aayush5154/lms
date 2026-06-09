import { useState } from "react";
import { useGetMonthlyRevenueReport, useGetPendingFeesReport } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import * as XLSX from "xlsx";
import { format } from "date-fns";

export default function Reports() {
  const [month, setMonth] = useState((new Date().getMonth() + 1).toString());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  const { data: revenue, isLoading: revLoading } = useGetMonthlyRevenueReport({
    month: Number(month),
    year: Number(year)
  });

  const { data: pending, isLoading: pendingLoading } = useGetPendingFeesReport();

  const exportRevenue = () => {
    if (!revenue?.payments) return;
    const ws = XLSX.utils.json_to_sheet(revenue.payments.map(p => ({
      'Receipt': p.receiptNumber,
      'Date': format(new Date(p.paymentDate), 'yyyy-MM-dd'),
      'Student': p.studentName,
      'Seat': p.seatNumber,
      'Amount': p.amount,
      'Notes': p.notes || ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Revenue");
    XLSX.writeFile(wb, `Revenue_${year}_${month}.xlsx`);
  };

  const exportPending = () => {
    if (!pending) return;
    const ws = XLSX.utils.json_to_sheet(pending.map((s: any) => ({
      'Name': s.name,
      'Phone': s.phone,
      'Seat': s.seatNumber,
      'Monthly Fee': s.monthlyFee,
      'Due Date': s.nextDueDate ? format(new Date(s.nextDueDate), 'yyyy-MM-dd') : ''
    })));
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Pending Fees");
    XLSX.writeFile(wb, `Pending_Fees_${format(new Date(), 'yyyy_MM_dd')}.xlsx`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">Reports</h1>
        <p className="text-muted-foreground">View and export analytical reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="flex flex-col">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div>
                <CardTitle>Monthly Revenue</CardTitle>
                <CardDescription>Income and payments for selected month</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportRevenue} disabled={!revenue?.payments?.length}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1 space-y-4">
            <div className="flex gap-4 mb-4">
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
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                  <p className="text-2xl font-bold text-primary">₹{revenue?.totalRevenue || 0}</p>
                </div>
                <div className="bg-muted p-4 rounded-lg border">
                  <p className="text-sm text-muted-foreground mb-1">Payments Received</p>
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
                <CardTitle>Pending Fees</CardTitle>
                <CardDescription>All students with unpaid dues</CardDescription>
              </div>
              <Button size="sm" variant="outline" onClick={exportPending} disabled={!pending?.length}>
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex-1">
            {pendingLoading ? <Skeleton className="h-32 w-full" /> : (
              <div className="bg-destructive/5 p-4 rounded-lg border border-destructive/20 mb-6">
                <p className="text-sm text-muted-foreground mb-1 text-destructive">Total Pending Amount</p>
                <p className="text-2xl font-bold text-destructive">
                  ₹{pending?.reduce((acc: number, curr: any) => acc + curr.monthlyFee, 0) || 0}
                </p>
                <p className="text-sm text-destructive/80 mt-1">From {pending?.length || 0} students</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
