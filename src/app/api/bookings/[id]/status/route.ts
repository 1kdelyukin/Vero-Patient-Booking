import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { updateBookingStatusSchema } from "@/lib/validations";

interface RouteParams {
  params: Promise<{ id: string }>;
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const { id } = await params;

  try {
    const body = await request.json();
    const result = updateBookingStatusSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 422 }
      );
    }

    const { status: newStatus } = result.data;

    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Validate allowed transitions
    const allowedTransitions: Record<string, string[]> = {
      PENDING: ["CONFIRMED", "CANCELLED"],
      CONFIRMED: ["CANCELLED"],
      CANCELLED: [],
    };

    if (!allowedTransitions[booking.status]?.includes(newStatus)) {
      return NextResponse.json(
        {
          error: `Cannot transition from ${booking.status} to ${newStatus}`,
        },
        { status: 400 }
      );
    }

    const updated = await prisma.booking.update({
      where: { id },
      data: { status: newStatus },
      include: { physician: true, slot: true },
    });

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json(
      { error: "Failed to update booking status" },
      { status: 500 }
    );
  }
}
