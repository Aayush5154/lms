import { useState, useMemo } from "react";
import { useGetSeatLayout } from "@workspace/api-client-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Users, Calendar, AlertCircle, CheckCircle2, User, Wrench, Search, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
function Seats() {
  const { data: fullLayout, isLoading: layoutLoading } = useGetSeatLayout();
  const [selectedSeat, setSelectedSeat] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [showAllOccupied, setShowAllOccupied] = useState(false);
  const [search, setSearch] = useState("");
  const layout = fullLayout ?? [];
  const seatStats = useMemo(() => layout.reduce(
    (stats, seat) => {
      if (seat.isOccupied) {
        stats.occupied += 1;
        if (seat.status === "overdue") stats.overdue += 1;
        if (seat.status === "due-soon") stats.dueSoon += 1;
      } else {
        stats.vacant += 1;
      }
      return stats;
    },
    { occupied: 0, vacant: 0, overdue: 0, dueSoon: 0, total: layout.length }
  ), [layout]);
  const sections = useMemo(() => {
    const chunks = [];
    for (let i = 0; i < layout.length; i += 20) {
      chunks.push(layout.slice(i, i + 20));
    }
    return chunks.map((chunk, i) => ({
      title: `Section ${String.fromCharCode(65 + i)}`,
      seats: chunk
    }));
  }, [layout]);
  const filteredList = useMemo(() => {
    if (!search) return layout;
    const s = search.toLowerCase();
    return layout.filter(
      (seat) => String(seat.seatNumber).toLowerCase().includes(s) || seat.student?.name && seat.student.name.toLowerCase().includes(s)
    );
  }, [layout, search]);
  const occupiedSeats = useMemo(() => layout.filter((s) => s.isOccupied), [layout]);
  const getSeatColor = (seat) => {
    if (!seat.isOccupied) return "bg-background border-border text-muted-foreground hover:border-primary/50";
    if (seat.status === "overdue") return "bg-destructive border-destructive text-destructive-foreground shadow-sm";
    if (seat.status === "due-soon") return "bg-amber-400 border-amber-500 text-white shadow-sm";
    return "bg-emerald-500 border-emerald-600 text-white shadow-sm hover:border-emerald-700";
  };
  const handleSeatClick = (seat) => {
    if (seat.isOccupied) {
      setSelectedSeat(seat);
      setShowAllOccupied(false);
    }
  };
  return <div className="space-y-6 max-w-7xl mx-auto page-enter pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Seats Layout</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage library seats and view occupancy</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard title="Total Seats" value={seatStats.total || 0} icon={<Users className="w-5 h-5 text-indigo-500" />} />
        <StatCard title="Available" value={seatStats.vacant || 0} icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />} valueColor="text-emerald-500" />
        <StatCard title="Occupied" value={seatStats.occupied || 0} icon={<User className="w-5 h-5 text-red-500" />} valueColor="text-red-500" />
        <StatCard title="Due Soon" value={seatStats.dueSoon || 0} icon={<Calendar className="w-5 h-5 text-amber-500" />} valueColor="text-amber-500" />
        <StatCard title="Overdue" value={seatStats.overdue || 0} icon={<AlertCircle className="w-5 h-5 text-red-500" />} valueColor="text-red-500" />
        <StatCard title="Maintenance" value={0} icon={<Wrench className="w-5 h-5 text-muted-foreground" />} valueColor="text-muted-foreground" />
      </div>

      <div className="space-y-6">
        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Seats Layout View</CardTitle>
            <Button
    variant="ghost"
    size="sm"
    onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
    className="text-primary font-medium hover:text-primary/80"
  >
              {viewMode === "grid" ? <><List className="w-4 h-4 mr-2" /> List View</> : <><LayoutGrid className="w-4 h-4 mr-2" /> Grid View</>}
            </Button>
          </CardHeader>
          <CardContent className="p-6">
            {viewMode === "grid" ? <>
                <div className="flex flex-wrap items-center gap-6 mb-8 text-xs font-medium text-muted-foreground">
                  <LegendItem color="bg-emerald-500" label="Occupied" />
                  <LegendItem color="bg-background border border-border" label="Available" />
                  <LegendItem color="bg-amber-400" label="Due Soon" />
                  <LegendItem color="bg-destructive" label="Overdue" />
                  <LegendItem color="bg-purple-500" label="Maintenance" />
                  <LegendItem color="bg-muted" label="Unavailable" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
                  {sections.map((section, idx) => <div key={idx} className="space-y-3">
                      <h3 className="text-sm font-bold text-foreground">{section.title}</h3>
                      <div className="grid grid-cols-5 sm:grid-cols-10 lg:grid-cols-5 gap-2">
                        {section.seats.map((seat, i) => <button
    key={i}
    onClick={() => handleSeatClick(seat)}
    className={`h-10 rounded text-[11px] font-bold flex items-center justify-center transition-all border ${getSeatColor(seat)} ${seat.isOccupied ? "cursor-pointer hover:scale-105" : "cursor-default opacity-80"}`}
  >
                            {seat.seatNumber}
                          </button>)}
                      </div>
                    </div>)}
                </div>
              </> : <div className="space-y-4">
                <div className="relative max-w-sm">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input placeholder="Search seat # or student name..." className="pl-9 h-9 text-sm" value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <div className="border rounded-md overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="text-xs text-muted-foreground bg-muted border-b">
                      <tr>
                        <th className="px-4 py-3 font-semibold">Seat No.</th>
                        <th className="px-4 py-3 font-semibold">Status</th>
                        <th className="px-4 py-3 font-semibold">Student Name</th>
                        <th className="px-4 py-3 font-semibold">Phone</th>
                        <th className="px-4 py-3 font-semibold">Due Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredList.map((seat, i) => <tr key={i} className="border-b hover:bg-muted/50 transition-colors cursor-pointer" onClick={() => handleSeatClick(seat)}>
                          <td className="px-4 py-3 font-medium">{seat.seatNumber}</td>
                          <td className="px-4 py-3">
                            {!seat.isOccupied ? <Badge variant="outline" className="text-muted-foreground">Available</Badge> : <StatusBadge status={seat.status} />}
                          </td>
                          <td className="px-4 py-3">{seat.student?.name || "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">{seat.student?.phone || "-"}</td>
                          <td className="px-4 py-3 text-muted-foreground">
                            {seat.student?.nextDueDate ? format(new Date(seat.student.nextDueDate), "dd MMM yyyy") : "-"}
                          </td>
                        </tr>)}
                    </tbody>
                  </table>
                </div>
              </div>}

            {viewMode === "grid" && <div className="mt-8 flex items-center gap-2 p-3 bg-muted rounded-lg border text-sm text-foreground">
                <AlertCircle className="w-4 h-4 text-primary" />
                <p>Click on any seat to view student details and payment info.</p>
              </div>}
          </CardContent>
        </Card>

        <Card className="shadow-sm overflow-hidden">
          <CardHeader className="border-b pb-4 flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Seat Details Preview</CardTitle>
            <Button
    variant={showAllOccupied ? "default" : "outline"}
    size="sm"
    onClick={() => {
      setShowAllOccupied(!showAllOccupied);
      setSelectedSeat(null);
    }}
  >
              {showAllOccupied ? "Hide All Occupied Seats" : "View All Occupied Seats"}
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
              <table className="w-full text-sm text-left relative">
                <thead className="text-xs text-muted-foreground bg-muted border-b sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Seat No.</th>
                    <th className="px-6 py-4 font-semibold">Student Name</th>
                    <th className="px-6 py-4 font-semibold">Phone</th>
                    <th className="px-6 py-4 font-semibold">Plan</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold">Due Date</th>
                  </tr>
                </thead>
                <tbody>
                  {showAllOccupied ? occupiedSeats.length > 0 ? occupiedSeats.map((seat, i) => <tr key={i} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="px-6 py-4 font-medium">{seat.seatNumber}</td>
                          <td className="px-6 py-4">{seat.student?.name || "N/A"}</td>
                          <td className="px-6 py-4 text-muted-foreground">{seat.student?.phone || "N/A"}</td>
                          <td className="px-6 py-4 text-muted-foreground">Monthly</td>
                          <td className="px-6 py-4">
                            <StatusBadge status={seat.status} />
                          </td>
                          <td className="px-6 py-4 text-muted-foreground">
                            {seat.student?.nextDueDate ? isNaN(new Date(seat.student.nextDueDate).getTime()) ? "Invalid Date" : format(new Date(seat.student.nextDueDate), "dd MMM yyyy") : "-"}
                          </td>
                        </tr>) : <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                          No occupied seats found.
                        </td>
                      </tr> : selectedSeat ? <tr className="border-b hover:bg-muted/50 transition-colors">
                      <td className="px-6 py-4 font-medium">{selectedSeat.seatNumber}</td>
                      <td className="px-6 py-4">{selectedSeat.student?.name || "N/A"}</td>
                      <td className="px-6 py-4 text-muted-foreground">{selectedSeat.student?.phone || "N/A"}</td>
                      <td className="px-6 py-4 text-muted-foreground">Monthly</td>
                      <td className="px-6 py-4">
                        <StatusBadge status={selectedSeat.status} />
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {selectedSeat.student?.nextDueDate ? isNaN(new Date(selectedSeat.student.nextDueDate).getTime()) ? "Invalid Date" : format(new Date(selectedSeat.student.nextDueDate), "dd MMM yyyy") : "-"}
                      </td>
                    </tr> : <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        Select a seat to view details, or click 'View All Occupied Seats'
                      </td>
                    </tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>;
}
function StatCard({ title, value, icon, valueColor = "text-foreground" }) {
  return <Card className="shadow-sm overflow-hidden">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-2 rounded-lg bg-muted`}>{icon}</div>
          <p className="text-xs font-semibold text-muted-foreground">{title}</p>
        </div>
        <div className="flex items-baseline gap-2">
          <h3 className={`text-2xl font-bold tracking-tight ${valueColor}`}>{value}</h3>
        </div>
      </CardContent>
    </Card>;
}
function LegendItem({ color, label }) {
  return <div className="flex items-center gap-1.5">
      <div className={`w-3.5 h-3.5 rounded-sm ${color} shadow-inner`} />
      <span>{label}</span>
    </div>;
}
function StatusBadge({ status }) {
  if (status === "paid") return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white shadow-none font-medium">Paid</Badge>;
  if (status === "overdue") return <Badge variant="destructive" className="shadow-none font-medium">Overdue</Badge>;
  if (status === "due-soon") return <Badge className="bg-amber-500 hover:bg-amber-600 text-white shadow-none font-medium">Due Soon</Badge>;
  return null;
}
export {
  Seats as default
};
