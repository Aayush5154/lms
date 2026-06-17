import { useMemo } from "react";
import { 
  useGetDashboardStats, 
  useGetRevenueAnalytics, 
  useGetOccupancyAnalytics,
  useGetSeatLayout 
} from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { Users, IndianRupee, Receipt, Download, FileText, ArrowUpRight, ArrowDownRight, FileDown } from "lucide-react";
import * as XLSX from "xlsx";
import { jsPDF } from "jspdf";
import { format } from "date-fns";

export default function Reports() {
  const { data: stats } = useGetDashboardStats();
  const { data: revenueAnalytics } = useGetRevenueAnalytics();
  const { data: occupancy } = useGetOccupancyAnalytics();
  const { data: layout } = useGetSeatLayout();

  // Formatting revenue data for the chart
  const monthlyCollectionData = useMemo(() => {
    if (!revenueAnalytics || revenueAnalytics.length === 0) return [];
    return revenueAnalytics.map(r => ({
      name: r.monthLabel || r.month.toString(),
      value: r.revenue
    }));
  }, [revenueAnalytics]);

  const occupancyData = useMemo(() => {
    return [
      { name: 'Occupied', value: occupancy?.occupied || 0, fill: '#4f46e5' }, // indigo-600
      { name: 'Available', value: occupancy?.vacant || 0, fill: '#64748b' } // slate-500
    ];
  }, [occupancy]);

  const paymentData = useMemo(() => {
    let paid = 0, pending = 0, overdue = 0;
    if (layout) {
      layout.forEach(seat => {
        if (seat.isOccupied) {
          if (seat.status === 'overdue') overdue++;
          else if (seat.status === 'due-soon') pending++;
          else paid++;
        }
      });
    }
    return [
      { name: 'Paid', value: paid, fill: '#10b981' }, // emerald-500
      { name: 'Pending', value: pending, fill: '#f59e0b' }, // amber-500
      { name: 'Overdue', value: overdue, fill: '#ef4444' }, // red-500
    ];
  }, [layout]);

  const totalSeatsOccupiedRate = occupancy?.total 
    ? Math.round((occupancy.occupied / occupancy.total) * 100) 
    : 0;

  const totalStudentsWithPayments = paymentData.reduce((acc, curr) => acc + curr.value, 0);

  const getReportData = () => {
    if (!layout) return [];
    return layout.map(seat => ({
      'Seat Number': seat.seatNumber,
      'Status': seat.isOccupied ? seat.status : 'Vacant',
      'Student Name': seat.student?.name || 'N/A',
      'Phone': seat.student?.phone || 'N/A',
      'Monthly Fee': seat.student?.monthlyFee || 0,
      'Due Date': seat.student?.nextDueDate ? format(new Date(seat.student.nextDueDate), 'yyyy-MM-dd') : 'N/A',
    }));
  };

  const exportExcel = () => {
    const wsData = getReportData();
    if (wsData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Library Report");
    XLSX.writeFile(wb, `Library_Report_${format(new Date(), 'yyyy_MM_dd')}.xlsx`);
  };

  const exportCSV = () => {
    const wsData = getReportData();
    if (wsData.length === 0) return;
    const ws = XLSX.utils.json_to_sheet(wsData);
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Library_Report_${format(new Date(), 'yyyy_MM_dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Library Performance Report", 14, 22);
    
    doc.setFontSize(12);
    doc.text(`Generated on: ${format(new Date(), 'dd MMM yyyy')}`, 14, 32);
    
    doc.setFontSize(14);
    doc.text("Overview Statistics", 14, 45);
    doc.setFontSize(11);
    doc.text(`Total Students: ${stats?.totalStudents || 0}`, 14, 55);
    doc.text(`Monthly Collection: Rs. ${stats?.monthlyCollection || 0}`, 14, 62);
    doc.text(`Today's Collection: Rs. ${stats?.todayCollection || 0}`, 14, 69);
    doc.text(`Pending Fees: Rs. ${stats?.pendingFees || 0}`, 14, 76);

    doc.text(`Total Seats: ${occupancy?.total || 0}`, 110, 55);
    doc.text(`Occupied: ${occupancy?.occupied || 0}`, 110, 62);
    doc.text(`Vacant: ${occupancy?.vacant || 0}`, 110, 69);

    doc.setFontSize(14);
    doc.text("Seat Details (Occupied)", 14, 90);
    
    let yPos = 100;
    doc.setFontSize(10);
    doc.text("Seat", 14, yPos);
    doc.text("Status", 35, yPos);
    doc.text("Student Name", 65, yPos);
    doc.text("Phone", 130, yPos);
    doc.line(14, yPos + 2, 190, yPos + 2);
    
    yPos += 8;
    const occupiedLayout = layout?.filter(s => s.isOccupied) || [];
    
    occupiedLayout.forEach((seat, idx) => {
      if (yPos > 280) {
        doc.addPage();
        yPos = 20;
        doc.text("Seat", 14, yPos);
        doc.text("Status", 35, yPos);
        doc.text("Student Name", 65, yPos);
        doc.text("Phone", 130, yPos);
        doc.line(14, yPos + 2, 190, yPos + 2);
        yPos += 8;
      }

      doc.text(String(seat.seatNumber), 14, yPos);
      doc.text(String(seat.status), 35, yPos);
      doc.text(String(seat.student?.name || 'N/A').substring(0, 25), 65, yPos);
      doc.text(String(seat.student?.phone || 'N/A'), 130, yPos);
      yPos += 7;
    });

    if (occupiedLayout.length === 0) {
      doc.text("No occupied seats found.", 14, yPos);
    }

    doc.save(`Library_Report_${format(new Date(), 'yyyy_MM_dd')}.pdf`);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Reports Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">Analyze your library data and performance</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline" size="sm" className="h-9 shadow-sm">
            <Download className="w-4 h-4 mr-2" /> Export Report
          </Button>
          <Select defaultValue="this_year">
            <SelectTrigger className="w-[140px] h-9 shadow-sm text-sm font-medium">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="this_month">This Month</SelectItem>
              <SelectItem value="last_month">Last Month</SelectItem>
              <SelectItem value="this_year">This Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <ReportMiniStat 
          title="Total Students" 
          value={stats?.totalStudents || 0} 
          icon={<Users className="w-5 h-5 text-blue-500"/>} 
          trend="+12.5%" 
        />
        <ReportMiniStat 
          title="Monthly Collection" 
          value={`₹${(stats?.monthlyCollection || 0).toLocaleString()}`} 
          icon={<IndianRupee className="w-5 h-5 text-emerald-500"/>} 
          trend="+18.7%" 
        />
        <ReportMiniStat 
          title="Today's Collection" 
          value={`₹${(stats?.todayCollection || 0).toLocaleString()}`} 
          icon={<Receipt className="w-5 h-5 text-emerald-500"/>} 
          trend="+8.3%" 
        />
        <ReportMiniStat 
          title="Pending Amount" 
          value={`₹${(stats?.pendingFees || 0).toLocaleString()}`} 
          icon={<IndianRupee className="w-5 h-5 text-destructive"/>} 
          trend="-8.4%" 
          trendDown={true} 
          valueColor="text-destructive" 
        />
      </div>

      <Card className="shadow-sm overflow-hidden">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-foreground">Monthly Collection</h4>
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1 bg-muted">This Year</span>
              </div>
              <div className="h-[250px] w-full">
                {monthlyCollectionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyCollectionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val >= 1000 ? val/1000 + 'k' : val}`} />
                      <RechartsTooltip cursor={{ fill: 'hsl(var(--muted))' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }} formatter={(val: number) => [`₹${val}`, 'Collection']} />
                      <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} maxBarSize={40} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted text-muted-foreground">
                    No revenue data available
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-foreground">Seat Occupancy</h4>
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1 bg-muted">Current</span>
              </div>
              <div className="h-[250px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={occupancyData} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                      {occupancyData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-bold text-foreground">{totalSeatsOccupiedRate}%</span>
                </div>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-indigo-600"></div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium leading-none">Occupied</span>
                      <span className="text-muted-foreground text-xs mt-1">{occupancy?.occupied || 0} ({totalSeatsOccupiedRate}%)</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-slate-500"></div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium leading-none">Available</span>
                      <span className="text-muted-foreground text-xs mt-1">{occupancy?.vacant || 0} ({100 - totalSeatsOccupiedRate}%)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-foreground">Collection Trend</h4>
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1 bg-muted">This Year</span>
              </div>
              <div className="h-[250px] w-full">
                {monthlyCollectionData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={monthlyCollectionData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(val) => `₹${val >= 1000 ? val/1000 + 'k' : val}`} />
                      <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', background: 'hsl(var(--card))', color: 'hsl(var(--card-foreground))' }} formatter={(val: number) => [`₹${val}`, 'Collection']} />
                      <Line type="monotone" dataKey="value" stroke="#6366f1" strokeWidth={3} dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'hsl(var(--background))' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-border rounded-xl bg-muted text-muted-foreground">
                    No trend data available
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <h4 className="text-base font-bold text-foreground">Payment Status Distribution</h4>
                <span className="text-xs text-muted-foreground border border-border rounded-md px-2.5 py-1 bg-muted">Current</span>
              </div>
              <div className="h-[250px] w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={paymentData} innerRadius={60} outerRadius={90} paddingAngle={0} dataKey="value" stroke="none">
                      {paymentData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 flex flex-col gap-4 text-sm w-[120px]">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-emerald-500 shrink-0"></div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium leading-none">Paid</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {paymentData[0].value} ({totalStudentsWithPayments ? Math.round((paymentData[0].value / totalStudentsWithPayments) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-amber-500 shrink-0"></div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium leading-none">Pending</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {paymentData[1].value} ({totalStudentsWithPayments ? Math.round((paymentData[1].value / totalStudentsWithPayments) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-sm bg-red-500 shrink-0"></div>
                    <div className="flex flex-col">
                      <span className="text-foreground font-medium leading-none">Overdue</span>
                      <span className="text-muted-foreground text-xs mt-1">
                        {paymentData[2].value} ({totalStudentsWithPayments ? Math.round((paymentData[2].value / totalStudentsWithPayments) * 100) : 0}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>

          <div className="mt-10 pt-6 border-t border-border flex flex-wrap items-center gap-4">
            <span className="text-sm font-bold text-foreground mr-2">Quick Export</span>
            <Button variant="outline" size="sm" onClick={exportPDF} className="h-9 shadow-sm">
              <FileDown className="w-4 h-4 mr-2" /> Export PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportExcel} className="h-9 shadow-sm">
              <FileText className="w-4 h-4 mr-2" /> Export Excel
            </Button>
            <Button variant="outline" size="sm" onClick={exportCSV} className="h-9 shadow-sm">
              <FileText className="w-4 h-4 mr-2" /> Export CSV
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function ReportMiniStat({ title, value, icon, trend, trendDown, valueColor = "text-foreground" }: any) {
  return (
    <Card className="shadow-sm">
      <CardContent className="p-5 flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-muted border border-border shadow-sm">{icon}</div>
          <span className="text-sm font-semibold text-muted-foreground">{title}</span>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</span>
        </div>
        <div className={`text-xs font-medium flex items-center mt-1 ${trendDown ? "text-destructive" : "text-emerald-500"}`}>
          {trendDown ? <ArrowDownRight className="w-3.5 h-3.5 mr-1" /> : <ArrowUpRight className="w-3.5 h-3.5 mr-1" />}
          {trend} <span className="text-muted-foreground ml-1.5 font-normal">from last month</span>
        </div>
      </CardContent>
    </Card>
  );
}
