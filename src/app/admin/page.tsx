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
      <div className="flex items-center gap-3 mb-2">
        <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
          <LayoutDashboard className="w-4 h-4 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Admin Dashboard
          </h1>
          <p className="text-sm text-gray-500">
            Review and manage upcoming patient bookings.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 mb-7">
        <SummaryCard
          label="Pending"
          count={counts.pending}
          color="text-amber-600"
          bg="bg-amber-50"
        />
        <SummaryCard
          label="Confirmed"
          count={counts.confirmed}
          color="text-green-600"
          bg="bg-green-50"
        />
        <SummaryCard
          label="Cancelled"
          count={counts.cancelled}
          color="text-gray-500"
          bg="bg-gray-50"
        />
        <SummaryCard
          label="Total"
          count={bookings.length}
          color="text-blue-600"
          bg="bg-blue-50"
        />
      </div>

      {/* Status filter */}
      <div className="flex items-center gap-2 mb-5 flex-wrap">
        <span className="text-sm text-gray-500 mr-1">Filter:</span>
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setStatusFilter(f.value)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-sm font-medium transition-colors",
              statusFilter === f.value
                ? "bg-blue-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Bookings list */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      ) : displayedBookings.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">No bookings found</p>
            <p className="text-sm text-gray-400 mt-1">
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
  color,
  bg,
}: {
  label: string;
  count: number;
  color: string;
  bg: string;
}) {
  return (
    <div className={cn("rounded-xl p-4 border border-transparent", bg)}>
      <p className={cn("text-2xl font-bold", color)}>{count}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
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
    <Card className="hover:shadow-sm transition-shadow">
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
                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50"
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
