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
import { openReceiptPrint } from "@/utils/receiptTemplate";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
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
    openReceiptPrint({ receiptNumber: payment.receiptNumber, studentName: payment.studentName, seatNumber: payment.seatNumber, paymentDate: payment.paymentDate, month: payment.month ?? 1, year: payment.year, amount: payment.amount, notes: payment.notes });
  };

  const yearOptions = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1];

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50"><Receipt className="w-5 h-5 text-indigo-600" /></div>
            Payments
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 ml-[52px]">History of all fee transactions</p>
        </div>
        {payments.length > 0 && (
          <Badge variant="secondary" className="text-sm px-4 py-1.5 font-semibold bg-emerald-50 text-emerald-700 border-emerald-200 badge-hover card-enter card-enter-delay-1">
            <IndianRupee className="w-3.5 h-3.5 mr-1" />
            {totalAmount.toLocaleString()} collected
          </Badge>
        )}
      </div>

      <Card className="card-shadow card-enter card-enter-delay-2">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <CardTitle className="text-base">All Transactions</CardTitle>
            <div className="flex gap-2">
              <Select value={filterMonth} onValueChange={setFilterMonth}>
                <SelectTrigger className="w-36"><SelectValue placeholder="Month" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Months</SelectItem>
                  {MONTHS.map((m, i) => (<SelectItem key={i + 1} value={String(i + 1)}>{m}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={filterYear} onValueChange={setFilterYear}>
                <SelectTrigger className="w-28"><SelectValue placeholder="Year" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {yearOptions.map(y => (<SelectItem key={y} value={String(y)}>{y}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          ) : payments.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="text-sm">No payments found for the selected period</p>
            </div>
          ) : (
            <div className="rounded-lg border border-border/60 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
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
                    <TableRow key={payment.id} className="table-row-hover">
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{payment.receiptNumber}</span>
                      </TableCell>
                      <TableCell className="font-medium text-sm">{payment.studentName}</TableCell>
                      <TableCell>
                        <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">#{payment.seatNumber}</span>
                      </TableCell>
                      <TableCell>
                        <span className="font-bold text-emerald-600">₹{Number(payment.amount).toLocaleString()}</span>
                      </TableCell>
                      <TableCell className="text-sm">
                        {MONTHS[(payment.month ?? 1) - 1]} {payment.year}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(payment.paymentDate), "dd MMM, yyyy")}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground transition-all duration-150 hover:scale-110"
                          title="Print receipt" onClick={() => handlePrint(payment)}>
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
