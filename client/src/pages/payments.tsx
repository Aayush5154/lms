import { useState } from "react";
import { useListPayments } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Printer, Receipt, IndianRupee } from "lucide-react";
import { format } from "date-fns";

const MONTHS = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];

const now = new Date();

export default function Payments() {
  const [filterMonth, setFilterMonth] = useState("all");
  const [filterYear, setFilterYear] = useState(String(now.getFullYear()));

  const params: Record<string, string | number> = {};
  if (filterMonth !== "all") params.month = Number(filterMonth);
  if (filterYear !== "all") params.year = Number(filterYear);

  const { data, isLoading } = useListPayments({ params } as any);
  const payments = data?.payments ?? [];

  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount), 0);

  const handlePrint = (payment: (typeof payments)[0]) => {
    const monthName = MONTHS[(payment.month ?? 1) - 1];
    const win = window.open("", "_blank", "width=600,height=700");
    if (!win) return;
    win.document.write(`
      <html><head><title>Receipt - ${payment.receiptNumber}</title>
      <style>
        body { font-family: 'Segoe UI', sans-serif; margin: 0; padding: 24px; color: #111; }
        .receipt { max-width: 520px; margin: auto; border: 2px solid #222; border-radius: 8px; padding: 28px; }
        .header { text-align: center; border-bottom: 2px dashed #ccc; padding-bottom: 16px; margin-bottom: 16px; }
        .header h1 { margin: 0; font-size: 22px; } .header p { color: #555; font-size: 13px; margin: 4px 0; }
        .badge { background: #16a34a; color: white; padding: 4px 14px; border-radius: 999px; font-size: 12px; font-weight: bold; }
        .row { display: flex; justify-content: space-between; padding: 6px 0; border-bottom: 1px solid #f0f0f0; font-size: 14px; }
        .amount-row { display: flex; justify-content: space-between; margin-top: 8px; background: #f0fdf4; border-radius: 6px; padding: 10px 12px; }
        .footer { text-align: center; margin-top: 20px; color: #888; font-size: 11px; border-top: 1px dashed #ccc; padding-top: 12px; }
        @media print { body { padding: 0; } }
      </style></head><body>
      <div class="receipt">
        <div class="header">
          <h1>📚 PAYMENT RECEIPT</h1>
          <p>Library Management System</p>
          <span class="badge">✓ PAID</span>
        </div>
        <div class="row"><span style="color:#666">Receipt No.</span><span style="font-weight:600;font-family:monospace">${payment.receiptNumber}</span></div>
        <div class="row"><span style="color:#666">Student Name</span><span style="font-weight:600">${payment.studentName}</span></div>
        <div class="row"><span style="color:#666">Seat Number</span><span style="font-weight:600">#${payment.seatNumber}</span></div>
        <div class="row"><span style="color:#666">Payment Date</span><span style="font-weight:600">${format(new Date(payment.paymentDate), "dd MMM, yyyy")}</span></div>
        <div class="row"><span style="color:#666">For Month</span><span style="font-weight:600">${monthName} ${payment.year}</span></div>
        ${payment.notes ? `<div class="row"><span style="color:#666">Notes</span><span style="font-weight:600">${payment.notes}</span></div>` : ""}
        <div class="amount-row">
          <span style="color:#166534;font-weight:700;font-size:15px">Amount Paid</span>
          <span style="color:#16a34a;font-weight:800;font-size:18px">₹${Number(payment.amount).toLocaleString()}</span>
        </div>
        <div class="footer">Thank you! This is a computer-generated receipt.</div>
      </div>
      </body></html>
    `);
    win.document.close();
    win.focus();
    setTimeout(() => { win.print(); win.close(); }, 400);
  };

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-primary" /> Payments
          </h1>
          <p className="text-muted-foreground">History of all fee transactions</p>
        </div>
        {payments.length > 0 && (
          <Badge variant="secondary" className="text-base px-4 py-1.5 font-semibold">
            <IndianRupee className="w-4 h-4 mr-1" />
            {totalAmount.toLocaleString()} collected
          </Badge>
        )}
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-lg">All Transactions</CardTitle>
            <div className="flex gap-2">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-36">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((m, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-28">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.map(y => (
                    <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p>No payments found for the selected period</p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Receipt No.</TableHead>
                    <TableHead>Student</TableHead>
                    <TableHead>Seat</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>For Month</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Receipt</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map(payment => (
                    <TableRow key={payment.id} className="hover:bg-muted/40">
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{payment.receiptNumber}</span>
                      </TableCell>
                      <TableCell className="font-medium">{payment.studentName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">#{payment.seatNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-green-600">₹{Number(payment.amount).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {MONTHS[(payment.month ?? 1) - 1]} {payment.year}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(payment.paymentDate), "dd MMM, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost" size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-foreground"
                          title="Print receipt"
                          onClick={() => handlePrint(payment)}
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
