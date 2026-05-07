import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { bookingFormSchema } from "@/lib/validations";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const statusParam = searchParams.get("status");

  try {
    const whereClause =
      statusParam && ["PENDING", "CONFIRMED", "CANCELLED"].includes(statusParam)
        ? { status: statusParam as BookingStatus }
        : {};

    const bookings = await prisma.booking.findMany({
      where: whereClause,
      include: {
        physician: true,
        slot: true,
      },
      orderBy: { slot: { startTime: "asc" } },
    });

    return NextResponse.json(bookings);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = bookingFormSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Validation failed", details: result.error.flatten() },
        { status: 422 }
      );
    }

    const {
      physicianId,
      slotId,
      patientFirstName,
      patientLastName,
      patientEmail,
      patientPhone,
      reasonForVisit,
    } = result.data;

    // Check physician exists
    const physician = await prisma.physician.findUnique({
      where: { id: physicianId },
    });
    if (!physician) {
      return NextResponse.json(
        { error: "Physician not found" },
        { status: 404 }
      );
    }

    // Check slot exists and belongs to selected physician
    const slot = await prisma.appointmentSlot.findUnique({
      where: { id: slotId },
    });
    if (!slot || slot.physicianId !== physicianId) {
      return NextResponse.json(
        { error: "Appointment slot not found or does not belong to this physician" },
        { status: 404 }
      );
    }

    // Check slot is in the future
    if (slot.startTime <= new Date()) {
      return NextResponse.json(
        { error: "This appointment time has already passed" },
        { status: 400 }
      );
    }

    // Check for double booking — prevent concurrent active bookings on same slot
    const existingBooking = await prisma.booking.findFirst({
      where: {
        slotId,
        status: { in: ["PENDING", "CONFIRMED"] },
      },
    });
    if (existingBooking) {
      return NextResponse.json(
        {
          error:
            "This appointment time is no longer available. Please choose another time.",
        },
        { status: 409 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        physicianId,
        slotId,
        patientFirstName,
        patientLastName,
        patientEmail,
        patientPhone,
        reasonForVisit,
        status: "PENDING",
      },
      include: {
        physician: true,
        slot: true,
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
