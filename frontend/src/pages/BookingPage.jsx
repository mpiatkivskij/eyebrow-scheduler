import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import dayjs from "dayjs";
import "dayjs/locale/uk";
import {
  Button,
  Input,
  Textarea,
  Card,
  CardBody,
  Divider,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { getServices, getAvailableSlots, createAppointment } from "../api/api";

export default function BookingPage() {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";

  // Sync dayjs locale with i18n
  useEffect(() => {
    dayjs.locale(lang);
  }, [lang]);

  // Navigation state
  const [step, setStep] = useState(0);

  // Selections
  const [selectedServices, setSelectedServices] = useState([]);
  const [selectedDate, setSelectedDate] = useState(dayjs());
  const [selectedSlot, setSelectedSlot] = useState(null);

  // Data Fetching
  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => (await getServices()).data,
  });

  const {
    data: slotsData = { slots: [], message: "" },
    isLoading: loadingSlots,
  } = useQuery({
    queryKey: [
      "availableSlots",
      selectedServices.map((s) => s.id).join(","),
      selectedDate?.format("YYYY-MM-DD"),
    ],
    queryFn: async () =>
      (
        await getAvailableSlots(
          selectedServices.map((s) => s.id).join(","),
          selectedDate.format("YYYY-MM-DD"),
        )
      ).data,
    enabled: selectedServices.length > 0 && !!selectedDate,
  });

  const totalDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );
  const totalPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price),
    0,
  );

  const slots = slotsData.slots || [];
  const slotsMessage = slotsData.message || "";

  // Form State
  const [formData, setFormData] = useState({
    client_name: "",
    client_phone: "",
    client_email: "",
    notes: "",
  });
  const [booked, setBooked] = useState(null);
  const [error, setError] = useState("");

  // Mutation for booking
  const bookMutation = useMutation({
    mutationFn: async () => {
      const res = await createAppointment({
        service_ids: selectedServices.map((s) => s.id),
        appointment: {
          ...formData,
          start_time: selectedSlot.start_time,
          language_used: lang,
        },
      });
      return res.data;
    },
    onSuccess: (data) => {
      setBooked(data);
      setStep(3);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.errors?.join(", ") ||
        t("common.error", "Something went wrong");
      setError(msg);
      addToast({
        title: t("common.error", "Error"),
        description: msg,
        color: "danger",
        timeout: 4000,
      });
    },
  });

  // Handle Initial State from Location
  useEffect(() => {
    if (location.state?.serviceId && services.length > 0) {
      const s = services.find((sv) => sv.id === location.state.serviceId);
      if (s) {
        setSelectedServices([s]);
        setStep(1);
      }
    }
  }, [location.state?.serviceId, services]);

  const toggleService = (service) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      if (exists) return prev.filter((s) => s.id !== service.id);
      return [...prev, service];
    });
  };

  // Generate 30 days
  const datesList = Array.from({ length: 30 }, (_, i) => dayjs().add(i, "day"));

  // Group slots
  const groupedSlots = slots.reduce(
    (acc, slot) => {
      const hour = dayjs(slot.start_time).hour();
      if (hour < 12) acc.morning.push(slot);
      else if (hour < 17) acc.afternoon.push(slot);
      else acc.evening.push(slot);
      return acc;
    },
    { morning: [], afternoon: [], evening: [] },
  );

  // Scroll to top when step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [step]);

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  return (
    <div className="min-h-screen bg-fresha-light pb-32 w-full font-sans">
      {/* Header Bar */}
      <div className="bg-white border-b border-gray-200 py-4 sticky top-0 z-40 px-4">
        <div className="container mx-auto max-w-2xl flex items-center h-8">
          {step > 0 && step < 3 && (
            <button
              onClick={goBack}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors mr-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="w-5 h-5 text-fresha-dark"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18"
                />
              </svg>
            </button>
          )}
          <h2
            className={`font-bold text-lg text-fresha-dark flex-1 ${step === 0 || step === 3 ? "text-center" : "text-left"}`}
          >
            {step === 0 && t("booking.steps.service", "Select Services")}
            {step === 1 && t("booking.steps.datetime", "Select Time")}
            {step === 2 && t("booking.steps.details", "Your Details")}
            {step === 3 && t("booking.steps.confirmation", "Confirmation")}
          </h2>
        </div>
      </div>

      <div className="container mx-auto max-w-2xl pt-6 px-4">
        {error && (
          <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200 mb-6 font-medium text-sm slide-in-from-top-2 animate-in fade-in">
            {error}
          </div>
        )}

        {/* Step 0: Services */}
        {step === 0 && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <h1 className="text-2xl font-bold mb-6 text-fresha-dark">
              {t("booking.selectService", "Select procedure(s)")}
            </h1>
            <div className="space-y-4">
              {services.map((service) => {
                const isSelected = selectedServices.some(
                  (s) => s.id === service.id,
                );
                return (
                  <Card
                    key={service.id}
                    isPressable
                    onPress={() => toggleService(service)}
                    className={`w-full border-2 shadow-none rounded-xl transition-colors duration-200 ${isSelected ? "border-fresha-dark bg-gray-50" : "border-gray-200 bg-white hover:border-gray-300"}`}
                  >
                    <CardBody className="p-5 flex flex-row items-start justify-between">
                      <div className="flex-1 pr-4 text-left">
                        <h3 className="text-lg font-bold mb-1 text-fresha-dark">
                          {lang === "uk" ? service.name_uk : service.name_en}
                        </h3>
                        <p className="text-sm text-gray-500 mb-3 line-clamp-2">
                          {lang === "uk"
                            ? service.description_uk
                            : service.description_en}
                        </p>
                        <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                          {t("services.duration", {
                            minutes: service.duration_minutes,
                          })}
                        </span>
                      </div>
                      <div className="flex flex-col items-end justify-between h-full min-h-[5rem]">
                        <div
                          className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${isSelected ? "border-fresha-dark bg-fresha-dark" : "border-gray-300"}`}
                        >
                          {isSelected && (
                            <svg
                              className="w-4 h-4 text-white"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                              strokeWidth={3}
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="font-bold text-lg text-fresha-dark block mt-4">
                          ₴{Number(service.price).toFixed(0)}
                        </span>
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Step 1: Date & Time */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="font-bold text-lg mb-4 text-fresha-dark">
              {selectedDate.format("MMMM YYYY")}
            </h3>

            <div className="flex overflow-x-auto pb-4 mb-2 -mx-2 px-2 gap-3 scrollbar-hide snap-x">
              {datesList.map((d, i) => {
                const isCur = d.isSame(selectedDate, "day");
                return (
                  <div
                    key={i}
                    onClick={() => {
                      setSelectedDate(d);
                      setSelectedSlot(null);
                    }}
                    className={`snap-start min-w-[4.5rem] h-[5rem] flex flex-col items-center justify-center rounded-xl cursor-pointer border-2 transition-all duration-200 ${isCur ? "border-fresha-dark bg-fresha-dark text-white shadow-md" : "border-gray-200 bg-white text-gray-800 hover:border-gray-300"}`}
                  >
                    <span className="text-[11px] font-bold uppercase tracking-wider opacity-90">
                      {d.format("dd")}
                    </span>
                    <span className="text-xl font-bold mt-1">
                      {d.format("DD")}
                    </span>
                  </div>
                );
              })}
            </div>

            <Divider className="my-6 bg-gray-100" />

            {loadingSlots ? (
              <div className="py-12 flex justify-center">
                <div className="w-8 h-8 border-4 border-gray-200 border-t-fresha-dark rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="animate-in fade-in duration-500">
                {slotsMessage && slots.length === 0 && (
                  <div className="bg-gray-50 text-gray-700 p-6 rounded-2xl text-center border border-gray-200">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-500"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"
                        />
                      </svg>
                    </div>
                    <p className="font-bold text-lg mb-1">
                      {t("booking.closedDay", "Salon is closed on this day")}
                    </p>
                    <p className="text-sm opacity-70">
                      {t("booking.closedDayHint", "Please choose another date")}
                    </p>
                  </div>
                )}
                {!slotsMessage && slots.length === 0 && (
                  <div className="bg-yellow-50 text-yellow-800 p-6 rounded-2xl text-center border border-yellow-100">
                    <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="w-6 h-6 text-yellow-600"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <p className="font-bold text-lg mb-1">
                      {t(
                        "booking.noSlotsAvailable",
                        "No available time on this date",
                      )}
                    </p>
                    <p className="text-sm mb-4 opacity-80">
                      {t(
                        "booking.noSlotsHint",
                        "All time slots are booked. Try selecting a different date or fewer services.",
                      )}
                    </p>
                    <Button
                      size="sm"
                      variant="bordered"
                      className="border-yellow-300 text-yellow-900 font-bold"
                      onPress={() => setStep(0)}
                    >
                      {t("booking.backToServices", "Back to Services")}
                    </Button>
                  </div>
                )}

                {slots.length > 0 &&
                  ["morning", "afternoon", "evening"].map((period) => {
                    const periodSlots = groupedSlots[period];
                    if (periodSlots.length === 0) return null;
                    return (
                      <div key={period} className="mb-6 last:mb-0">
                        <h4 className="font-bold text-sm text-gray-500 uppercase tracking-wider mb-3 leading-none">
                          {t(`booking.periods.${period}`, period)}
                        </h4>
                        <div className="grid grid-cols-4 gap-2.5">
                          {periodSlots.map((slot) => {
                            const isSel =
                              selectedSlot?.start_time === slot.start_time;
                            return (
                              <Button
                                key={slot.start_time}
                                onPress={() => setSelectedSlot(slot)}
                                className={`h-12 w-full font-bold text-sm rounded-lg border-2 transition-all ${isSel ? "border-fresha-dark bg-fresha-dark text-white" : "border-gray-200 bg-white text-fresha-dark hover:border-gray-300 hover:bg-gray-50"}`}
                              >
                                {dayjs(slot.start_time).format("HH:mm")}
                              </Button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Contact Details */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-8 duration-300">
            {/* Summary Card */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-8">
              <span className="text-[11px] font-bold text-gray-400 tracking-widest uppercase block mb-3">
                {t("booking.summary", "Booking Summary")}
              </span>
              <div className="space-y-1 mb-4">
                {selectedServices.map((s) => (
                  <h3
                    key={s.id}
                    className="font-bold text-md text-fresha-dark leading-tight"
                  >
                    {lang === "uk" ? s.name_uk : s.name_en}
                  </h3>
                ))}
              </div>
              <p className="text-gray-500 text-sm mb-4">
                {selectedDate?.format("dddd, D MMM YYYY")}{" "}
                {t("booking.at", "at")}{" "}
                {dayjs(selectedSlot?.start_time).format("HH:mm")}
                <span className="block mt-1 text-xs font-medium">
                  {t("services.duration", { minutes: totalDuration })}
                </span>
              </p>
              <Divider className="my-3 bg-gray-100" />
              <div className="flex justify-between items-end mt-4">
                <span className="font-semibold text-gray-600 text-sm">
                  {t("booking.totalToPay", "Total To Pay")}
                </span>
                <div className="text-right">
                  <span className="font-bold text-xl block leading-none">
                    ₴{totalPrice.toFixed(0)}
                  </span>
                  <span className="text-xs text-gray-400 font-medium">
                    {t("booking.payAtVenue", "Pay at venue")}
                  </span>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-bold mb-4 text-fresha-dark">
              {t("booking.clientDetails", "Client Details")}
            </h2>
            <div className="space-y-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <Input
                label={t("booking.name", "Full Name")}
                placeholder={t("booking.namePlaceholder", "John Doe")}
                value={formData.client_name}
                onValueChange={(val) =>
                  setFormData({ ...formData, client_name: val })
                }
                isRequired
                variant="faded"
                labelPlacement="outside"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
                }}
              />
              <Input
                label={t("booking.phone", "Phone Number")}
                placeholder={t("booking.phonePlaceholder", "+380 50 123 4567")}
                type="tel"
                value={formData.client_phone}
                onValueChange={(val) =>
                  setFormData({ ...formData, client_phone: val })
                }
                isRequired
                variant="faded"
                labelPlacement="outside"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
                }}
              />
              <Input
                label={t("booking.email", "Email (Optional)")}
                type="email"
                placeholder={t("booking.emailPlaceholder", "you@example.com")}
                value={formData.client_email}
                onValueChange={(val) =>
                  setFormData({ ...formData, client_email: val })
                }
                variant="faded"
                labelPlacement="outside"
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
                }}
              />
              <Textarea
                label={t("booking.notes", "Notes")}
                placeholder={t(
                  "booking.notesPlaceholder",
                  "Any special requests?",
                )}
                value={formData.notes}
                onValueChange={(val) =>
                  setFormData({ ...formData, notes: val })
                }
                variant="faded"
                labelPlacement="outside"
                minRows={3}
                classNames={{
                  inputWrapper:
                    "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
                }}
              />
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 3 && booked && (
          <div className="text-center py-12 animate-in fade-in slide-in-from-bottom-8 duration-700 max-w-md mx-auto">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner ring-4 ring-green-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={3}
                stroke="currentColor"
                className="w-10 h-10 text-green-600"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.5 12.75l6 6 9-13.5"
                />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-3 text-fresha-dark">
              {t("booking.success.title", { name: booked.client_name })}
            </h1>
            <p className="text-gray-600 mb-8 px-4 text-lg">
              {t("booking.success.message", { name: booked.client_name })}
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 text-left mb-8 mx-4">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                {t("admin.appointments.service", "Services")}
              </span>
              <div className="mb-4">
                {selectedServices.map((s) => (
                  <p
                    key={s.id}
                    className="font-bold text-fresha-dark text-lg leading-tight"
                  >
                    {lang === "uk" ? s.name_uk : s.name_en}
                  </p>
                ))}
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  {t("services.duration", { minutes: totalDuration })}
                </p>
              </div>

              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1 block">
                {t("admin.appointments.date", "Date & Time")}
              </span>
              <p className="font-bold text-fresha-dark text-lg">
                {dayjs(booked.start_time).format("DD MMM YYYY")}{" "}
                {t("booking.at", "at")}{" "}
                {dayjs(booked.start_time).format("HH:mm")}
              </p>
            </div>

            <Button
              onPress={() => navigate("/")}
              className="px-8 py-6 rounded-full font-bold text-md bg-gray-100 text-fresha-dark hover:bg-gray-200 transition-colors"
            >
              {t("booking.success.home", "Back to Home")}
            </Button>
          </div>
        )}
      </div>

      {/* Sticky Bottom Summary Bars */}
      {step === 0 && selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom-5">
          <div className="container mx-auto max-w-2xl px-4 flex justify-between items-center gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm text-fresha-dark mb-0.5 max-w-[200px] truncate">
                {selectedServices.length === 1
                  ? lang === "uk"
                    ? selectedServices[0].name_uk
                    : selectedServices[0].name_en
                  : t("booking.multipleServices", {
                      count: selectedServices.length,
                    })}
              </h4>
              <p className="text-sm font-medium text-gray-500">
                {t("services.duration", { minutes: totalDuration })} • ₴
                {totalPrice.toFixed(0)}
              </p>
            </div>
            <Button
              onPress={() => setStep(1)}
              className="px-8 rounded-full font-bold bg-fresha-dark text-white flex-shrink-0"
            >
              {t("booking.continue", "Continue")}
            </Button>
          </div>
        </div>
      )}

      {step === 1 && selectedSlot && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom-5">
          <div className="container mx-auto max-w-2xl px-4 flex justify-between items-center gap-4">
            <div className="flex-1">
              <h4 className="font-bold text-sm text-fresha-dark mb-0.5">
                {selectedDate.format("DD MMM")} •{" "}
                {dayjs(selectedSlot.start_time).format("HH:mm")}
              </h4>
              <p className="text-sm font-medium text-gray-500 max-w-[200px] truncate">
                {t("services.duration", { minutes: totalDuration })} • ₴
                {totalPrice.toFixed(0)}
              </p>
            </div>
            <Button
              onPress={() => setStep(2)}
              className="px-8 rounded-full font-bold bg-fresha-dark text-white flex-shrink-0"
            >
              {t("booking.continue", "Continue")}
            </Button>
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-[calc(1rem+env(safe-area-inset-bottom))] z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.03)] animate-in slide-in-from-bottom-5">
          <div className="container mx-auto max-w-2xl px-4 flex justify-between items-center gap-4">
            <div className="flex-1 pr-4">
              <span className="font-bold text-xl block leading-none">
                ₴{totalPrice.toFixed(0)}
              </span>
              <span className="text-xs text-gray-400 font-medium">
                {t("services.duration", { minutes: totalDuration })}
              </span>
            </div>
            <Button
              onPress={() => bookMutation.mutate()}
              isLoading={bookMutation.isPending}
              isDisabled={!formData.client_name || !formData.client_phone}
              className="w-full max-w-[200px] rounded-full font-bold bg-fresha-dark text-white py-6"
            >
              {t("booking.confirm", "Confirm Booking")}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
