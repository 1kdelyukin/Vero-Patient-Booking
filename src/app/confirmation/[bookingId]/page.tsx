import { notFound } from "next/navigation";
import { format } from "date-fns";
import { CheckCircle2, Calendar, User, Stethoscope, MapPin, Clock, FileText } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ bookingId: string }>;
}

export default async function ConfirmationPage({ params }: PageProps) {
  const { bookingId } = await params;

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { physician: true, slot: true },
  });

  if (!booking) notFound();

  type StatusKey = "PENDING" | "CONFIRMED" | "CANCELLED";
  const statusMap: Record<StatusKey, { label: string; variant: "pending" | "confirmed" | "cancelled" }> = {
    PENDING: { label: "Pending Review", variant: "pending" },
    CONFIRMED: { label: "Confirmed", variant: "confirmed" },
    CANCELLED: { label: "Cancelled", variant: "cancelled" },
  };

  const statusInfo = statusMap[booking.status as StatusKey];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 pt-24 pb-10">
      {/* Success banner */}
      <div className="text-center mb-8 animate-slide-up">
        <div className="mx-auto w-16 h-16 rounded-2xl bg-[#348cc4] flex items-center justify-center mb-5 shadow-lg shadow-sky-200 animate-scale-in">
          <CheckCircle2 className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">
          Appointment Request Received
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
          Your care team will review your request and confirm your appointment shortly.
        </p>
      </div>

      <Card className="mb-6 border-gray-100 shadow-sm animate-slide-up" style={{ animationDelay: "80ms" }}>
        <CardContent className="pt-5">
          {/* Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <span className="text-sm font-medium text-gray-500">Status</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          <div className="space-y-2 pt-4">
            <p className="text-xs font-semibold text-[#348cc4] uppercase tracking-widest mb-3">Appointment</p>
            <ConfirmRow
              icon={<Stethoscope className="w-4 h-4" />}
              label="Physician"
              value={booking.physician.name}
              subValue={booking.physician.specialty}
            />
            <ConfirmRow
              icon={<MapPin className="w-4 h-4" />}
              label="Location"
              value={booking.physician.location}
            />
            <ConfirmRow
              icon={<Calendar className="w-4 h-4" />}
              label="Date"
              value={format(new Date(booking.slot.startTime), "EEEE, MMMM d, yyyy")}
            />
            <ConfirmRow
              icon={<Clock className="w-4 h-4" />}
              label="Time"
              value={`${format(new Date(booking.slot.startTime), "h:mm a")} – ${format(new Date(booking.slot.endTime), "h:mm a")}`}
            />
            <div className="border-t border-gray-50 pt-3 mt-3">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Patient</p>
              <ConfirmRow
                icon={<User className="w-4 h-4" />}
                label="Name"
                value={`${booking.patientFirstName} ${booking.patientLastName}`}
                subValue={booking.patientEmail}
              />
              <ConfirmRow
                icon={<FileText className="w-4 h-4" />}
                label="Reason"
                value={booking.reasonForVisit}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reference ID */}
      <p className="text-center text-xs text-gray-400 mb-6">
        Booking reference: <span className="font-mono text-gray-500">{booking.id}</span>
      </p>

      <div className="flex justify-center animate-fade-in" style={{ animationDelay: "160ms" }}>
        <Link href="/">
          <Button variant="outline">Book another appointment</Button>
        </Link>
      </div>
    </div>
  );
}

function ConfirmRow({
  icon,
  label,
  value,
  subValue,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="flex items-start gap-3 py-1.5">
      <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center text-[#348cc4] shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-gray-900 mt-0.5 leading-snug">{value}</p>
        {subValue && <p className="text-xs text-gray-400 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}
