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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2 animate-slide-up">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-200">
          <LayoutDashboard className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Review and manage upcoming patient bookings.</p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 mb-7 stagger">
        <SummaryCard label="Pending" count={counts.pending} gradient="from-amber-500 to-orange-500" />
        <SummaryCard label="Confirmed" count={counts.confirmed} gradient="from-emerald-500 to-teal-500" />
        <SummaryCard label="Cancelled" count={counts.cancelled} gradient="from-gray-400 to-slate-500" />
        <SummaryCard label="Total" count={bookings.length} gradient="from-violet-600 to-indigo-600" />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap animate-fade-in">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest mr-1">Filter</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-semibold transition-all",
              statusFilter === f.value
                ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-200"
                : "bg-white border border-gray-200 text-gray-600 hover:border-violet-200 hover:text-violet-700"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        </div>
      ) : displayedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-3">
              <Calendar className="w-7 h-7 text-gray-300" />
            </div>
            <p className="text-gray-500 font-semibold text-sm">No bookings found</p>
            <p className="text-xs text-gray-400 mt-1">
              {statusFilter !== "ALL"
                ? `No ${statusFilter.toLowerCase()} bookings yet.`
                : "No bookings have been created yet."}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
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
  );
}

function SummaryCard({
  label,
  count,
  gradient,
}: {
  label: string;
  count: number;
  gradient: string;
}) {
  return (
    <div className={cn("rounded-2xl p-4 bg-gradient-to-br text-white shadow-sm animate-slide-up", gradient)}>
      <p className="text-2xl font-bold">{count}</p>
      <p className="text-xs font-semibold mt-0.5 text-white/80 uppercase tracking-wide">{label}</p>
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
  const statusVariant = {
    PENDING: "pending" as const,
    CONFIRMED: "confirmed" as const,
    CANCELLED: "cancelled" as const,
  }[booking.status];

  const statusLabel = {
    PENDING: "Pending",
    CONFIRMED: "Confirmed",
    CANCELLED: "Cancelled",
  }[booking.status];

  const canConfirm = booking.status === "PENDING";
  const canCancel = booking.status === "PENDING" || booking.status === "CONFIRMED";

  return (
    <Card className="hover:shadow-md transition-all duration-200 hover:-translate-y-0.5">
      <CardContent className="pt-5">
        <div className="flex items-start justify-between flex-wrap gap-3">
          {/* Left: main info */}
          <div className="space-y-2.5 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">
                {booking.patientFirstName} {booking.patientLastName}
              </span>
              <Badge variant={statusVariant}>{statusLabel}</Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              <InfoItem
                icon={<Stethoscope className="w-3.5 h-3.5" />}
                text={`${booking.physician.name} · ${booking.physician.specialty}`}
              />
              <InfoItem
                icon={<Calendar className="w-3.5 h-3.5" />}
                text={format(new Date(booking.slot.startTime), "EEE, MMM d, yyyy")}
              />
              <InfoItem
                icon={<Clock className="w-3.5 h-3.5" />}
                text={`${format(new Date(booking.slot.startTime), "h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`}
              />
              <InfoItem
                icon={<User className="w-3.5 h-3.5" />}
                text={booking.patientEmail}
              />
            </div>

            <div className="flex items-start gap-1.5 text-xs text-gray-500">
              <FileText className="w-3.5 h-3.5 mt-0.5 shrink-0" />
              <span className="italic">{booking.reasonForVisit}</span>
            </div>
          </div>

          {/* Right: actions */}
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
      </CardContent>
    </Card>
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
