import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import _ from "lodash";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Select,
  SelectItem,
  Chip,
  Spinner,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  Checkbox,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import {
  adminGetAppointments,
  adminUpdateAppointment,
  adminCreateAppointment,
  adminDeleteAppointment,
  adminGetServices,
  getAvailableSlots,
  adminGetHolidays,
  adminCreateHoliday,
  adminDeleteHoliday,
} from "../../api/api";

const EMPTY_FORM = {
  client_name: "",
  client_phone: "",
  client_email: "",
  date: dayjs().format("YYYY-MM-DD"),
  time: "10:00",
  end_time: "",
  service_ids: [],
  status: "pending",
  notes: "",
  custom_price: "",
  custom_duration: "",
  is_time_off: false,
};

export default function AdminAppointmentsPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const location = useLocation();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";

  // View: list | cards | calendar
  const [view, setView] = useState("list");
  const [filterDate, setFilterDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");

  // Calendar
  const calendarRef = useRef(null);
  const [calendarDateRange, setCalendarDateRange] = useState(null);
  const [calendarViewType, setCalendarViewType] = useState("timeGridWeek");
  const [calendarTitle, setCalendarTitle] = useState("");
  const SLOT_DURATIONS = ["00:10:00", "00:15:00", "00:30:00", "01:00:00"];
  const SLOT_LABELS = ["10m", "15m", "30m", "1h"];
  const [slotDurationIdx, setSlotDurationIdx] = useState(2); // default 30min

  // Modal
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [formErrors, setFormErrors] = useState([]);
  const [modalMode, setModalMode] = useState("appointment"); // appointment | time_off | holiday
  const [holidayForm, setHolidayForm] = useState({
    date_from: dayjs().format("YYYY-MM-DD"),
    date_to: dayjs().format("YYYY-MM-DD"),
    description: "",
    full_day: true,
    start_time: "09:00",
    end_time: "18:00",
  });

  // Available slots
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  // Queries - list/cards view
  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["adminAppointments", filterDate, filterStatus],
    queryFn: async () => {
      const params = {};
      if (filterDate) params.date = filterDate;
      if (filterStatus) params.status = filterStatus;
      const res = await adminGetAppointments(params);
      return res.data;
    },
    enabled: view !== "calendar",
  });

  // Queries - calendar view
  const { data: calendarAppointments = [] } = useQuery({
    queryKey: [
      "calendarAppointments",
      calendarDateRange?.from,
      calendarDateRange?.to,
    ],
    queryFn: async () => {
      const res = await adminGetAppointments({
        from: calendarDateRange.from,
        to: calendarDateRange.to,
      });
      return res.data;
    },
    enabled: view === "calendar" && !!calendarDateRange,
  });

  // Holidays query
  const { data: holidays = [] } = useQuery({
    queryKey: ["adminHolidays"],
    queryFn: async () => {
      const res = await adminGetHolidays();
      return res.data;
    },
  });

  // Map appointments to FullCalendar events
  const calendarEvents = useMemo(() => {
    const aptEvents = calendarAppointments.map((apt) => {
      const services = apt.services
        ?.map((s) => (lang === "uk" ? s.name_uk : s.name_en))
        .join(", ");
      if (apt.is_time_off) {
        return {
          id: String(apt.id),
          title: apt.client_name,
          start: apt.start_time,
          end: apt.end_time,
          backgroundColor: "#fef2f2",
          borderColor: "#f87171",
          textColor: "#b91c1c",
          editable: false,
          extendedProps: { appointment: apt, isTimeOff: true },
          classNames: ["fc-holiday-event"],
        };
      }
      return {
        id: String(apt.id),
        title: apt.client_name,
        start: apt.start_time,
        end: apt.end_time,
        extendedProps: { appointment: apt, services },
        backgroundColor:
          {
            pending: "#fef3c7",
            confirmed: "#d1fae5",
            cancelled: "#fee2e2",
            completed: "#dbeafe",
          }[apt.status] || "#f3f4f6",
        borderColor:
          {
            pending: "#f59e0b",
            confirmed: "#10b981",
            cancelled: "#ef4444",
            completed: "#3b82f6",
          }[apt.status] || "#d1d5db",
        textColor: "#1f2937",
      };
    });
    const holidayEvents = holidays.map((h) => {
      const isFullDay = !h.start_time && !h.end_time;
      const title = h.description || t("admin.holidays.holiday", "Holiday");
      if (isFullDay) {
        return {
          id: `holiday-${h.id}`,
          title,
          start: h.date,
          allDay: true,
          backgroundColor: "#fef2f2",
          borderColor: "#f87171",
          textColor: "#b91c1c",
          editable: false,
          extendedProps: { isHoliday: true, holiday: h },
          classNames: ["fc-holiday-event"],
        };
      }
      return {
        id: `holiday-${h.id}`,
        title,
        start: `${h.date}T${h.start_time}`,
        end: `${h.date}T${h.end_time}`,
        backgroundColor: "#fef2f2",
        borderColor: "#f87171",
        textColor: "#b91c1c",
        editable: false,
        extendedProps: { isHoliday: true, holiday: h },
        classNames: ["fc-holiday-event"],
      };
    });
    return [...aptEvents, ...holidayEvents];
  }, [calendarAppointments, holidays, lang, t]);

  const { data: allServices = [] } = useQuery({
    queryKey: ["adminServices"],
    queryFn: async () => {
      const res = await adminGetServices();
      return res.data;
    },
  });

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
    queryClient.invalidateQueries({ queryKey: ["calendarAppointments"] });
    queryClient.invalidateQueries({ queryKey: ["adminHolidays"] });
  };

  // Auto-open edit modal when navigated from elsewhere
  useEffect(() => {
    const editId = location.state?.editId;
    if (editId && appointments.length > 0) {
      const apt = appointments.find((a) => a.id === editId);
      if (apt) openEditModal(apt);
      window.history.replaceState({}, "");
    }
  }, [location.state, appointments]);

  // Fetch available slots when date or services change in modal
  useEffect(() => {
    if (!isOpen) return;
    if (!formData.date || formData.service_ids.length === 0) {
      setAvailableSlots([]);
      return;
    }
    const fetchSlots = async () => {
      setSlotsLoading(true);
      try {
        const res = await getAvailableSlots(
          formData.service_ids.join(","),
          formData.date,
        );
        setAvailableSlots(res.data.slots || []);
      } catch {
        setAvailableSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    };
    fetchSlots();
  }, [isOpen, formData.date, formData.service_ids.join(",")]);

  // Mutations
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUpdateAppointment(id, { status }),
    onSuccess: invalidateAll,
  });

  const saveMutation = useMutation({
    mutationFn: (data) => {
      const payload = {
        client_name: data.client_name,
        start_time: `${data.date}T${data.time}:00`,
        status: data.status,
        notes: data.notes || null,
        is_time_off: data.is_time_off || false,
      };
      if (data.is_time_off) {
        // Time-off: always confirmed, end_time required
        payload.status = "confirmed";
        payload.end_time = `${data.date}T${data.end_time}:00`;
      } else {
        payload.client_phone = data.client_phone;
        payload.client_email = data.client_email || null;
        payload.service_ids = data.service_ids;
        payload.custom_price = data.custom_price || null;
        payload.custom_duration = data.custom_duration || null;
        if (data.custom_duration) {
          payload.end_time = dayjs(`${data.date}T${data.time}`)
            .add(Number(data.custom_duration), "minute")
            .toISOString();
        }
      }
      if (editingId) {
        return adminUpdateAppointment(editingId, payload);
      }
      return adminCreateAppointment(payload);
    },
    onSuccess: () => {
      invalidateAll();
      handleCloseModal();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors || [
        t("common.error", "Something went wrong"),
      ];
      setFormErrors(errors);
      addToast({
        title: t("common.error", "Error"),
        description: errors.join(", "),
        color: "danger",
        timeout: 4000,
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminDeleteAppointment(id),
    onSuccess: () => {
      invalidateAll();
      handleCloseModal();
    },
  });

  const handleStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const statusColors = {
    pending: "warning",
    confirmed: "success",
    cancelled: "danger",
    completed: "primary",
  };

  const holidaySaveMutation = useMutation({
    mutationFn: async ({
      date_from,
      date_to,
      description,
      full_day,
      start_time,
      end_time,
    }) => {
      const start = dayjs(date_from);
      const end = dayjs(date_to);
      const days = end.diff(start, "day") + 1;
      for (let i = 0; i < days; i++) {
        const payload = {
          date: start.add(i, "day").format("YYYY-MM-DD"),
          description,
        };
        if (!full_day) {
          payload.start_time = start_time;
          payload.end_time = end_time;
        }
        await adminCreateHoliday(payload);
      }
    },
    onSuccess: () => {
      invalidateAll();
      handleCloseModal();
    },
    onError: (err) => {
      const errors = err.response?.data?.errors || [
        t("common.error", "Something went wrong"),
      ];
      setFormErrors(errors);
      addToast({
        title: t("common.error", "Error"),
        description: errors.join(", "),
        color: "danger",
        timeout: 4000,
      });
    },
  });

  const holidayDeleteMutation = useMutation({
    mutationFn: (id) => adminDeleteHoliday(id),
    onSuccess: () => {
      invalidateAll();
      handleCloseModal();
    },
  });

  const openCreateModal = (prefillDate, prefillTime, mode = "appointment") => {
    setEditingId(null);
    setModalMode(mode);
    if (mode === "time_off") {
      setFormData({
        ...EMPTY_FORM,
        client_name: t(
          "admin.appointments.timeOffDefaultName",
          "Неробочий час",
        ),
        date: prefillDate || dayjs().format("YYYY-MM-DD"),
        time: prefillTime || "09:00",
        end_time: prefillTime
          ? dayjs(`2000-01-01T${prefillTime}`).add(1, "hour").format("HH:mm")
          : "18:00",
        is_time_off: true,
        status: "confirmed",
      });
    } else {
      setFormData({
        ...EMPTY_FORM,
        date: prefillDate || dayjs().format("YYYY-MM-DD"),
        time: prefillTime || "10:00",
      });
    }
    setHolidayForm({
      date_from: prefillDate || dayjs().format("YYYY-MM-DD"),
      date_to: prefillDate || dayjs().format("YYYY-MM-DD"),
      description: "",
      full_day: true,
      start_time: prefillTime || "09:00",
      end_time: "18:00",
    });
    setFormErrors([]);
    setAvailableSlots([]);
    onOpen();
  };

  const openEditModal = (apt) => {
    setEditingId(apt.id);
    setModalMode(apt.is_time_off ? "time_off" : "appointment");
    setFormData({
      client_name: apt.client_name || "",
      client_phone: apt.client_phone || "",
      client_email: apt.client_email || "",
      date: dayjs(apt.start_time).format("YYYY-MM-DD"),
      time: dayjs(apt.start_time).format("HH:mm"),
      end_time: dayjs(apt.end_time).format("HH:mm"),
      service_ids: apt.services?.map((s) => String(s.id)) || [],
      status: apt.status || "pending",
      notes: apt.notes || "",
      custom_price: apt.custom_price ?? "",
      custom_duration: apt.custom_duration ?? "",
      is_time_off: apt.is_time_off || false,
    });
    setFormErrors([]);
    setAvailableSlots([]);
    onOpen();
  };

  const handleCloseModal = () => {
    setEditingId(null);
    setModalMode("appointment");
    setFormData(EMPTY_FORM);
    setHolidayForm({
      date_from: dayjs().format("YYYY-MM-DD"),
      date_to: dayjs().format("YYYY-MM-DD"),
      description: "",
      full_day: true,
      start_time: "09:00",
      end_time: "18:00",
    });
    setFormErrors([]);
    setAvailableSlots([]);
    onClose();
  };

  const handleSave = () => {
    setFormErrors([]);
    saveMutation.mutate(formData);
  };

  const handleDelete = () => {
    if (
      editingId &&
      confirm(
        t(
          "admin.appointments.deleteConfirm",
          "Are you sure you want to delete this appointment?",
        ),
      )
    ) {
      deleteMutation.mutate(editingId);
    }
  };

  const toggleService = (serviceId) => {
    const id = String(serviceId);
    setFormData((prev) => ({
      ...prev,
      service_ids: prev.service_ids.includes(id)
        ? prev.service_ids.filter((s) => s !== id)
        : [...prev.service_ids, id],
    }));
  };

  // Computed totals
  const selectedServices = allServices.filter((s) =>
    formData.service_ids.includes(String(s.id)),
  );
  const calculatedPrice = selectedServices.reduce(
    (sum, s) => sum + Number(s.price),
    0,
  );
  const calculatedDuration = selectedServices.reduce(
    (sum, s) => sum + s.duration_minutes,
    0,
  );

  // Group appointments by date for cards view
  const groupedByDate = _.groupBy(appointments, (apt) =>
    dayjs(apt.start_time).format("YYYY-MM-DD"),
  );

  // FullCalendar callbacks
  const handleDatesSet = useCallback((info) => {
    setCalendarDateRange({
      from: dayjs(info.start).format("YYYY-MM-DD"),
      to: dayjs(info.end).format("YYYY-MM-DD"),
    });
    setCalendarViewType(info.view.type);
    setCalendarTitle(info.view.title);
  }, []);

  const handleDateClick = useCallback((info) => {
    if (dayjs(info.date).isBefore(dayjs(), "minute")) return;
    const time =
      info.date.getHours() > 0
        ? `${String(info.date.getHours()).padStart(2, "0")}:${String(info.date.getMinutes()).padStart(2, "0")}`
        : "10:00";
    openCreateModal(dayjs(info.date).format("YYYY-MM-DD"), time);
  }, []);

  const handleSelect = useCallback((info) => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) calendarApi.unselect();
    if (dayjs(info.start).isBefore(dayjs(), "minute")) return;
    const time = `${String(info.start.getHours()).padStart(2, "0")}:${String(info.start.getMinutes()).padStart(2, "0")}`;
    openCreateModal(dayjs(info.start).format("YYYY-MM-DD"), time);
  }, []);

  const handleEventDrop = useCallback((info) => {
    if (info.event.extendedProps.isHoliday) {
      info.revert();
      return;
    }
    const apt = info.event.extendedProps.appointment;
    if (!apt) return;
    if (dayjs(info.event.start).isBefore(dayjs(), "minute")) {
      info.revert();
      return;
    }
    const payload = {
      start_time: info.event.start.toISOString(),
      end_time: info.event.end.toISOString(),
    };
    adminUpdateAppointment(apt.id, payload)
      .then(invalidateAll)
      .catch(() => info.revert());
  }, []);

  const handleEventResize = useCallback((info) => {
    const apt = info.event.extendedProps.appointment;
    if (!apt) return;
    const payload = {
      start_time: info.event.start.toISOString(),
      end_time: info.event.end.toISOString(),
    };
    adminUpdateAppointment(apt.id, payload)
      .then(invalidateAll)
      .catch(() => info.revert());
  }, []);

  const calendarNavigate = (action) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    if (action === "prev") calendarApi.prev();
    else if (action === "next") calendarApi.next();
    else if (action === "today") calendarApi.today();
  };

  const calendarChangeView = (viewName) => {
    const calendarApi = calendarRef.current?.getApi();
    if (!calendarApi) return;
    calendarApi.changeView(viewName);
    setCalendarViewType(viewName);
  };

  const handleEventClick = useCallback(
    (info) => {
      const holiday = info.event.extendedProps.holiday;
      if (holiday) {
        if (
          confirm(t("admin.holidays.deleteConfirm", "Delete this holiday?"))
        ) {
          holidayDeleteMutation.mutate(holiday.id);
        }
        return;
      }
      const apt = info.event.extendedProps.appointment;
      if (apt) openEditModal(apt);
    },
    [t],
  );

  const selectAllow = useCallback((selectInfo) => {
    return !dayjs(selectInfo.start).isBefore(dayjs(), "minute");
  }, []);

  const renderEventContent = useCallback((eventInfo) => {
    if (
      eventInfo.event.extendedProps.isHoliday ||
      eventInfo.event.extendedProps.isTimeOff
    ) {
      return (
        <div className="px-2 py-1 text-xs h-full flex items-start gap-1.5">
          <svg
            className="w-3.5 h-3.5 mt-0.5 shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
            />
          </svg>
          <span className="font-semibold truncate">
            {eventInfo.event.title}
          </span>
        </div>
      );
    }
    const apt = eventInfo.event.extendedProps.appointment;
    const services = eventInfo.event.extendedProps.services;
    const isMonth = eventInfo.view.type === "dayGridMonth";

    if (isMonth) {
      return (
        <div className="px-1 py-0.5 text-[10px] truncate leading-tight">
          <span className="font-bold">{eventInfo.timeText}</span>{" "}
          <span>{apt.client_name}</span>
        </div>
      );
    }

    return (
      <div className="px-1.5 py-1 text-xs overflow-hidden h-full">
        <div className="font-bold text-gray-800 truncate">
          {eventInfo.timeText}
        </div>
        <div className="text-gray-700 truncate">{apt.client_name}</div>
        {services && (
          <div className="text-gray-500 truncate text-[10px]">{services}</div>
        )}
      </div>
    );
  }, []);

  // View icons
  const viewButtons = [
    {
      key: "list",
      icon: (
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
            d="M4 6h16M4 12h16M4 18h16"
          />
        </svg>
      ),
      label: t("admin.appointments.viewList", "List"),
    },
    {
      key: "cards",
      icon: (
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
            d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
          />
        </svg>
      ),
      label: t("admin.appointments.viewCards", "Cards"),
    },
    {
      key: "calendar",
      icon: (
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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      label: t("admin.appointments.viewCalendar", "Calendar"),
    },
  ];

  return (
    <div className="space-y-4 animate-in fade-in duration-500 h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.appointments.title", "Appointments")}
        </h1>

        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          <Button
            color="primary"
            size="sm"
            className="bg-fresha-dark font-bold"
            onPress={() => openCreateModal()}
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
            }
          >
            {t("admin.appointments.add", "Add Appointment")}
          </Button>

          {/* Filters (only for list/cards) */}
          {view !== "calendar" && (
            <>
              <Input
                type="date"
                placeholder={t("admin.appointments.date", "Date")}
                value={filterDate}
                onValueChange={setFilterDate}
                classNames={{
                  inputWrapper: "bg-white border hover:border-fresha-dark",
                }}
                className="w-full sm:w-40"
                size="sm"
              />
              <Select
                placeholder={t("admin.appointments.status", "Status")}
                selectedKeys={filterStatus ? [filterStatus] : []}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full sm:w-40"
                size="sm"
                classNames={{
                  trigger:
                    "bg-white border shadow-none hover:border-fresha-dark",
                }}
              >
                <SelectItem key="" value="">
                  {t("admin.appointments.allStatuses", "All Statuses")}
                </SelectItem>
                <SelectItem key="pending" value="pending">
                  {t("admin.appointments.statuses.pending", "Pending")}
                </SelectItem>
                <SelectItem key="confirmed" value="confirmed">
                  {t("admin.appointments.statuses.confirmed", "Confirmed")}
                </SelectItem>
                <SelectItem key="cancelled" value="cancelled">
                  {t("admin.appointments.statuses.cancelled", "Cancelled")}
                </SelectItem>
                <SelectItem key="completed" value="completed">
                  {t("admin.appointments.statuses.completed", "Completed")}
                </SelectItem>
              </Select>
            </>
          )}

          {/* View toggle */}
          <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
            {viewButtons.map((v) => (
              <button
                key={v.key}
                onClick={() => setView(v.key)}
                title={v.label}
                className={`p-1.5 rounded-md transition-colors ${view === v.key ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
              >
                {v.icon}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* LIST VIEW */}
      {view === "list" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1">
          <Table
            aria-label="Appointments table"
            shadow="none"
            classNames={{
              th: "bg-gray-50 text-gray-500 uppercase font-bold tracking-wider text-xs px-6 py-4 border-b border-gray-100",
              td: "px-6 py-4 border-b border-gray-50 align-middle",
              tr: "hover:bg-gray-50/50 transition-colors cursor-pointer",
            }}
          >
            <TableHeader>
              <TableColumn>
                {t("admin.appointments.client", "Client")}
              </TableColumn>
              <TableColumn>
                {t("admin.appointments.phone", "Phone")}
              </TableColumn>
              <TableColumn>
                {t("admin.appointments.service", "Service")}
              </TableColumn>
              <TableColumn>{t("admin.appointments.date", "Date")}</TableColumn>
              <TableColumn>
                {t("admin.appointments.totalPrice", "Price")}
              </TableColumn>
              <TableColumn>
                {t("admin.appointments.status", "Status")}
              </TableColumn>
              <TableColumn align="center">
                {t("admin.appointments.actions", "Actions")}
              </TableColumn>
            </TableHeader>
            <TableBody
              items={appointments}
              isLoading={isLoading}
              emptyContent={t(
                "admin.appointments.noAppointments",
                "No appointments found.",
              )}
            >
              {(apt) => (
                <TableRow
                  key={apt.id}
                  onClick={() => openEditModal(apt)}
                  className={apt.is_time_off ? "!bg-red-50/50" : ""}
                >
                  <TableCell className="font-bold text-fresha-dark">
                    {apt.is_time_off && (
                      <svg
                        className="w-3.5 h-3.5 inline-block mr-1.5 text-red-400 -mt-0.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                        />
                      </svg>
                    )}
                    {apt.client_name}
                  </TableCell>
                  <TableCell className="text-gray-600 font-medium">
                    {apt.is_time_off ? "—" : apt.client_phone}
                  </TableCell>
                  <TableCell className="text-gray-800">
                    {apt.is_time_off ? (
                      <span className="text-gray-400 italic">
                        {t("admin.appointments.timeOff", "Time off")}
                      </span>
                    ) : (
                      apt.services
                        ?.map((s) => (lang === "uk" ? s.name_uk : s.name_en))
                        .join(", ")
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {dayjs(apt.start_time).format("DD.MM.YYYY")}
                    </div>
                    <div className="text-xs text-gray-400">
                      {dayjs(apt.start_time).format("HH:mm")} -{" "}
                      {dayjs(apt.end_time).format("HH:mm")}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {!apt.is_time_off
                      ? (() => {
                          const price =
                            apt.custom_price ||
                            apt.services?.reduce(
                              (s, sv) => s + Number(sv.price),
                              0,
                            );
                          const dur =
                            apt.custom_duration ||
                            apt.services?.reduce(
                              (s, sv) => s + sv.duration_minutes,
                              0,
                            );
                          return (
                            <>
                              {price ? (
                                <div className="font-medium text-gray-800">
                                  {price} ₴
                                </div>
                              ) : null}
                              {dur ? (
                                <div className="text-xs text-gray-400">
                                  {dur} {t("services.durationSuffix", "min")}
                                </div>
                              ) : null}
                            </>
                          );
                        })()
                      : (() => {
                          const mins = dayjs(apt.end_time).diff(
                            dayjs(apt.start_time),
                            "minute",
                          );
                          return mins ? (
                            <div className="text-xs text-gray-400">
                              {mins} {t("services.durationSuffix", "min")}
                            </div>
                          ) : (
                            "—"
                          );
                        })()}
                  </TableCell>
                  <TableCell>
                    {apt.is_time_off ? (
                      <Chip
                        size="sm"
                        color="danger"
                        variant="flat"
                        className="font-bold uppercase tracking-wider text-[10px]"
                      >
                        {t("admin.appointments.timeOff", "Time off")}
                      </Chip>
                    ) : (
                      <Chip
                        size="sm"
                        color={statusColors[apt.status] || "default"}
                        variant="flat"
                        className="font-bold uppercase tracking-wider text-[10px]"
                      >
                        {t(
                          `admin.appointments.statuses.${apt.status}`,
                          apt.status,
                        )}
                      </Chip>
                    )}
                  </TableCell>
                  <TableCell>
                    <div
                      className="flex gap-2 justify-end"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        isIconOnly
                        size="sm"
                        variant="flat"
                        onPress={() => openEditModal(apt)}
                        title={t("admin.appointments.editTitle", "Edit")}
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
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </Button>
                      {!apt.is_time_off && apt.status === "pending" && (
                        <>
                          <Button
                            isIconOnly
                            size="sm"
                            color="success"
                            variant="flat"
                            onPress={() => handleStatus(apt.id, "confirmed")}
                            title={t(
                              "admin.appointments.confirmTitle",
                              "Confirm",
                            )}
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
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </Button>
                          <Button
                            isIconOnly
                            size="sm"
                            color="danger"
                            variant="flat"
                            onPress={() => handleStatus(apt.id, "cancelled")}
                            title={t(
                              "admin.appointments.cancelTitle",
                              "Cancel",
                            )}
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
                                strokeWidth={2.5}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            </svg>
                          </Button>
                        </>
                      )}
                      {!apt.is_time_off && apt.status === "confirmed" && (
                        <Button
                          isIconOnly
                          size="sm"
                          color="primary"
                          variant="flat"
                          onPress={() => handleStatus(apt.id, "completed")}
                          title={t(
                            "admin.appointments.completeTitle",
                            "Complete",
                          )}
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
                              strokeWidth={2.5}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* CARDS VIEW */}
      {view === "cards" && (
        <div className="space-y-6 flex-1">
          {isLoading && (
            <div className="flex justify-center py-10">
              <Spinner size="lg" />
            </div>
          )}
          {!isLoading && Object.keys(groupedByDate).length === 0 && (
            <div className="text-center py-10 text-gray-500 bg-white rounded-xl border border-gray-100">
              {t("admin.appointments.noAppointments", "No appointments found.")}
            </div>
          )}
          {Object.entries(groupedByDate)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, apts]) => (
              <div
                key={date}
                className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100"
              >
                <h3 className="font-bold text-lg text-fresha-dark mb-4 pb-2 border-b border-gray-100">
                  {dayjs(date).format("dddd, DD MMMM YYYY")}
                </h3>
                <div className="space-y-3">
                  {apts.map((apt) => (
                    <div
                      key={apt.id}
                      onClick={() => openEditModal(apt)}
                      className={`flex justify-between items-center p-3 rounded-xl border transition-colors cursor-pointer ${apt.is_time_off ? "bg-red-50/50 border-red-100 hover:bg-red-50" : "bg-gray-50/50 border-gray-100 hover:bg-gray-50"}`}
                    >
                      <div>
                        <p className="font-bold text-fresha-dark text-md">
                          {dayjs(apt.start_time).format("HH:mm")} -{" "}
                          {dayjs(apt.end_time).format("HH:mm")}
                        </p>
                        <p className="text-sm font-medium text-gray-600 mt-0.5">
                          {apt.is_time_off && (
                            <svg
                              className="w-3.5 h-3.5 inline-block mr-1 text-red-400 -mt-0.5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
                              />
                            </svg>
                          )}
                          <span className="text-fresha-dark">
                            {apt.client_name}
                          </span>
                          {!apt.is_time_off && apt.services?.length > 0 && (
                            <>
                              <span className="text-gray-400 mx-1">•</span>
                              {apt.services
                                ?.map((s) =>
                                  lang === "uk" ? s.name_uk : s.name_en,
                                )
                                .join(", ")}
                            </>
                          )}
                        </p>
                        {!apt.is_time_off &&
                          (() => {
                            const dur =
                              apt.custom_duration ||
                              apt.services?.reduce(
                                (s, sv) => s + sv.duration_minutes,
                                0,
                              );
                            const price =
                              apt.custom_price ||
                              apt.services?.reduce(
                                (s, sv) => s + Number(sv.price),
                                0,
                              );
                            return dur || price ? (
                              <p className="text-xs text-gray-400 mt-0.5">
                                {dur ? (
                                  <>
                                    {dur} {t("services.durationSuffix", "min")}
                                  </>
                                ) : null}
                                {dur && price ? (
                                  <span className="mx-1">•</span>
                                ) : null}
                                {price ? <>{price} ₴</> : null}
                              </p>
                            ) : null;
                          })()}
                      </div>
                      {apt.is_time_off ? (
                        <Chip
                          size="sm"
                          color="danger"
                          variant="flat"
                          className="font-bold uppercase tracking-wider text-[10px]"
                        >
                          {t("admin.appointments.timeOff", "Time off")}
                        </Chip>
                      ) : (
                        <Chip
                          size="sm"
                          color={statusColors[apt.status] || "default"}
                          variant="flat"
                          className="font-bold uppercase tracking-wider text-[10px]"
                        >
                          {t(
                            `admin.appointments.statuses.${apt.status}`,
                            apt.status,
                          )}
                        </Chip>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}

      {/* CALENDAR VIEW */}
      {view === "calendar" && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex-1 p-4 fc-admin">
          {/* Custom toolbar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
            {/* Navigation */}
            <div className="flex items-center gap-2">
              <div className="flex">
                <button
                  onClick={() => calendarNavigate("prev")}
                  className="p-1.5 rounded-l-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
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
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() => calendarNavigate("next")}
                  className="p-1.5 rounded-r-lg border border-l-0 border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors"
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
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </div>
              <button
                onClick={() => calendarNavigate("today")}
                className="px-3 py-1.5 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {t("admin.scheduler.today", "Today")}
              </button>
              <h2 className="text-lg font-bold text-fresha-dark ml-2">
                {calendarTitle}
              </h2>
            </div>

            {/* Zoom */}
            {calendarViewType !== "dayGridMonth" && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() =>
                    setSlotDurationIdx((i) =>
                      Math.min(i + 1, SLOT_DURATIONS.length - 1),
                    )
                  }
                  disabled={slotDurationIdx >= SLOT_DURATIONS.length - 1}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={t("admin.scheduler.zoomOut", "Zoom out")}
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
                      d="M20 12H4"
                    />
                  </svg>
                </button>
                <span className="text-xs font-semibold text-gray-500 w-8 text-center">
                  {SLOT_LABELS[slotDurationIdx]}
                </span>
                <button
                  onClick={() => setSlotDurationIdx((i) => Math.max(i - 1, 0))}
                  disabled={slotDurationIdx <= 0}
                  className="p-1.5 rounded-lg border border-gray-200 bg-white text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={t("admin.scheduler.zoomIn", "Zoom in")}
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                </button>
              </div>
            )}

            {/* Period toggle */}
            <div className="bg-white border border-gray-200 rounded-lg p-1 flex">
              {[
                { key: "timeGridDay", label: t("admin.scheduler.day", "Day") },
                {
                  key: "timeGridWeek",
                  label: t("admin.scheduler.week", "Week"),
                },
                {
                  key: "dayGridMonth",
                  label: t("admin.scheduler.month", "Month"),
                },
              ].map((v) => (
                <button
                  key={v.key}
                  onClick={() => calendarChangeView(v.key)}
                  className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${calendarViewType === v.key ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {v.label}
                </button>
              ))}
            </div>
          </div>

          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={false}
            locale={lang}
            firstDay={1}
            slotDuration={SLOT_DURATIONS[slotDurationIdx]}
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            allDaySlot={true}
            height="calc(100vh - 280px)"
            selectable
            selectAllow={selectAllow}
            editable
            eventResizableFromStart
            eventDisplay="block"
            events={calendarEvents}
            datesSet={handleDatesSet}
            dateClick={handleDateClick}
            select={handleSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventResize}
            eventContent={renderEventContent}
            nowIndicator
            dayMaxEvents={3}
          />
        </div>
      )}

      {/* Create / Edit Modal */}
      <Modal
        isOpen={isOpen}
        onClose={handleCloseModal}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          <ModalHeader>
            <span className="text-xl font-bold text-fresha-dark">
              {editingId
                ? modalMode === "time_off"
                  ? t("admin.appointments.editTimeOff", "Edit Time Off")
                  : t("admin.appointments.editAppointment", "Edit Appointment")
                : modalMode === "holiday"
                  ? t("admin.holidays.addHoliday", "Add Holiday")
                  : modalMode === "time_off"
                    ? t("admin.appointments.addTimeOff", "Add Time Off")
                    : t("admin.appointments.add", "Add Appointment")}
            </span>
          </ModalHeader>
          <ModalBody>
            {formErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-2">
                {formErrors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600">
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* Mode toggle (only when creating) */}
            {!editingId && (
              <div className="bg-white border border-gray-200 rounded-lg p-1 flex mb-4">
                <button
                  onClick={() => setModalMode("appointment")}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${modalMode === "appointment" ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t("admin.appointments.add", "Add Appointment")}
                </button>
                <button
                  onClick={() => {
                    setModalMode("time_off");
                    setFormData((p) => ({
                      ...p,
                      client_name:
                        p.client_name ||
                        t(
                          "admin.appointments.timeOffDefaultName",
                          "Неробочий час",
                        ),
                      is_time_off: true,
                      status: "confirmed",
                      end_time:
                        p.end_time ||
                        dayjs(`2000-01-01T${p.time}`)
                          .add(1, "hour")
                          .format("HH:mm"),
                    }));
                  }}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${modalMode === "time_off" ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t("admin.appointments.addTimeOff", "Add Time Off")}
                </button>
                <button
                  onClick={() => setModalMode("holiday")}
                  className={`flex-1 px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${modalMode === "holiday" ? "bg-fresha-dark text-white" : "text-gray-500 hover:bg-gray-100"}`}
                >
                  {t("admin.holidays.addHoliday", "Add Holiday")}
                </button>
              </div>
            )}

            {/* HOLIDAY FORM */}
            {modalMode === "holiday" && !editingId && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t("admin.holidays.dateFrom", "From")}
                    value={holidayForm.date_from}
                    onValueChange={(v) =>
                      setHolidayForm((p) => ({ ...p, date_from: v }))
                    }
                    isRequired
                  />
                  <Input
                    type="date"
                    label={t("admin.holidays.dateTo", "To")}
                    value={holidayForm.date_to}
                    onValueChange={(v) =>
                      setHolidayForm((p) => ({ ...p, date_to: v }))
                    }
                    isRequired
                  />
                </div>

                {/* Full day toggle */}
                <div className="flex items-center gap-3">
                  <Checkbox
                    isSelected={holidayForm.full_day}
                    onValueChange={(v) =>
                      setHolidayForm((p) => ({ ...p, full_day: v }))
                    }
                    size="sm"
                  >
                    <span className="text-sm font-medium">
                      {t("admin.holidays.fullDay", "Full day")}
                    </span>
                  </Checkbox>
                </div>

                {/* Time range (only when not full day) */}
                {!holidayForm.full_day && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input
                      type="time"
                      label={t("admin.holidays.startTime", "Start time")}
                      value={holidayForm.start_time}
                      onValueChange={(v) =>
                        setHolidayForm((p) => ({ ...p, start_time: v }))
                      }
                      isRequired
                    />
                    <Input
                      type="time"
                      label={t("admin.holidays.endTime", "End time")}
                      value={holidayForm.end_time}
                      onValueChange={(v) =>
                        setHolidayForm((p) => ({ ...p, end_time: v }))
                      }
                      isRequired
                    />
                  </div>
                )}

                <Input
                  label={t("admin.holidays.description", "Description")}
                  placeholder={t(
                    "admin.holidays.descriptionPlaceholder",
                    "e.g. Vacation, National holiday...",
                  )}
                  value={holidayForm.description}
                  onValueChange={(v) =>
                    setHolidayForm((p) => ({ ...p, description: v }))
                  }
                />
                {holidayForm.date_from &&
                  holidayForm.date_to &&
                  dayjs(holidayForm.date_to).diff(
                    dayjs(holidayForm.date_from),
                    "day",
                  ) >= 0 && (
                    <p className="text-xs text-gray-500">
                      {holidayForm.full_day
                        ? t(
                            "admin.holidays.daysCount",
                            "{{count}} day(s) will be marked as holiday",
                            {
                              count:
                                dayjs(holidayForm.date_to).diff(
                                  dayjs(holidayForm.date_from),
                                  "day",
                                ) + 1,
                            },
                          )
                        : t(
                            "admin.holidays.daysCountTime",
                            "{{count}} day(s), {{from}} — {{to}}",
                            {
                              count:
                                dayjs(holidayForm.date_to).diff(
                                  dayjs(holidayForm.date_from),
                                  "day",
                                ) + 1,
                              from: holidayForm.start_time,
                              to: holidayForm.end_time,
                            },
                          )}
                    </p>
                  )}
              </div>
            )}

            {/* TIME OFF FORM */}
            {modalMode === "time_off" && (
              <div className="space-y-4">
                <Input
                  label={t("admin.appointments.timeOffName", "Title")}
                  placeholder={t(
                    "admin.appointments.timeOffDefaultName",
                    "Неробочий час",
                  )}
                  value={formData.client_name}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, client_name: v }))
                  }
                  isRequired
                />
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Input
                    type="date"
                    label={t("admin.appointments.date", "Date")}
                    value={formData.date}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, date: v }))
                    }
                    isRequired
                  />
                  <Input
                    type="time"
                    label={t("admin.appointments.time", "Time")}
                    value={formData.time}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, time: v }))
                    }
                    isRequired
                  />
                  <Input
                    type="time"
                    label={t("admin.appointments.endTime", "End time")}
                    value={formData.end_time}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, end_time: v }))
                    }
                    isRequired
                  />
                </div>
                <Textarea
                  label={t("admin.appointments.notes", "Notes")}
                  placeholder={t(
                    "booking.notesPlaceholder",
                    "Any special requests?",
                  )}
                  value={formData.notes}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, notes: v }))
                  }
                />
              </div>
            )}

            {/* APPOINTMENT FORM */}
            {modalMode === "appointment" && (
              <div className="space-y-4">
                {/* Client info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label={t("admin.appointments.client", "Client Name")}
                    placeholder={t("booking.namePlaceholder", "John Doe")}
                    value={formData.client_name}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, client_name: v }))
                    }
                    isRequired
                  />
                  <Input
                    label={t("admin.appointments.phone", "Phone")}
                    placeholder={t(
                      "booking.phonePlaceholder",
                      "+380 50 123 4567",
                    )}
                    value={formData.client_phone}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, client_phone: v }))
                    }
                    isRequired
                  />
                </div>
                <Input
                  label={t("admin.appointments.email", "Email")}
                  placeholder={t("booking.emailPlaceholder", "you@example.com")}
                  value={formData.client_email}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, client_email: v }))
                  }
                />

                {/* Services */}
                <div>
                  <p className="text-sm font-bold text-gray-700 mb-2">
                    {t("admin.appointments.services", "Services")}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-3">
                    {allServices.map((s) => (
                      <label
                        key={s.id}
                        className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${formData.service_ids.includes(String(s.id)) ? "bg-fresha-dark/5 border border-fresha-dark/20" : "hover:bg-gray-50 border border-transparent"}`}
                      >
                        <Checkbox
                          isSelected={formData.service_ids.includes(
                            String(s.id),
                          )}
                          onValueChange={() => toggleService(s.id)}
                          size="sm"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800 truncate">
                            {lang === "uk" ? s.name_uk : s.name_en}
                          </p>
                          <p className="text-xs text-gray-500">
                            {s.duration_minutes}{" "}
                            {t("services.durationSuffix", "min")} • {s.price} ₴
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {selectedServices.length > 0 && (
                    <div className="mt-2 flex gap-4 text-xs text-gray-500">
                      <span>
                        {t("admin.appointments.totalDuration", "Duration")}:{" "}
                        <strong>
                          {calculatedDuration}{" "}
                          {t("services.durationSuffix", "min")}
                        </strong>
                      </span>
                      <span>
                        {t("admin.appointments.totalPrice", "Price")}:{" "}
                        <strong>{calculatedPrice} ₴</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Date & Time */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="date"
                    label={t("admin.appointments.date", "Date")}
                    value={formData.date}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, date: v }))
                    }
                    isRequired
                  />
                  <Input
                    type="time"
                    label={t("admin.appointments.time", "Time")}
                    value={formData.time}
                    onValueChange={(v) =>
                      setFormData((p) => ({ ...p, time: v }))
                    }
                    isRequired
                  />
                </div>

                {/* Available Slots */}
                {formData.service_ids.length > 0 && formData.date && (
                  <div>
                    <p className="text-sm font-bold text-gray-700 mb-2">
                      {t(
                        "admin.appointments.availableSlots",
                        "Available Slots",
                      )}
                    </p>
                    {slotsLoading ? (
                      <div className="flex justify-center py-3">
                        <Spinner size="sm" />
                      </div>
                    ) : availableSlots.length > 0 ? (
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-3">
                        {availableSlots.map((slot, i) => {
                          const slotTime = dayjs(slot.start_time).format(
                            "HH:mm",
                          );
                          const isSelected = formData.time === slotTime;
                          return (
                            <button
                              key={i}
                              type="button"
                              onClick={() =>
                                setFormData((p) => ({ ...p, time: slotTime }))
                              }
                              className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${isSelected ? "bg-fresha-dark text-white border-fresha-dark" : "bg-white text-gray-700 border-gray-200 hover:border-fresha-dark hover:bg-fresha-dark/5"}`}
                            >
                              {slotTime}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-400 italic">
                        {t(
                          "booking.noSlots",
                          "No available slots for this date",
                        )}
                      </p>
                    )}
                  </div>
                )}

                {/* Custom overrides */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="number"
                    label={t(
                      "admin.appointments.customDuration",
                      "Custom Duration (min)",
                    )}
                    placeholder={
                      calculatedDuration ? String(calculatedDuration) : ""
                    }
                    value={String(formData.custom_duration ?? "")}
                    onValueChange={(v) =>
                      setFormData((p) => ({
                        ...p,
                        custom_duration: v ? Number(v) : "",
                      }))
                    }
                    description={t(
                      "admin.appointments.customDurationHint",
                      "Leave empty to auto-calculate from services",
                    )}
                  />
                  <Input
                    type="number"
                    label={t(
                      "admin.appointments.customPrice",
                      "Custom Price (₴)",
                    )}
                    placeholder={calculatedPrice ? String(calculatedPrice) : ""}
                    value={String(formData.custom_price ?? "")}
                    onValueChange={(v) =>
                      setFormData((p) => ({
                        ...p,
                        custom_price: v ? Number(v) : "",
                      }))
                    }
                    description={t(
                      "admin.appointments.customPriceHint",
                      "Leave empty for default price",
                    )}
                  />
                </div>

                {/* Status */}
                <Select
                  label={t("admin.appointments.status", "Status")}
                  selectedKeys={[formData.status]}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, status: e.target.value }))
                  }
                >
                  <SelectItem key="pending" value="pending">
                    {t("admin.appointments.statuses.pending", "Pending")}
                  </SelectItem>
                  <SelectItem key="confirmed" value="confirmed">
                    {t("admin.appointments.statuses.confirmed", "Confirmed")}
                  </SelectItem>
                  <SelectItem key="cancelled" value="cancelled">
                    {t("admin.appointments.statuses.cancelled", "Cancelled")}
                  </SelectItem>
                  <SelectItem key="completed" value="completed">
                    {t("admin.appointments.statuses.completed", "Completed")}
                  </SelectItem>
                </Select>

                {/* Notes */}
                <Textarea
                  label={t("admin.appointments.notes", "Notes")}
                  placeholder={t(
                    "booking.notesPlaceholder",
                    "Any special requests?",
                  )}
                  value={formData.notes}
                  onValueChange={(v) =>
                    setFormData((p) => ({ ...p, notes: v }))
                  }
                />
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <div className="flex justify-between w-full">
              <div>
                {editingId &&
                  (modalMode === "appointment" || modalMode === "time_off") && (
                    <Button
                      color="danger"
                      variant="light"
                      onPress={handleDelete}
                      isLoading={deleteMutation.isPending}
                    >
                      {t("admin.appointments.delete", "Delete")}
                    </Button>
                  )}
              </div>
              <div className="flex gap-2">
                <Button variant="light" onPress={handleCloseModal}>
                  {t("admin.services.cancel", "Cancel")}
                </Button>
                <Button
                  color="primary"
                  className="bg-fresha-dark font-bold"
                  onPress={
                    modalMode === "holiday"
                      ? () => holidaySaveMutation.mutate(holidayForm)
                      : handleSave
                  }
                  isLoading={
                    modalMode === "holiday"
                      ? holidaySaveMutation.isPending
                      : saveMutation.isPending
                  }
                >
                  {t("admin.services.save", "Save")}
                </Button>
              </div>
            </div>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
