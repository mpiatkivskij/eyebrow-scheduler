import { useState, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import {
  Button,
  Chip,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { adminGetAppointments, adminUpdateAppointment } from "../../api/api";

dayjs.extend(isoWeek);

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7:00 - 20:00

export default function AdminSchedulerPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";

  const [viewMode, setViewMode] = useState("week"); // day | week | month
  const [currentDate, setCurrentDate] = useState(dayjs());
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedAppointment, setSelectedAppointment] = useState(null);

  // Calculate date range for fetching
  const dateRange = useMemo(() => {
    if (viewMode === "day") {
      return {
        from: currentDate.format("YYYY-MM-DD"),
        to: currentDate.format("YYYY-MM-DD"),
      };
    } else if (viewMode === "week") {
      return {
        from: currentDate.startOf("isoWeek").format("YYYY-MM-DD"),
        to: currentDate.endOf("isoWeek").format("YYYY-MM-DD"),
      };
    } else {
      return {
        from: currentDate
          .startOf("month")
          .startOf("isoWeek")
          .format("YYYY-MM-DD"),
        to: currentDate.endOf("month").endOf("isoWeek").format("YYYY-MM-DD"),
      };
    }
  }, [viewMode, currentDate]);

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["schedulerAppointments", dateRange.from, dateRange.to],
    queryFn: async () => {
      const res = await adminGetAppointments({
        from: dateRange.from,
        to: dateRange.to,
      });
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUpdateAppointment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedulerAppointments"] });
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
      onClose();
    },
  });

  const statusColors = {
    pending: "warning",
    confirmed: "success",
    cancelled: "danger",
    completed: "primary",
  };

  const statusBgColors = {
    pending: "bg-amber-50 border-amber-200 hover:bg-amber-100",
    confirmed: "bg-emerald-50 border-emerald-200 hover:bg-emerald-100",
    cancelled: "bg-red-50 border-red-200 hover:bg-red-100",
    completed: "bg-blue-50 border-blue-200 hover:bg-blue-100",
  };

  const navigateCalendar = (direction) => {
    const unit =
      viewMode === "day" ? "day" : viewMode === "week" ? "week" : "month";
    setCurrentDate((prev) =>
      direction === "prev" ? prev.subtract(1, unit) : prev.add(1, unit),
    );
  };

  const goToday = () => setCurrentDate(dayjs());

  const openAppointment = (apt) => {
    setSelectedAppointment(apt);
    onOpen();
  };

  const handleStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  // Header title
  const headerTitle = useMemo(() => {
    if (viewMode === "day") return currentDate.format("dddd, D MMMM YYYY");
    if (viewMode === "week") {
      const start = currentDate.startOf("isoWeek");
      const end = currentDate.endOf("isoWeek");
      if (start.month() === end.month()) {
        return `${start.format("D")} – ${end.format("D MMMM YYYY")}`;
      }
      return `${start.format("D MMM")} – ${end.format("D MMM YYYY")}`;
    }
    return currentDate.format("MMMM YYYY");
  }, [viewMode, currentDate]);

  // Week days
  const weekDays = useMemo(() => {
    const start = currentDate.startOf("isoWeek");
    return Array.from({ length: 7 }, (_, i) => start.add(i, "day"));
  }, [currentDate]);

  // Month grid
  const monthWeeks = useMemo(() => {
    const start = currentDate.startOf("month").startOf("isoWeek");
    const end = currentDate.endOf("month").endOf("isoWeek");
    const weeks = [];
    let day = start;
    while (day.isBefore(end) || day.isSame(end, "day")) {
      const week = [];
      for (let i = 0; i < 7; i++) {
        week.push(day);
        day = day.add(1, "day");
      }
      weeks.push(week);
    }
    return weeks;
  }, [currentDate]);

  // Group appointments by date
  const aptsByDate = useMemo(() => {
    const map = {};
    appointments.forEach((apt) => {
      const key = dayjs(apt.start_time).format("YYYY-MM-DD");
      if (!map[key]) map[key] = [];
      map[key].push(apt);
    });
    // Sort within each day
    Object.values(map).forEach((arr) =>
      arr.sort((a, b) => dayjs(a.start_time).diff(dayjs(b.start_time))),
    );
    return map;
  }, [appointments]);

  const getAptsForDate = (date) => aptsByDate[date.format("YYYY-MM-DD")] || [];

  // Render an appointment chip (used in week/day views)
  const renderTimeSlot = (apt) => {
    const start = dayjs(apt.start_time);
    const end = dayjs(apt.end_time);
    const services = apt.services
      ?.map((s) => (lang === "uk" ? s.name_uk : s.name_en))
      .join(", ");
    return (
      <button
        key={apt.id}
        onClick={() => openAppointment(apt)}
        className={`w-full text-left rounded-lg border px-2 py-1.5 mb-1 text-xs transition-colors cursor-pointer ${statusBgColors[apt.status] || "bg-gray-50 border-gray-200"}`}
      >
        <div className="font-bold text-gray-800 truncate">
          {start.format("HH:mm")}–{end.format("HH:mm")}
        </div>
        <div className="text-gray-700 truncate">{apt.client_name}</div>
        <div className="text-gray-500 truncate text-[10px]">{services}</div>
      </button>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.scheduler.title", "Scheduler")}
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          {/* View mode toggle */}
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex text-sm">
            {["day", "week", "month"].map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1.5 rounded-md transition-colors font-medium ${viewMode === mode ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {t(
                  `admin.scheduler.${mode}`,
                  mode.charAt(0).toUpperCase() + mode.slice(1),
                )}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex items-center gap-1">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => navigateCalendar("prev")}
            >
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
                  d="M15 19l-7-7 7-7"
                />
              </svg>
            </Button>
            <Button
              size="sm"
              variant="flat"
              onPress={goToday}
              className="font-medium"
            >
              {t("admin.scheduler.today", "Today")}
            </Button>
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => navigateCalendar("next")}
            >
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
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </Button>
          </div>

          <span className="text-sm font-semibold text-fresha-dark ml-1 hidden sm:inline">
            {headerTitle}
          </span>
        </div>
      </div>

      <div className="sm:hidden text-sm font-semibold text-fresha-dark">
        {headerTitle}
      </div>

      {isLoading && (
        <div className="flex justify-center py-10">
          <Spinner size="lg" />
        </div>
      )}

      {/* DAY VIEW */}
      {!isLoading && viewMode === "day" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="overflow-y-auto max-h-[calc(100vh-220px)]">
            <div className="min-w-0">
              {HOURS.map((hour) => {
                const hourApts = getAptsForDate(currentDate).filter(
                  (apt) => dayjs(apt.start_time).hour() === hour,
                );
                return (
                  <div
                    key={hour}
                    className="flex border-b border-gray-50 min-h-[60px]"
                  >
                    <div className="w-16 shrink-0 text-xs text-gray-400 font-medium py-2 px-3 border-r border-gray-100 text-right">
                      {String(hour).padStart(2, "0")}:00
                    </div>
                    <div className="flex-1 p-1">
                      {hourApts.map((apt) => renderTimeSlot(apt))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* WEEK VIEW */}
      {!isLoading && viewMode === "week" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="overflow-auto max-h-[calc(100vh-220px)]">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  <th className="w-16 border-b border-r border-gray-100 p-2 text-xs text-gray-400"></th>
                  {weekDays.map((day) => {
                    const isToday = day.isSame(dayjs(), "day");
                    return (
                      <th
                        key={day.format("YYYY-MM-DD")}
                        className={`border-b border-r border-gray-100 p-2 text-center ${isToday ? "bg-fresha-dark/5" : ""}`}
                      >
                        <div className="text-xs font-medium text-gray-500 uppercase">
                          {day.format("ddd")}
                        </div>
                        <div
                          className={`text-sm font-bold mt-0.5 ${isToday ? "bg-fresha-dark text-white w-7 h-7 rounded-full flex items-center justify-center mx-auto" : "text-gray-800"}`}
                        >
                          {day.format("D")}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody>
                {HOURS.map((hour) => (
                  <tr key={hour}>
                    <td className="border-b border-r border-gray-100 text-xs text-gray-400 font-medium py-2 px-3 text-right align-top w-16">
                      {String(hour).padStart(2, "0")}:00
                    </td>
                    {weekDays.map((day) => {
                      const hourApts = getAptsForDate(day).filter(
                        (apt) => dayjs(apt.start_time).hour() === hour,
                      );
                      return (
                        <td
                          key={day.format("YYYY-MM-DD")}
                          className="border-b border-r border-gray-50 p-0.5 align-top min-h-[50px]"
                        >
                          {hourApts.map((apt) => renderTimeSlot(apt))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MONTH VIEW */}
      {!isLoading && viewMode === "month" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <div className="overflow-auto max-h-[calc(100vh-220px)]">
            <table className="w-full border-collapse table-fixed">
              <thead className="sticky top-0 z-10 bg-gray-50">
                <tr>
                  {weekDays.map((day) => (
                    <th
                      key={day.format("ddd")}
                      className="border-b border-r border-gray-100 p-2 text-xs font-medium text-gray-500 uppercase text-center"
                    >
                      {day.format("ddd")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthWeeks.map((week, wi) => (
                  <tr key={wi}>
                    {week.map((day) => {
                      const isToday = day.isSame(dayjs(), "day");
                      const isCurrentMonth =
                        day.month() === currentDate.month();
                      const apts = getAptsForDate(day);
                      return (
                        <td
                          key={day.format("YYYY-MM-DD")}
                          className={`border-b border-r border-gray-100 p-1.5 align-top h-28 ${!isCurrentMonth ? "bg-gray-50/50" : ""}`}
                        >
                          <div
                            className={`text-xs font-bold mb-1 ${isToday ? "bg-fresha-dark text-white w-6 h-6 rounded-full flex items-center justify-center" : isCurrentMonth ? "text-gray-800" : "text-gray-300"}`}
                          >
                            {day.format("D")}
                          </div>
                          <div className="space-y-0.5">
                            {apts.slice(0, 3).map((apt) => (
                              <button
                                key={apt.id}
                                onClick={() => openAppointment(apt)}
                                className={`w-full text-left rounded border px-1 py-0.5 text-[10px] truncate transition-colors cursor-pointer ${statusBgColors[apt.status] || "bg-gray-50 border-gray-200"}`}
                              >
                                <span className="font-bold">
                                  {dayjs(apt.start_time).format("HH:mm")}
                                </span>{" "}
                                {apt.client_name}
                              </button>
                            ))}
                            {apts.length > 3 && (
                              <div className="text-[10px] text-gray-400 font-medium px-1">
                                +{apts.length - 3}{" "}
                                {t("admin.scheduler.more", "more")}
                              </div>
                            )}
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalContent>
          {selectedAppointment && (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold text-fresha-dark">
                    {selectedAppointment.client_name}
                  </span>
                  <Chip
                    size="sm"
                    color={statusColors[selectedAppointment.status]}
                    variant="flat"
                    className="font-bold uppercase tracking-wider text-[10px]"
                  >
                    {t(
                      `admin.appointments.statuses.${selectedAppointment.status}`,
                      selectedAppointment.status,
                    )}
                  </Chip>
                </div>
              </ModalHeader>
              <ModalBody>
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-gray-600">
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
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                    <span className="font-medium">
                      {selectedAppointment.client_phone}
                    </span>
                  </div>
                  {selectedAppointment.client_email && (
                    <div className="flex items-center gap-2 text-gray-600">
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
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="font-medium">
                        {selectedAppointment.client_email}
                      </span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-gray-600">
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
                        d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                    <span className="font-medium">
                      {dayjs(selectedAppointment.start_time).format(
                        "dddd, D MMMM YYYY",
                      )}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
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
                    <span className="font-medium">
                      {dayjs(selectedAppointment.start_time).format("HH:mm")} –{" "}
                      {dayjs(selectedAppointment.end_time).format("HH:mm")}
                    </span>
                  </div>
                  <div>
                    <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                      {t("admin.appointments.service", "Services")}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedAppointment.services?.map((s) => (
                        <Chip
                          key={s.id}
                          size="sm"
                          variant="flat"
                          className="font-medium"
                        >
                          {lang === "uk" ? s.name_uk : s.name_en}
                        </Chip>
                      ))}
                    </div>
                  </div>
                  {selectedAppointment.notes && (
                    <div>
                      <div className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">
                        {t("admin.scheduler.notes", "Notes")}
                      </div>
                      <p className="text-gray-600 text-sm">
                        {selectedAppointment.notes}
                      </p>
                    </div>
                  )}
                </div>
              </ModalBody>
              <ModalFooter>
                <div className="flex gap-2 w-full justify-between">
                  <Button
                    variant="flat"
                    onPress={() => {
                      onClose();
                      navigate("/admin/appointments", {
                        state: { editId: selectedAppointment.id },
                      });
                    }}
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    }
                  >
                    {t("admin.appointments.editTitle", "Edit")}
                  </Button>
                  <div className="flex gap-2">
                    {selectedAppointment.status === "pending" && (
                      <>
                        <Button
                          color="success"
                          variant="flat"
                          onPress={() =>
                            handleStatus(selectedAppointment.id, "confirmed")
                          }
                          isLoading={updateStatusMutation.isPending}
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
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          }
                        >
                          {t("admin.appointments.confirmTitle", "Confirm")}
                        </Button>
                        <Button
                          color="danger"
                          variant="flat"
                          onPress={() =>
                            handleStatus(selectedAppointment.id, "cancelled")
                          }
                          isLoading={updateStatusMutation.isPending}
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
                                strokeWidth={2.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          }
                        >
                          {t("admin.appointments.cancelTitle", "Cancel")}
                        </Button>
                      </>
                    )}
                    {selectedAppointment.status === "confirmed" && (
                      <Button
                        color="primary"
                        variant="flat"
                        onPress={() =>
                          handleStatus(selectedAppointment.id, "completed")
                        }
                        isLoading={updateStatusMutation.isPending}
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
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        }
                      >
                        {t("admin.appointments.completeTitle", "Complete")}
                      </Button>
                    )}
                    <Button variant="light" onPress={onClose}>
                      {t("admin.services.cancel", "Close")}
                    </Button>
                  </div>
                </div>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
