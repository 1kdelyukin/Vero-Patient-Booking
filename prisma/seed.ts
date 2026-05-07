import { PrismaClient } from "@prisma/client";
import { addDays, addHours, setHours, setMinutes } from "date-fns";

type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Clear existing data
  await prisma.booking.deleteMany();
  await prisma.appointmentSlot.deleteMany();
  await prisma.physician.deleteMany();

  // Create physicians
  const drMayaChen = await prisma.physician.create({
    data: {
      name: "Dr. Maya Chen",
      specialty: "Family Medicine",
      location: "Downtown Clinic",
      bio: "Dr. Maya Chen is a board-certified family medicine physician with over 12 years of experience providing comprehensive care for patients of all ages.",
    },
  });

  const drAaronPatel = await prisma.physician.create({
    data: {
      name: "Dr. Aaron Patel",
      specialty: "Internal Medicine",
      location: "Virtual / In-person",
      bio: "Dr. Aaron Patel specializes in internal medicine and preventive care. He offers both in-person and virtual consultations.",
    },
  });

  const drElenaBooks = await prisma.physician.create({
    data: {
      name: "Dr. Elena Brooks",
      specialty: "Pediatrics",
      location: "North Clinic",
      bio: "Dr. Elena Brooks is a compassionate pediatrician dedicated to providing exceptional care for children from newborns through adolescence.",
    },
  });

  const physicians = [drMayaChen, drAaronPatel, drElenaBooks];

  // Generate appointment slots: 10 slots per physician over the next 14 days
  const today = new Date();
  const slots: { physicianId: string; startTime: Date; endTime: Date }[] = [];

  const timeSlots = [9, 10, 11, 13, 14, 15, 16]; // hours

  let dayOffset = 1;
  for (const physician of physicians) {
    let slotsCreated = 0;
    let currentDay = dayOffset;

    while (slotsCreated < 10) {
      const baseDate = addDays(today, currentDay);

      // Skip weekends
      const dayOfWeek = baseDate.getDay();
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        currentDay++;
        continue;
      }

      for (const hour of timeSlots) {
        if (slotsCreated >= 10) break;
        const startTime = setMinutes(setHours(baseDate, hour), 0);
        startTime.setSeconds(0);
        startTime.setMilliseconds(0);
        const endTime = addHours(startTime, 1);

        slots.push({
          physicianId: physician.id,
          startTime,
          endTime,
        });
        slotsCreated++;
      }

      currentDay++;
    }

    dayOffset += 5; // Stagger slots for different physicians
  }

  const createdSlots = await prisma.appointmentSlot.createMany({
    data: slots,
  });

  console.log(`Created ${createdSlots.count} appointment slots`);

  // Fetch slots for sample bookings
  const mayaSlots = await prisma.appointmentSlot.findMany({
    where: { physicianId: drMayaChen.id },
    orderBy: { startTime: "asc" },
    take: 3,
  });

  const aaronSlots = await prisma.appointmentSlot.findMany({
    where: { physicianId: drAaronPatel.id },
    orderBy: { startTime: "asc" },
    take: 2,
  });

  const elenaSlots = await prisma.appointmentSlot.findMany({
    where: { physicianId: drElenaBooks.id },
    orderBy: { startTime: "asc" },
    take: 2,
  });

  // Create sample bookings
  const sampleBookings = [
    {
      physicianId: drMayaChen.id,
      slotId: mayaSlots[0].id,
      patientFirstName: "Sarah",
      patientLastName: "Johnson",
      patientEmail: "sarah.johnson@example.com",
      patientPhone: "555-0101",
      reasonForVisit: "Annual wellness exam and blood pressure check",
      status: "CONFIRMED" as BookingStatus,
    },
    {
      physicianId: drMayaChen.id,
      slotId: mayaSlots[1].id,
      patientFirstName: "Michael",
      patientLastName: "Torres",
      patientEmail: "michael.torres@example.com",
      patientPhone: "555-0102",
      reasonForVisit: "Follow-up for recent cold symptoms and fatigue",
      status: "PENDING" as BookingStatus,
    },
    {
      physicianId: drMayaChen.id,
      slotId: mayaSlots[2].id,
      patientFirstName: "Jennifer",
      patientLastName: "Park",
      patientEmail: "jennifer.park@example.com",
      patientPhone: "555-0103",
      reasonForVisit: "Routine checkup and medication review",
      status: "PENDING" as BookingStatus,
    },
    {
      physicianId: drAaronPatel.id,
      slotId: aaronSlots[0].id,
      patientFirstName: "David",
      patientLastName: "Williams",
      patientEmail: "david.williams@example.com",
      patientPhone: "555-0104",
      reasonForVisit: "Persistent headaches over the past two weeks",
      status: "CONFIRMED" as BookingStatus,
    },
    {
      physicianId: drAaronPatel.id,
      slotId: aaronSlots[1].id,
      patientFirstName: "Lisa",
      patientLastName: "Martinez",
      patientEmail: "lisa.martinez@example.com",
      patientPhone: "555-0105",
      reasonForVisit: "Type 2 diabetes management and A1C review",
      status: "PENDING" as BookingStatus,
    },
    {
      physicianId: drElenaBooks.id,
      slotId: elenaSlots[0].id,
      patientFirstName: "Emma",
      patientLastName: "Thompson",
      patientEmail: "emma.thompson@example.com",
      patientPhone: "555-0106",
      reasonForVisit: "6-month well-child visit for 3-year-old",
      status: "CONFIRMED" as BookingStatus,
    },
    {
      physicianId: drElenaBooks.id,
      slotId: elenaSlots[1].id,
      patientFirstName: "Noah",
      patientLastName: "Garcia",
      patientEmail: "noah.garcia@example.com",
      patientPhone: "555-0107",
      reasonForVisit: "Ear infection follow-up and possible referral",
      status: "PENDING" as BookingStatus,
    },
  ];

  for (const booking of sampleBookings) {
    await prisma.booking.create({ data: booking });
  }

  console.log(`Created ${sampleBookings.length} sample bookings`);
  console.log("Seeding complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
