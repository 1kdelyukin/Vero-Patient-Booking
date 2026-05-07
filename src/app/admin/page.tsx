"use client";

import { useEffect, useState, useCallback } from "react";
import { format } from "date-fns";
import {
  Calendar,
  User,
  Stethoscope,
  FileText,
  Loader2,
  CheckCircle2,
  XCircle,
  Clock,
  LayoutDashboard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Physician {
  id: string;
  name: string;
  specialty: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

interface Booking {
  id: string;
  patientFirstName: string;
  patientLastName: string;
  patientEmail: string;
  patientPhone: string;
  reasonForVisit: string;
  status: "PENDING" | "CONFIRMED" | "CANCELLED";
  physician: Physician;
  slot: Slot;
  createdAt: string;
}

type StatusFilter = "ALL" | "PENDING" | "CONFIRMED" | "CANCELLED";

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "CANCELLED", label: "Cancelled" },
];

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    const url =
      statusFilter === "ALL"
        ? "/api/bookings"
        : `/api/bookings?status=${statusFilter}`;
    const res = await fetch(url);
    const data = await res.json();
    setBookings(data);
    setLoading(false);
  }, [statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const handleUpdateStatus = async (bookingId: string, newStatus: "CONFIRMED" | "CANCELLED") => {
    setActionLoading(bookingId + newStatus);
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        await fetchBookings();
      }
    } finally {
      setActionLoading(null);
    }
  };

  // Compute summary counts
  const counts = {
    pending: bookings.filter((b) => b.status === "PENDING").length,
    confirmed: bookings.filter((b) => b.status === "CONFIRMED").length,
    cancelled: bookings.filter((b) => b.status === "CANCELLED").length,
    total: bookings.length,
  };

  const displayedBookings =
    statusFilter === "ALL"
      ? bookings
      : bookings.filter((b) => b.status === statusFilter);

  return (
    <div>
      {/* Hero */}
      <div className="relative pt-28 pb-8 px-4 text-center">
        <div className="inline-flex items-center gap-1.5 bg-white/75 backdrop-blur-sm text-[#348cc4] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/80 animate-fade-in shadow-sm">
          <LayoutDashboard className="w-3 h-3" />
          Patient Management
        </div>
        <h1 className="text-3xl sm:text-[2.75rem] font-bold text-gray-900 tracking-tight animate-slide-up leading-tight">
          Manage Appointments
        </h1>
        <p className="text-gray-600 mt-3 text-sm sm:text-base animate-slide-up max-w-sm mx-auto" style={{ animationDelay: "60ms" }}>
          Review and update upcoming patient bookings.
        </p>
      </div>

      {/* Dashboard card */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-200/30 overflow-hidden animate-scale-in">

          {/* Card top bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#348cc4] flex items-center justify-center shadow-sm shadow-sky-200">
                <LayoutDashboard className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">Bookings</span>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-gray-100/60 px-2.5 py-1 rounded-full tabular-nums">
              {bookings.length} total
            </span>
          </div>

          <div className="flex">
            {/* Left sidebar – filter nav */}
            <div className="hidden sm:flex flex-col w-44 border-r border-gray-100 py-3 px-2 shrink-0 bg-gray-50/20">
              <div className="flex flex-col gap-0.5 flex-1">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200",
                      statusFilter === f.value
                        ? "bg-sky-50 text-[#348cc4]"
                        : "text-gray-400 hover:text-gray-700 hover:bg-gray-50"
                    )}
                  >
                    <div className={cn(
                      "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                      statusFilter === f.value
                        ? "bg-[#348cc4] text-white shadow-sm shadow-sky-200"
                        : "bg-gray-100 text-gray-300"
                    )}>
                      {FILTER_ICONS[f.value]}
                    </div>
                    {f.label}
                  </button>
                ))}
              </div>
              <div className="px-3 pb-2 pt-4">
                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">Powered by Vero</p>
              </div>
            </div>

            {/* Main panel */}
            <div className="flex-1 min-w-0 p-5 sm:p-6">

              {/* Stat pills */}
              <div className="grid grid-cols-3 gap-3 mb-6 stagger">
                <StatPill label="Pending"   count={counts.pending}   colorClass="text-amber-500"   bgClass="bg-amber-50 border-amber-100" />
                <StatPill label="Confirmed" count={counts.confirmed} colorClass="text-emerald-600" bgClass="bg-emerald-50 border-emerald-100" />
                <StatPill label="Cancelled" count={counts.cancelled} colorClass="text-gray-400"    bgClass="bg-gray-50 border-gray-100" />
              </div>

              {/* Mobile filter tabs */}
              <div className="flex items-center gap-2 mb-5 flex-wrap sm:hidden animate-fade-in">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setStatusFilter(f.value)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all",
                      statusFilter === f.value
                        ? "bg-[#348cc4] text-white shadow-sm"
                        : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                    )}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {/* Content */}
              {loading ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-[#348cc4]" />
                </div>
              ) : displayedBookings.length === 0 ? (
                <div className="py-16 text-center animate-fade-in">
                  <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-gray-300" />
                  </div>
                  <p className="text-gray-500 font-medium text-sm">No bookings found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {statusFilter !== "ALL"
                      ? `No ${statusFilter.toLowerCase()} bookings yet.`
                      : "No bookings have been created yet."}
                  </p>
                </div>
              ) : (
                <div className="space-y-2.5 stagger">
                  {displayedBookings.map((booking) => (
                    <BookingCard
                      key={booking.id}
                      booking={booking}
                      onUpdateStatus={handleUpdateStatus}
                      actionLoading={actionLoading}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const FILTER_ICONS: Record<StatusFilter, React.ReactNode> = {
  ALL: <LayoutDashboard className="w-3.5 h-3.5" />,
  PENDING: <Clock className="w-3.5 h-3.5" />,
  CONFIRMED: <CheckCircle2 className="w-3.5 h-3.5" />,
  CANCELLED: <XCircle className="w-3.5 h-3.5" />,
};

function StatPill({
  label,
  count,
  colorClass,
  bgClass,
}: {
  label: string;
  count: number;
  colorClass: string;
  bgClass: string;
}) {
  return (
    <div className={cn("rounded-2xl border p-4 flex flex-col gap-0.5 animate-slide-up", bgClass)}>
      <p className={cn("text-2xl font-bold tabular-nums", colorClass)}>{count}</p>
      <p className={cn("text-xs font-semibold uppercase tracking-wide opacity-70", colorClass)}>{label}</p>
    </div>
  );
}

function BookingCard({
  booking,
  onUpdateStatus,
  actionLoading,
}: {
  booking: Booking;
  onUpdateStatus: (id: string, status: "CONFIRMED" | "CANCELLED") => void;
  actionLoading: string | null;
}) {
  const statusLabel = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
  }[booking.status];

  const accentColor = {
    PENDING: "bg-amber-400",
    CONFIRMED: "bg-emerald-500",
    CANCELLED: "bg-gray-300",
  }[booking.status];

  const badgeStyle = {
    PENDING: "bg-amber-50 text-amber-600 ring-1 ring-amber-200",
    CONFIRMED: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    CANCELLED: "bg-gray-50 text-gray-400 ring-1 ring-gray-200",
  }[booking.status];

  const canConfirm = booking.status === "PENDING";
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <div className={cn(
      "rounded-2xl border border-gray-100 bg-white flex overflow-hidden transition-all duration-200 animate-slide-up",
      "hover:-translate-y-0.5 hover:shadow-md hover:shadow-gray-200/50",
      booking.status === "CANCELLED" && "opacity-60"
    )}>
      {/* Status accent strip */}
      <div className={cn("w-1 shrink-0", accentColor)} />

      <div className="flex-1 min-w-0 p-4">
        <div className="flex items-start justify-between flex-wrap gap-3">
          {/* Info */}
          <div className="space-y-2 flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">
                {booking.patientFirstName} {booking.patientLastName}
              </span>
              <span className={cn("text-xs font-semibold px-2 py-0.5 rounded-full", badgeStyle)}>
                {statusLabel}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              <InfoItem icon={<Stethoscope className="w-3.5 h-3.5" />} text={`${booking.physician.name} · ${booking.physician.specialty}`} />
              <InfoItem icon={<Calendar className="w-3.5 h-3.5" />}    text={format(new Date(booking.slot.startTime), "EEE, MMM d, yyyy")} />
              <InfoItem icon={<Clock className="w-3.5 h-3.5" />}       text={`${format(new Date(booking.slot.startTime), "h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`} />
              <InfoItem icon={<User className="w-3.5 h-3.5" />}        text={booking.patientEmail} />
            </div>
            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0 text-gray-400" />
              <span className="italic leading-relaxed">{booking.reasonForVisit}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col gap-2 shrink-0">
            {canConfirm && (
              <Button
                size="sm"
                onClick={() => onUpdateStatus(booking.id, "CONFIRMED")}
                disabled={actionLoading !== null}
                className="gap-1.5"
              >
                {actionLoading === booking.id + "CONFIRMED" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                Confirm
              </Button>
            )}
            {canCancel && (
              <Button
                size="sm"
                variant="outline"
                onClick={() => onUpdateStatus(booking.id, "CANCELLED")}
                disabled={actionLoading !== null}
                className="gap-1.5 text-red-500 border-red-100 hover:bg-red-50 hover:border-red-200"
              >
                {actionLoading === booking.id + "CANCELLED" ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <XCircle className="w-3.5 h-3.5" />
                )}
                Cancel
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoItem({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex items-center gap-1.5 text-xs text-gray-500">
      <span className="text-gray-400">{icon}</span>
      <span>{text}</span>
    </div>
  );
}
