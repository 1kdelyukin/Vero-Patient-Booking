import { z } from "zod";

export const bookingFormSchema = z.object({
  physicianId: z.string().min(1, "Please select a physician"),
  slotId: z.string().min(1, "Please select an appointment time"),
  patientFirstName: z.string().min(2, "First name must be at least 2 characters"),
  patientLastName: z.string().min(2, "Last name must be at least 2 characters"),
  patientEmail: z.string().email("Please enter a valid email address"),
  patientPhone: z.string().min(7, "Phone number must be at least 7 characters"),
  reasonForVisit: z
    .string()
    .min(10, "Please provide at least 10 characters describing your reason for visit"),
});

export type BookingFormValues = z.infer<typeof bookingFormSchema>;

export const updateBookingStatusSchema = z.object({
  status: z.enum(["CONFIRMED", "CANCELLED"]),
});

export type UpdateBookingStatusValues = z.infer<typeof updateBookingStatusSchema>;
