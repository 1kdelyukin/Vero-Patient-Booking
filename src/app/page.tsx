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
  Sparkles,
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

/** Deterministic gradient per physician index */
const AVATAR_GRADIENTS = [
  "from-sky-400 to-[#348cc4]",
  "from-teal-400 to-sky-600",
  "from-cyan-500 to-blue-600",
  "from-sky-500 to-teal-600",
];

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function BookingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [prevStep, setPrevStep] = useState(1);
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
        goTo(2);
      })
      .catch(() => setLoadingSlots(false));
  };

  const handleSelectSlot = (slot: Slot) => {
    setSelectedSlot(slot);
    form.setValue("slotId", slot.id);
  };

  const goTo = (n: number) => {
    setPrevStep(step);
    setStep(n);
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
  const isForward = step > prevStep;

  return (
    <div>
      {/* Hero banner */}
      <div className="relative overflow-hidden pt-28 pb-10 px-4">
        <div className="pointer-events-none absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[420px] bg-[radial-gradient(ellipse,rgba(52,140,196,0.2),transparent_65%)]" />
        <div className="pointer-events-none absolute bottom-0 right-1/4 w-[350px] h-[250px] bg-[radial-gradient(ellipse,rgba(250,180,120,0.18),transparent_65%)]" />
        <div className="relative max-w-2xl mx-auto text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/75 backdrop-blur-sm text-[#348cc4] text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/80 animate-fade-in shadow-sm">
            <Sparkles className="w-3 h-3" />
            Intelligent Patient Scheduling
          </div>
          <h1 className="text-3xl sm:text-[2.75rem] font-bold text-gray-900 tracking-tight animate-slide-up leading-tight">
            The intelligent way to book
            <br />
            <span
              className="italic font-bold"
              style={{ fontFamily: 'var(--font-lora, Georgia, "Times New Roman", serif)' }}
            >
              modern care.
            </span>
          </h1>
          <p className="text-gray-600 mt-4 text-sm sm:text-base animate-slide-up max-w-sm mx-auto" style={{ animationDelay: '60ms' }}>
            Connect with your care team in minutes.
          </p>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 pb-12">
        {/* Booking card – Vero app style */}
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl shadow-gray-200/30 overflow-hidden animate-scale-in">
          {/* Card header bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-100 bg-gray-50/40">
            <div className="flex items-center gap-2.5">
              <div className="w-6 h-6 rounded-lg bg-[#348cc4] flex items-center justify-center shadow-sm shadow-sky-200">
                <Sparkles className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-800">New Appointment</span>
            </div>
            <span className="text-xs text-gray-400 font-medium bg-gray-100/60 px-2.5 py-1 rounded-full tabular-nums">
              {step} / {STEPS.length}
            </span>
          </div>

          <div className="flex">
            {/* Left sidebar – step navigation */}
            <div className="hidden sm:flex flex-col w-44 border-r border-gray-100 py-3 px-2 shrink-0 bg-gray-50/20">
              <div className="flex flex-col gap-0.5 flex-1">
                {STEPS.map((s, i) => {
                  const stepNum = i + 1;
                  const isActive = step === stepNum;
                  const isCompleted = step > stepNum;
                  const Icon = s.icon;
                  return (
                    <div
                      key={s.label}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 select-none",
                        isActive ? "bg-sky-50 text-[#348cc4]" : isCompleted ? "text-gray-500" : "text-gray-300"
                      )}
                    >
                      <div className={cn(
                        "w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all duration-200",
                        isActive ? "bg-[#348cc4] text-white shadow-sm shadow-sky-200" : isCompleted ? "bg-sky-50 text-[#348cc4]" : "bg-gray-100 text-gray-300"
                      )}>
                        {isCompleted ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                      </div>
                      <span>{s.label}</span>
                    </div>
                  );
                })}
              </div>
              <div className="px-3 pb-2 pt-4">
                <p className="text-[10px] text-gray-300 font-semibold uppercase tracking-wider">Powered by Vero</p>
              </div>
            </div>

            {/* Main content area */}
            <div className="flex-1 min-w-0 p-5 sm:p-6">
              {/* Mobile progress bar */}
              <div className="flex items-center gap-1.5 mb-5 sm:hidden">
                {STEPS.map((_, i) => (
                  <div key={i} className={cn(
                    "h-1 rounded-full flex-1 transition-all duration-300",
                    step > i + 1 ? "bg-[#348cc4]" : step === i + 1 ? "bg-[#348cc4]/50" : "bg-gray-100"
                  )} />
                ))}
              </div>

              {/* Animated step content */}
              <div key={step} className={cn(isForward ? "animate-slide-right" : "animate-slide-up")}>

          {/* ── Step 1: Choose physician ── */}
          {step === 1 && (
            <div>
              <StepHeader
                title="Choose a Physician"
                subtitle="Select the specialist you'd like to see."
              />

              {loadingPhysicians ? (
                <div className="flex justify-center py-16">
                  <Loader2 className="w-6 h-6 animate-spin text-[#348cc4]" />
                </div>
              ) : (
                <div className="space-y-3 stagger">
                  {physicians.map((p, idx) => (
                    <button
                      key={p.id}
                      onClick={() => handleSelectPhysician(p)}
                      className={cn(
                        "w-full text-left rounded-2xl border p-4 transition-all duration-200 animate-slide-up",
                        selectedPhysician?.id === p.id
                          ? "border-[#348cc4]/50 bg-sky-50 ring-2 ring-sky-200 shadow-md shadow-sky-100"
                          : "border-gray-100 bg-white hover:border-sky-200 hover:shadow-md hover:shadow-sky-50 hover:-translate-y-0.5 shadow-sm"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 shadow-sm bg-gradient-to-br",
                            AVATAR_GRADIENTS[idx % AVATAR_GRADIENTS.length]
                          )}
                        >
                          {initials(p.name)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <p className="font-semibold text-gray-900 text-sm leading-tight">{p.name}</p>
                              <p className="text-xs text-[#348cc4] font-medium mt-0.5">{p.specialty}</p>
                            </div>
                            {selectedPhysician?.id === p.id && (
                              <CheckCircle2 className="w-[18px] h-[18px] text-[#348cc4] shrink-0 mt-0.5" />
                            )}
                          </div>
                          <div className="flex items-center gap-1 mt-1.5 text-gray-400 text-xs">
                            <MapPin className="w-3 h-3" />
                            {p.location}
                          </div>
                          {p.bio && (
                            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed line-clamp-2">{p.bio}</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <Button onClick={handleProceedToTime} disabled={!canProceedStep1 || loadingSlots} size="lg">
                  {loadingSlots ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Loading times…
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

          {/* ── Step 2: Choose time ── */}
          {step === 2 && (
            <div>
              <StepHeader
                title="Choose a Time"
                subtitle={
                  <>
                    Available slots for{" "}
                    <span className="font-semibold text-gray-800">{selectedPhysician?.name}</span>
                  </>
                }
              />

              {slots.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="py-12 text-center">
                    <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center mx-auto mb-3">
                      <Clock className="w-6 h-6 text-gray-300" />
                    </div>
                    <p className="text-gray-500 font-medium text-sm">No available appointment times</p>
                    <p className="text-xs text-gray-400 mt-1">Please go back and select a different physician.</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 stagger">
                  {slots.map((slot) => {
                    const start = new Date(slot.startTime);
                    const isSelected = selectedSlot?.id === slot.id;
                    return (
                      <button
                        key={slot.id}
                        onClick={() => handleSelectSlot(slot)}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all duration-200 animate-slide-up",
                          isSelected
                            ? "border-[#348cc4]/50 bg-sky-50 ring-2 ring-sky-200 shadow-md shadow-sky-100"
                            : "border-gray-100 bg-white hover:border-sky-200 hover:bg-sky-50/30 hover:-translate-y-0.5 shadow-sm hover:shadow-md hover:shadow-sky-50"
                        )}
                      >
                        <p className="text-xs font-medium text-gray-400">{format(start, "EEE, MMM d")}</p>
                        <p className={cn("text-sm font-bold mt-0.5", isSelected ? "text-[#2a7ab0]" : "text-gray-900")}>
                          {format(start, "h:mm a")}
                        </p>
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => goTo(1)}>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={() => goTo(3)} disabled={!canProceedStep2} size="lg">
                  Continue
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 3: Patient details ── */}
          {step === 3 && (
            <div>
              <StepHeader
                title="Your Details"
                subtitle="Tell us a bit about yourself and the reason for your visit."
              />

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="First Name" required error={form.formState.errors.patientFirstName?.message}>
                    <Input placeholder="Jane" {...form.register("patientFirstName")} />
                  </FormField>
                  <FormField label="Last Name" required error={form.formState.errors.patientLastName?.message}>
                    <Input placeholder="Smith" {...form.register("patientLastName")} />
                  </FormField>
                </div>

                <FormField label="Email Address" required error={form.formState.errors.patientEmail?.message}>
                  <Input type="email" placeholder="jane@example.com" {...form.register("patientEmail")} />
                </FormField>

                <FormField label="Phone Number" required error={form.formState.errors.patientPhone?.message}>
                  <Input type="tel" placeholder="555-0100" {...form.register("patientPhone")} />
                </FormField>

                <FormField label="Reason for Visit" required error={form.formState.errors.reasonForVisit?.message}>
                  <Textarea
                    placeholder="Briefly describe the reason for your appointment…"
                    rows={3}
                    {...form.register("reasonForVisit")}
                  />
                </FormField>
              </div>

              <div className="mt-6 flex justify-between">
                <Button variant="outline" onClick={() => goTo(2)}>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button
                  size="lg"
                  onClick={async () => {
                    const valid = await form.trigger([
                      "patientFirstName",
                      "patientLastName",
                      "patientEmail",
                      "patientPhone",
                      "reasonForVisit",
                    ]);
                    if (valid) goTo(4);
                  }}
                >
                  Review Appointment
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}

          {/* ── Step 4: Review & submit ── */}
          {step === 4 && (
            <div>
              <StepHeader
                title="Review & Confirm"
                subtitle="Please check everything below before submitting."
              />

              <div className="rounded-2xl border border-sky-100 bg-gradient-to-b from-sky-50/50 to-white p-5 mb-4 shadow-sm">
                <p className="text-xs font-semibold text-[#348cc4] uppercase tracking-widest mb-3">Appointment</p>
                <ReviewRow label="Physician" value={`${selectedPhysician?.name} · ${selectedPhysician?.specialty}`} />
                <ReviewRow label="Location" value={selectedPhysician?.location || ""} />
                {selectedSlot && (
                  <ReviewRow
                    label="Date & Time"
                    value={`${format(new Date(selectedSlot.startTime), "EEEE, MMMM d, yyyy")} at ${format(new Date(selectedSlot.startTime), "h:mm a")}`}
                  />
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-5 mb-5 shadow-sm">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">Patient</p>
                <ReviewRow label="Name" value={`${form.getValues("patientFirstName")} ${form.getValues("patientLastName")}`} />
                <ReviewRow label="Email" value={form.getValues("patientEmail")} />
                <ReviewRow label="Phone" value={form.getValues("patientPhone")} />
                <ReviewRow label="Reason" value={form.getValues("reasonForVisit")} />
              </div>

              {submitError && (
                <div className="mb-4 flex items-start gap-2 rounded-xl border border-red-100 bg-red-50 p-3.5 text-sm text-red-700">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  {submitError}
                </div>
              )}

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => goTo(3)} disabled={submitting}>
                  <ChevronLeft className="w-4 h-4" />
                  Back
                </Button>
                <Button onClick={handleSubmit} disabled={submitting} size="lg">
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Submitting…
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Request Appointment
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Helper sub-components ── */

function StepHeader({ title, subtitle }: { title: string; subtitle: React.ReactNode }) {
  return (
    <div className="mb-5">
      <h2 className="text-xl font-bold text-gray-900">{title}</h2>
      <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>
    </div>
  );
}

function FormField({
  label,
  required,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
          <AlertCircle className="w-3 h-3" />
          {error}
        </p>
      )}
    </div>
  );
}

function ReviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-3 py-1">
      <span className="text-sm text-gray-400 w-28 shrink-0">{label}</span>
      <span className="text-sm text-gray-900 font-semibold leading-snug">{value}</span>
    </div>
  );
}

