"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { format } from "date-fns";
import {
  User,
  Clock,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Stethoscope,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { bookingFormSchema, type BookingFormValues } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface Physician {
  id: string;
  name: string;
  specialty: string;
  location: string;
  bio?: string;
}

interface Slot {
  id: string;
  startTime: string;
  endTime: string;
}

const STEPS = [
  { label: "Physician", icon: Stethoscope },
  { label: "Time", icon: Clock },
  { label: "Details", icon: User },
  { label: "Review", icon: CheckCircle2 },
];

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [physicians, setPhysicians] = useState<Physician[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);
  const [selectedPhysician, setSelectedPhysician] = useState<Physician | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);
  const [loadingPhysicians, setLoadingPhysicians] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      physicianId: "",
      slotId: "",
      patientFirstName: "",
      patientLastName: "",
      patientEmail: "",
      patientPhone: "",
      reasonForVisit: "",
    },
  });

  useEffect(() => {
    fetch("/api/physicians")
      .then((r) => r.json())
      .then((data) => {
        setPhysicians(data);
        setLoadingPhysicians(false);
      })
      .catch(() => setLoadingPhysicians(false));
  }, []);

  const handleSelectPhysician = (physician: Physician) => {
    setSelectedPhysician(physician);
    form.setValue("physicianId", physician.id);
    setSelectedSlot(null);
    form.setValue("slotId", "");
    setSlots([]);
  };

  const handleProceedToTime = () => {
    if (!selectedPhysician) return;
    setLoadingSlots(true);
    fetch(`/api/availability?physicianId=${selectedPhysician.id}`)
      .then((r) => r.json())
      .then((data) => {
        setSlots(data);
        setLoadingSlots(false);
        setStep(2);
      })
      .catch(() => setLoadingSlots(false));
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    form.setValue("slotId", slot.id);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    setSubmitError(null);

    try {
      const values = form.getValues();
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Something went wrong. Please try again.");
        setSubmitting(false);
        return;
      }
      router.push(`/confirmation/${data.id}`);
    } catch {
      setSubmitError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  const canProceedStep1 = !!selectedPhysician;
  const canProceedStep2 = !!selectedSlot;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      {/* Page heading */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900">
          Book an Appointment
        </h1>
        <p className="text-gray-500 mt-1 text-sm">
          Choose your care team, pick a time, and confirm your visit.
        </p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center justify-center mb-8">
        {STEPS.map((s, i) => {
          const stepNum = i + 1;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={s.label} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center text-sm font-medium transition-colors",
                    isActive && "bg-blue-600 text-white",
                    isCompleted && "bg-blue-100 text-blue-600",
                    !isActive && !isCompleted && "bg-gray-100 text-gray-400"
                  )}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="w-4 h-4" />
                  ) : (
                    stepNum
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs mt-1 font-medium hidden sm:block",
                    isActive ? "text-blue-600" : "text-gray-400"
                  )}
                >
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "w-12 sm:w-16 h-0.5 mx-2 mb-4",
                    step > stepNum ? "bg-blue-200" : "bg-gray-100"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Step 1: Choose physician */}
      {step === 1 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Choose a Physician
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Select the physician you would like to see.
          </p>

          {loadingPhysicians ? (
            <div className="flex justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
            </div>
          ) : (
            <div className="space-y-3">
              {physicians.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectPhysician(p)}
                  className={cn(
                    "w-full text-left rounded-xl border p-4 transition-all",
                    selectedPhysician?.id === p.id
                      ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                      : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                  )}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-semibold text-gray-900">{p.name}</p>
                      <p className="text-sm text-blue-600 mt-0.5">
                        {p.specialty}
                      </p>
                      <div className="flex items-center gap-1 mt-1.5 text-gray-500 text-xs">
                        <MapPin className="w-3 h-3" />
                        {p.location}
                      </div>
                      {p.bio && (
                        <p className="text-xs text-gray-400 mt-2 leading-relaxed">
                          {p.bio}
                        </p>
                      )}
                    </div>
                    {selectedPhysician?.id === p.id && (
                      <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}

          <div className="mt-6 flex justify-end">
            <Button
              onClick={handleProceedToTime}
              disabled={!canProceedStep1 || loadingSlots}
            >
              {loadingSlots ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading times...
                </>
              ) : (
                <>
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Choose time */}
      {step === 2 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Choose an Appointment Time
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Available times for{" "}
            <span className="font-medium text-gray-700">
              {selectedPhysician?.name}
            </span>
          </p>

          {slots.length === 0 ? (
            <Card>
              <CardContent className="py-10 text-center">
                <Clock className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 font-medium">
                  No available appointment times
                </p>
                <p className="text-sm text-gray-400 mt-1">
                  Please go back and select a different physician.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {slots.map((slot) => {
                const start = new Date(slot.startTime);
                const isSelected = selectedSlot?.id === slot.id;
                return (
                  <button
                    key={slot.id}
                    onClick={() => handleSelectSlot(slot)}
                    className={cn(
                      "rounded-lg border p-3 text-left transition-all",
                      isSelected
                        ? "border-blue-500 bg-blue-50 ring-2 ring-blue-200"
                        : "border-gray-100 bg-white hover:border-blue-200 hover:bg-blue-50/30"
                    )}
                  >
                    <p className="text-xs font-medium text-gray-500">
                      {format(start, "EEE, MMM d")}
                    </p>
                    <p
                      className={cn(
                        "text-sm font-semibold mt-0.5",
                        isSelected ? "text-blue-700" : "text-gray-900"
                      )}
                    >
                      {format(start, "h:mm a")}
                    </p>
                  </button>
                );
              })}
            </div>
          )}

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(1)}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={() => setStep(3)}
              disabled={!canProceedStep2}
            >
              Continue
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Patient details */}
      {step === 3 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Your Details
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Tell us a bit about yourself and the reason for your visit.
          </p>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  First Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Jane"
                  {...form.register("patientFirstName")}
                />
                {form.formState.errors.patientFirstName && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.patientFirstName.message}
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <Input
                  placeholder="Smith"
                  {...form.register("patientLastName")}
                />
                {form.formState.errors.patientLastName && (
                  <p className="text-xs text-red-500 mt-1">
                    {form.formState.errors.patientLastName.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email Address <span className="text-red-500">*</span>
              </label>
              <Input
                type="email"
                placeholder="jane@example.com"
                {...form.register("patientEmail")}
              />
              {form.formState.errors.patientEmail && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.patientEmail.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <Input
                type="tel"
                placeholder="555-0100"
                {...form.register("patientPhone")}
              />
              {form.formState.errors.patientPhone && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.patientPhone.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Reason for Visit <span className="text-red-500">*</span>
              </label>
              <Textarea
                placeholder="Briefly describe the reason for your appointment..."
                rows={3}
                {...form.register("reasonForVisit")}
              />
              {form.formState.errors.reasonForVisit && (
                <p className="text-xs text-red-500 mt-1">
                  {form.formState.errors.reasonForVisit.message}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <Button variant="outline" onClick={() => setStep(2)}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button
              onClick={async () => {
                const valid = await form.trigger([
                  "patientFirstName",
                  "patientLastName",
                  "patientEmail",
                  "patientPhone",
                  "reasonForVisit",
                ]);
                if (valid) setStep(4);
              }}
            >
              Review Appointment
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 4: Review & submit */}
      {step === 4 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">
            Review Your Appointment
          </h2>
          <p className="text-sm text-gray-500 mb-5">
            Please confirm the details below before submitting.
          </p>

          <Card className="mb-5">
            <CardContent className="pt-5 space-y-1">
              <ReviewRow
                label="Physician"
                value={`${selectedPhysician?.name} — ${selectedPhysician?.specialty}`}
              />
              <ReviewRow
                label="Location"
                value={selectedPhysician?.location || ""}
              />
              {selectedSlot && (
                <ReviewRow
                  label="Appointment"
                  value={`${format(new Date(selectedSlot.startTime), "EEEE, MMMM d, yyyy")} at ${format(new Date(selectedSlot.startTime), "h:mm a")}`}
                />
              )}
              <div className="border-t border-gray-100 pt-3 mt-3 space-y-1">
                <ReviewRow
                  label="Patient"
                  value={`${form.getValues("patientFirstName")} ${form.getValues("patientLastName")}`}
                />
                <ReviewRow
                  label="Email"
                  value={form.getValues("patientEmail")}
                />
                <ReviewRow
                  label="Phone"
                  value={form.getValues("patientPhone")}
                />
                <ReviewRow
                  label="Reason for Visit"
                  value={form.getValues("reasonForVisit")}
                />
              </div>
            </CardContent>
          </Card>

          {submitError && (
            <div className="mb-4 flex items-start gap-2 rounded-lg border border-red-100 bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              {submitError}
            </div>
          )}

          <div className="flex justify-between">
            <Button variant="outline" onClick={() => setStep(3)} disabled={submitting}>
              <ChevronLeft className="w-4 h-4" />
              Back
            </Button>
            <Button onClick={handleSubmit} disabled={submitting} size="lg">
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Request Appointment"
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1.5">
      <span className="text-sm text-gray-500 w-36 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-medium">{value}</span>
    </div>
  );
}
