import { useGetSeatLayout } from "@workspace/api-client-react";
import { memo, useMemo, useState } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Search, LayoutGrid, User, Phone, IndianRupee, Calendar, Hash } from "lucide-react";
import { format } from "date-fns";
import { Link } from "wouter";

type FilterStatus = "all" | "occupied" | "vacant";

export default function Seats() {
  const [filter, setFilter] = useState<FilterStatus>("all");
  const [search, setSearch] = useState("");
  const [selectedSeat, setSelectedSeat] = useState<any>(null);

  const { data: fullLayout, isLoading } = useGetSeatLayout();

  const layout = fullLayout ?? [];
  const filteredSeats = useMemo(() => layout.filter(seat => {
    if (filter === "occupied" && !seat.isOccupied) return false;
    if (filter === "vacant" && seat.isOccupied) return false;
    if (search) {
      const s = search.toLowerCase();
      const matchSeat = String(seat.seatNumber).includes(s);
      const matchName = seat.isOccupied && seat.student && (seat.student as any).name?.toLowerCase().includes(s);
      if (!matchSeat && !matchName) return false;
    }
    return true;
  }), [layout, filter, search]);

  const seatStats = useMemo(() => layout.reduce(
    (stats, seat) => {
      if (seat.isOccupied) stats.occupied += 1;
      else stats.vacant += 1;
      if ((seat as any).status === "overdue") stats.overdue += 1;
      if ((seat as any).status === "due-soon") stats.dueSoon += 1;
      return stats;
    },
    { occupied: 0, vacant: 0, overdue: 0, dueSoon: 0 },
  ), [layout]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto page-enter">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50"><LayoutGrid className="w-5 h-5 text-indigo-600" /></div>
            Seat Layout
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5 ml-[52px]">Visual grid of library occupancy</p>
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Occupied", value: seatStats.occupied, color: "bg-emerald-500", bg: "bg-emerald-50" },
          { label: "Vacant", value: seatStats.vacant, color: "bg-slate-300 dark:bg-slate-600", bg: "bg-slate-50" },
          { label: "Due Soon", value: seatStats.dueSoon, color: "bg-amber-400", bg: "bg-amber-50" },
          { label: "Overdue", value: seatStats.overdue, color: "bg-red-500", bg: "bg-red-50" },
        ].map(stat => (
          <div key={stat.label} className={`flex items-center gap-3 border border-border/60 rounded-xl p-4 ${stat.bg} hover:shadow-sm transition-shadow`}>
            <div className={`w-2 h-10 rounded-full ${stat.color}`} />
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader className="p-4 border-b border-border/40">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center bg-muted/50 p-1 rounded-lg border border-border/50">
              {(["all", "occupied", "vacant"] as FilterStatus[]).map(f => (
                <Button key={f} variant={filter === f ? "secondary" : "ghost"} size="sm"
                  onClick={() => setFilter(f)} className="rounded-md capitalize text-xs">{f === "all" ? "All Seats" : f}</Button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search seat # or name..." className="pl-9 h-9 text-sm"
                value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-3 text-xs text-muted-foreground">
            {[
              { color: "bg-emerald-100 border-emerald-400", label: "Paid" },
              { color: "bg-amber-100 border-amber-400", label: "Due Soon" },
              { color: "bg-red-100 border-red-400", label: "Overdue" },
              { color: "bg-slate-100 border-slate-300", label: "Vacant" },
            ].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded border-2 ${l.color}`} />
                <span>{l.label}</span>
              </div>
            ))}
          </div>
        </CardHeader>
        <CardContent className="p-4 bg-muted/10 min-h-[500px]">
          {isLoading ? (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
              {Array.from({ length: 50 }).map((_, i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
            </div>
          ) : filteredSeats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
              <LayoutGrid className="w-12 h-12 mb-3 opacity-20" />
              <p className="font-medium">No seats match your filter</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
              {filteredSeats.map(seat => (
                <SeatCard key={seat.seatNumber} seat={seat} onClick={() => seat.isOccupied && setSelectedSeat(seat)} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={!!selectedSeat} onOpenChange={open => !open && setSelectedSeat(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-indigo-50"><Hash className="w-3.5 h-3.5 text-indigo-600" /></div>
              Seat {selectedSeat?.seatNumber} — Student Profile
            </DialogTitle>
          </DialogHeader>
          {selectedSeat?.student && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-50 border-2 border-indigo-100 flex items-center justify-center overflow-hidden shrink-0">
                  {selectedSeat.student.photoUrl
                    ? <img src={selectedSeat.student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                    : <span className="text-xl font-bold text-indigo-600">{selectedSeat.student.name?.substring(0, 2).toUpperCase()}</span>}
                </div>
                <div>
                  <h3 className="font-bold text-lg">{selectedSeat.student.name}</h3>
                  <p className="text-sm text-muted-foreground">Father: {selectedSeat.student.fatherName}</p>
                  <StatusBadge status={selectedSeat.status} />
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm border border-border/60 rounded-xl p-4 bg-muted/20">
                  <Info icon={<Phone className="w-3.5 h-3.5" />} label="Phone" value={selectedSeat.student.phone} />
                  <Info icon={<Hash className="w-3.5 h-3.5" />} label="Seat" value={`#${selectedSeat.student.seatNumber}`} />
                  <Info icon={<IndianRupee className="w-3.5 h-3.5" />} label="Monthly Fee" value={`₹${Number(selectedSeat.student.monthlyFee).toLocaleString()}`} />
                  <Info icon={<Calendar className="w-3.5 h-3.5" />} label="Next Due" value={selectedSeat.student.nextDueDate ? format(new Date(selectedSeat.student.nextDueDate), "dd MMM yyyy") : "—"} />
                  <Info icon={<Calendar className="w-3.5 h-3.5" />} label="Joined" value={selectedSeat.student.joiningDate ? format(new Date(selectedSeat.student.joiningDate), "dd MMM yyyy") : "—"} />
                </div>
                {(selectedSeat.student as any).shifts && (selectedSeat.student as any).shifts.length > 0 && (
                  <div className="text-sm border border-border/60 rounded-xl p-4 bg-muted/20">
                    <p className="font-medium mb-2">Shifts</p>
                    <div className="flex gap-2 flex-wrap">
                      {(selectedSeat.student as any).shifts.map((shift: string) => (
                        <span key={shift} className="text-xs px-2 py-1 rounded-full bg-indigo-50 text-indigo-600 font-medium capitalize">
                          {shift}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <Link href={`/students/${selectedSeat.student.id}`}
                className="flex items-center justify-center gap-2 w-full bg-primary text-primary-foreground rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-primary/90 transition-colors"
                onClick={() => setSelectedSeat(null)}>
                <User className="w-4 h-4" /> View Full Profile
              </Link>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

const SeatCard = memo(function SeatCard({ seat, onClick }: { seat: any; onClick: () => void }) {
  const status = seat.isOccupied ? (seat.status ?? "paid") : "vacant";
  const colorMap: Record<string, string> = {
    paid: "bg-emerald-50 dark:bg-emerald-900/30 border-emerald-200 hover:border-emerald-400 hover:shadow-emerald-100/50 text-foreground",
    "due-soon": "bg-amber-50 dark:bg-amber-900/30 border-amber-200 hover:border-amber-400 hover:shadow-amber-100/50 text-foreground",
    overdue: "bg-red-50 dark:bg-red-900/30 border-red-200 hover:border-red-400 hover:shadow-red-100/50 text-foreground",
    vacant: "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-600 hover:border-primary/50 text-muted-foreground",
  };
  const dotMap: Record<string, string> = {
    paid: "bg-emerald-500", "due-soon": "bg-amber-500", overdue: "bg-red-500", vacant: "",
  };

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <button
          onClick={onClick}
          className={`relative flex flex-col items-center justify-center p-2 h-20 rounded-xl border-2 transition-all duration-200 hover:shadow-md ${colorMap[status]} ${seat.isOccupied ? "cursor-pointer" : "cursor-default"}`}
        >
          <span className="absolute top-1 left-1.5 text-[9px] font-mono font-bold opacity-40">#{seat.seatNumber}</span>
          {seat.isOccupied && dotMap[status] && (
            <span className={`absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full ${dotMap[status]}`} />
          )}
          {seat.isOccupied && seat.student ? (
            <>
              <div className="w-7 h-7 rounded-full bg-background border border-border/60 flex items-center justify-center overflow-hidden mb-0.5">
                {seat.student.photoUrl
                  ? <img src={seat.student.photoUrl} alt="" loading="lazy" decoding="async" className="w-full h-full object-cover" />
                  : <span className="text-[9px] font-bold">{seat.student.name?.substring(0, 2).toUpperCase()}</span>}
              </div>
              <span className="text-[9px] font-semibold w-full text-center truncate px-0.5 leading-tight">
                {seat.student.name?.split(" ")[0]}
              </span>
            </>
          ) : (
            <span className="text-xl font-bold opacity-20">{seat.seatNumber}</span>
          )}
        </button>
      </TooltipTrigger>
      {seat.isOccupied && seat.student && (
        <TooltipContent side="right" className="w-52 p-3 text-xs space-y-1.5 bg-card text-card-foreground border-border shadow-lg">
          <p className="font-bold text-sm">{seat.student.name}</p>
          <p className="text-muted-foreground">📞 {seat.student.phone}</p>
          <p className="text-muted-foreground">👤 {seat.student.fatherName}</p>
          <p className="text-muted-foreground">💺 Seat #{seat.student.seatNumber}</p>
          <p className="text-muted-foreground">💰 ₹{Number(seat.student.monthlyFee).toLocaleString()}/mo</p>
          <p className="text-muted-foreground">⏳ Due: {seat.student.nextDueDate ? format(new Date(seat.student.nextDueDate), "dd MMM yyyy") : "—"}</p>
          <StatusBadge status={status} />
        </TooltipContent>
      )}
    </Tooltip>
  );
});

function StatusBadge({ status }: { status: string }) {
  if (status === "paid") return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] h-4 mt-1">Paid</Badge>;
  if (status === "overdue") return <Badge variant="destructive" className="text-[10px] h-4 mt-1">Overdue</Badge>;
  if (status === "due-soon") return <Badge className="bg-amber-50 text-amber-700 border-amber-200 text-[10px] h-4 mt-1">Due Soon</Badge>;
  return null;
}

function Info({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-muted-foreground text-xs">{label}</p>
        <p className="font-medium">{value}</p>
      </div>
    </div>
  );
}
