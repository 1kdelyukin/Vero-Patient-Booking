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
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-10">
      {/* Success banner */}
      <div className="text-center mb-8">
        <div className="mx-auto w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mb-4">
          <CheckCircle2 className="w-7 h-7 text-green-500" />
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">
          Appointment Request Received
        </h1>
        <p className="text-gray-500 text-sm mt-2 max-w-sm mx-auto">
          Your care team will review your request and confirm your appointment
          shortly.
        </p>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-5">
          {/* Status */}
          <div className="flex items-center justify-between pb-4 border-b border-gray-50">
            <span className="text-sm text-gray-500">Status</span>
            <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
          </div>

          <div className="space-y-4 pt-4">
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
            <div className="border-t border-gray-50 pt-4">
              <ConfirmRow
                icon={<User className="w-4 h-4" />}
                label="Patient"
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
        Booking reference: <span className="font-mono">{booking.id}</span>
      </p>

      <div className="flex justify-center">
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
    <div className="flex items-start gap-3 py-1">
      <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-500 shrink-0">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value}</p>
        {subValue && <p className="text-xs text-gray-500 mt-0.5">{subValue}</p>}
      </div>
    </div>
  );
}
