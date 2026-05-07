import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const physicians = await prisma.physician.findMany({
      orderBy: { name: "asc" },
    });
    return NextResponse.json(physicians);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch physicians" },
      { status: 500 }
    );
  }
}
