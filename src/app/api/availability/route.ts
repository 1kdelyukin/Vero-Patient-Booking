import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const physicianId = searchParams.get("physicianId");

  if (!physicianId) {
    return NextResponse.json(
      { error: "physicianId is required" },
      { status: 400 }
    );
  }

  try {
    const now = new Date();

    // Get slots that are in the future and not actively booked
    const slots = await prisma.appointmentSlot.findMany({
      where: {
        physicianId,
        startTime: { gt: now },
        bookings: {
          none: {
            status: { in: ["PENDING", "CONFIRMED"] },
          },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return NextResponse.json(slots);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch availability" },
      { status: 500 }
    );
  }
}
