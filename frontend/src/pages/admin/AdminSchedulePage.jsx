import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import _ from "lodash";
import {
  Button,
  Switch,
  Input,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Spinner,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { adminGetSchedules, adminBulkUpdateSchedules } from "../../api/api";

export default function AdminSchedulePage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [schedules, setSchedules] = useState([]);
  const [saved, setSaved] = useState(false);

  const {
    data: initialSchedules = [],
    isLoading,
    isSuccess,
  } = useQuery({
    queryKey: ["adminSchedules"],
    queryFn: async () => (await adminGetSchedules()).data,
  });

  useEffect(() => {
    if (isSuccess && schedules.length === 0) {
      const data = _.range(7).map((i) => {
        const existing = initialSchedules.find((s) => s.day_of_week === i);
        return (
          existing || {
            day_of_week: i,
            start_time: "09:00",
            end_time: "18:00",
            is_day_off: i === 0,
            schedule_breaks: [],
          }
        );
      });
      setSchedules(data);
    }
  }, [initialSchedules, isSuccess, schedules.length]);

  const saveMutation = useMutation({
    mutationFn: async (payload) => await adminBulkUpdateSchedules(payload),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminSchedules"]);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
    onError: (err) => {
      const msg =
        err.response?.data?.errors?.join(", ") ||
        t("common.error", "Something went wrong");
      addToast({
        title: t("common.error", "Error"),
        description: msg,
        color: "danger",
        timeout: 4000,
      });
    },
  });

  const updateDay = (idx, field, value) => {
    const updated = [...schedules];
    updated[idx] = { ...updated[idx], [field]: value };
    setSchedules(updated);
  };

  const addBreak = (idx) => {
    const updated = [...schedules];
    updated[idx] = {
      ...updated[idx],
      schedule_breaks: [
        ...(updated[idx].schedule_breaks || []),
        { start_time: "13:00", end_time: "14:00" },
      ],
    };
    setSchedules(updated);
  };

  const updateBreak = (dayIdx, breakIdx, field, value) => {
    const updated = [...schedules];
    const breaks = [...updated[dayIdx].schedule_breaks];
    breaks[breakIdx] = { ...breaks[breakIdx], [field]: value };
    updated[dayIdx] = { ...updated[dayIdx], schedule_breaks: breaks };
    setSchedules(updated);
  };

  const removeBreak = (dayIdx, breakIdx) => {
    const updated = [...schedules];
    const breaks = [...updated[dayIdx].schedule_breaks];
    const br = breaks[breakIdx];
    if (br.id) {
      breaks[breakIdx] = { ...br, _destroy: true };
    } else {
      breaks.splice(breakIdx, 1);
    }
    updated[dayIdx] = { ...updated[dayIdx], schedule_breaks: breaks };
    setSchedules(updated);
  };

  const handleSave = () => {
    const payload = schedules.map((s) => ({
      day_of_week: s.day_of_week,
      start_time: s.start_time,
      end_time: s.end_time,
      is_day_off: s.is_day_off,
      schedule_breaks_attributes: (s.schedule_breaks || []).map((b) => ({
        id: b.id || undefined,
        start_time: b.start_time,
        end_time: b.end_time,
        _destroy: b._destroy || false,
      })),
    }));
    saveMutation.mutate(payload);
  };

  // Helper to format time strings for display in inputs
  const formatTime = (timeStr) => {
    if (!timeStr) return "";
    if (timeStr.includes("T")) {
      // Create a date object, assuming it's UTC time and convert exactly as is (ignoring local timezone offset for display)
      return timeStr.split("T")[1].slice(0, 5);
    }
    return timeStr.slice(0, 5);
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );

  const daysOfWeek = [
    t("admin.schedule.days.0", "Sunday"),
    t("admin.schedule.days.1", "Monday"),
    t("admin.schedule.days.2", "Tuesday"),
    t("admin.schedule.days.3", "Wednesday"),
    t("admin.schedule.days.4", "Thursday"),
    t("admin.schedule.days.5", "Friday"),
    t("admin.schedule.days.6", "Saturday"),
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-5xl mx-auto pb-10">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.schedule.title", "Working Hours")}
        </h1>
        <Button
          onPress={handleSave}
          isLoading={saveMutation.isPending}
          className="bg-fresha-dark text-white font-medium"
          startContent={
            !saveMutation.isPending && (
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"
                />
              </svg>
            )
          }
        >
          {t("admin.schedule.save", "Save Changes")}
        </Button>
      </div>

      {saved && (
        <div className="bg-green-50 text-green-700 p-4 rounded-xl border border-green-200 mb-6 font-medium text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <svg
            className="w-5 h-5 text-green-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          {t("admin.schedule.success", "Schedule saved successfully!")}
        </div>
      )}

      <div className="space-y-4">
        {schedules.map((day, idx) => (
          <Card
            key={day.day_of_week}
            className={`border-none shadow-sm transition-opacity duration-300 ${day.is_day_off ? "opacity-60 bg-gray-50" : "bg-white"}`}
          >
            <CardBody className="p-5 md:p-6">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                {/* Day Header (Left Column) */}
                <div className="w-full md:w-48 flex justify-between md:flex-col md:justify-start gap-2 border-b md:border-b-0 md:border-r border-gray-100 pb-4 md:pb-0 md:pr-6">
                  <h3 className="text-lg font-bold text-fresha-dark">
                    {daysOfWeek[day.day_of_week]}
                  </h3>
                  <Switch
                    isSelected={!day.is_day_off}
                    onValueChange={(val) => updateDay(idx, "is_day_off", !val)}
                    size="sm"
                    color="success"
                  >
                    <span className="text-sm font-medium text-gray-500">
                      {day.is_day_off
                        ? t("admin.schedule.closed", "Closed")
                        : t("admin.schedule.open", "Open")}
                    </span>
                  </Switch>
                </div>

                {/* Hours Configuration (Right Column) */}
                <div className="flex-1">
                  {!day.is_day_off ? (
                    <div className="space-y-6">
                      {/* Main Hours */}
                      <div className="flex items-center gap-4">
                        <Input
                          type="time"
                          label={t("admin.schedule.open", "Open")}
                          value={formatTime(day.start_time)}
                          onValueChange={(val) =>
                            updateDay(idx, "start_time", val)
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          classNames={{
                            inputWrapper: "bg-white",
                            label: "font-bold text-gray-500 text-xs uppercase",
                          }}
                          className="w-32"
                        />
                        <span className="text-gray-400 mt-6">-</span>
                        <Input
                          type="time"
                          label={t("admin.schedule.closed", "Closed")}
                          value={formatTime(day.end_time)}
                          onValueChange={(val) =>
                            updateDay(idx, "end_time", val)
                          }
                          variant="bordered"
                          labelPlacement="outside"
                          classNames={{
                            inputWrapper: "bg-white",
                            label: "font-bold text-gray-500 text-xs uppercase",
                          }}
                          className="w-32"
                        />
                      </div>

                      {/* Breaks */}
                      <div className="pt-4 border-t border-gray-100">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {t("admin.schedule.breaks", "Breaks")}
                          </span>
                          <Button
                            size="sm"
                            variant="flat"
                            className="bg-blue-50 text-blue-600 font-medium"
                            onPress={() => addBreak(idx)}
                            startContent={
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                                />
                              </svg>
                            }
                          >
                            {t("admin.schedule.addBreak", "Add Break")}
                          </Button>
                        </div>

                        <div className="space-y-3">
                          {(day.schedule_breaks || []).filter(
                            (b) => !b._destroy,
                          ).length === 0 && (
                            <p className="text-sm text-gray-400 italic">
                              {t(
                                "admin.schedule.noBreaks",
                                "No breaks scheduled.",
                              )}
                            </p>
                          )}
                          {(day.schedule_breaks || []).map((br, bIdx) => {
                            if (br._destroy) return null;
                            return (
                              <div
                                key={bIdx}
                                className="flex items-center gap-4 bg-gray-50 p-2 rounded-xl"
                              >
                                <Input
                                  type="time"
                                  value={formatTime(br.start_time)}
                                  onValueChange={(val) =>
                                    updateBreak(idx, bIdx, "start_time", val)
                                  }
                                  variant="faded"
                                  className="w-32"
                                />
                                <span className="text-gray-400">-</span>
                                <Input
                                  type="time"
                                  value={formatTime(br.end_time)}
                                  onValueChange={(val) =>
                                    updateBreak(idx, bIdx, "end_time", val)
                                  }
                                  variant="faded"
                                  className="w-32"
                                />
                                <Button
                                  isIconOnly
                                  variant="light"
                                  color="danger"
                                  onPress={() => removeBreak(idx, bIdx)}
                                >
                                  <svg
                                    className="w-5 h-5"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2.5}
                                      d="M6 18L18 6M6 6l12 12"
                                    />
                                  </svg>
                                </Button>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full text-gray-400 font-medium italic">
                      {t("admin.schedule.closedOn", "Closed on {{day}}s", {
                        day: daysOfWeek[day.day_of_week],
                      })}
                    </div>
                  )}
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
