import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import {
  Card,
  CardBody,
  CardHeader,
  Chip,
  Spinner,
  Divider,
  Button,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import { adminGetDashboard, adminUpdateAppointment } from "../../api/api";

const StatCard = ({
  icon,
  label,
  value,
  colorClass = "text-fresha-dark bg-gray-100",
}) => (
  <Card className="border-none shadow-sm">
    <CardBody className="p-5 flex flex-row items-center gap-4">
      <div
        className={`w-14 h-14 rounded-2xl flex items-center justify-center ${colorClass}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-3xl font-bold text-fresha-dark leading-tight">
          {value}
        </p>
        <p className="text-sm font-medium text-gray-500 mt-1">{label}</p>
      </div>
    </CardBody>
  </Card>
);

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: async () => {
      const res = await adminGetDashboard();
      return res.data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => adminUpdateAppointment(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
      queryClient.invalidateQueries({ queryKey: ["adminAppointments"] });
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

  const handleStatus = (id, status) => {
    updateStatusMutation.mutate({ id, status });
  };

  const handleEdit = (apt) => {
    navigate("/admin/appointments", { state: { editId: apt.id } });
  };

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" color="default" />
      </div>
    );
  if (isError || !data)
    return (
      <div className="text-center text-red-500 py-10 font-medium">
        {t("admin.dashboard.error", "Error loading dashboard")}
      </div>
    );

  const statusColors = {
    pending: "warning",
    confirmed: "success",
    cancelled: "danger",
    completed: "primary",
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.dashboard.title", "Dashboard")}
        </h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
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
          }
          label={t("admin.dashboard.todayAppointments", "Today's Appointments")}
          value={data.today_count}
          colorClass="text-blue-600 bg-blue-50"
        />
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
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
          }
          label={t("admin.dashboard.weekAppointments", "This Week")}
          value={data.week_count}
          colorClass="text-indigo-600 bg-indigo-50"
        />
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
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
          }
          label={t("admin.dashboard.monthAppointments", "This Month")}
          value={data.month_count}
          colorClass="text-purple-600 bg-purple-50"
        />
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          label={t("admin.dashboard.weekRevenue", "Weekly Revenue")}
          value={`₴${Number(data.week_revenue || 0).toFixed(0)}`}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
          label={t("admin.dashboard.monthRevenue", "Monthly Revenue")}
          value={`₴${Number(data.month_revenue || 0).toFixed(0)}`}
          colorClass="text-emerald-600 bg-emerald-50"
        />
        <StatCard
          icon={
            <svg
              className="w-7 h-7"
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
          }
          label={t("admin.dashboard.pending", "Pending Action")}
          value={data.pending_count}
          colorClass="text-orange-600 bg-orange-50"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Appointments Block */}
        {data.pending_appointments?.length > 0 && (
          <Card className="border-none shadow-sm col-span-full">
            <CardHeader className="px-6 py-5 border-b border-gray-100 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
                <h2 className="text-xl font-bold text-fresha-dark">
                  {t("admin.dashboard.pending", "Pending Action")}
                </h2>
                <Chip
                  size="sm"
                  color="warning"
                  variant="flat"
                  className="font-bold ml-1"
                >
                  {data.pending_appointments.length}
                </Chip>
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <div className="flex flex-col">
                {data.pending_appointments.map((apt, idx) => (
                  <div key={apt.id}>
                    <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-fresha-dark">
                          {apt.client_name}
                        </p>
                        <p className="text-sm text-gray-500 mt-1 truncate">
                          {apt.services
                            ?.map((s) =>
                              lang === "uk" ? s.name_uk : s.name_en,
                            )
                            .join(", ")}{" "}
                          • {apt.client_phone}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        <div className="text-right">
                          <p className="font-bold text-fresha-dark">
                            {dayjs(apt.start_time).format("HH:mm")}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {dayjs(apt.start_time).format("DD MMM")}
                          </p>
                        </div>
                        <Chip
                          color={statusColors[apt.status] || "default"}
                          variant="flat"
                          size="sm"
                          className="font-semibold uppercase tracking-wider text-[10px]"
                        >
                          {t(
                            `admin.appointments.statuses.${apt.status}`,
                            apt.status,
                          )}
                        </Chip>
                        <div className="flex gap-1">
                          <Button
                            isIconOnly
                            size="sm"
                            variant="flat"
                            onPress={() => handleEdit(apt)}
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
                        </div>
                      </div>
                    </div>
                    {idx < data.pending_appointments.length - 1 && (
                      <Divider className="mx-6" />
                    )}
                  </div>
                ))}
              </div>
            </CardBody>
          </Card>
        )}
      </div>

      <Card className="border-none shadow-sm mt-8">
        <CardHeader className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-fresha-dark">
            {t("admin.dashboard.upcoming", "Upcoming Appointments")}
          </h2>
        </CardHeader>
        <CardBody className="p-0">
          {data.upcoming_appointments?.length === 0 ? (
            <div className="py-10 text-center text-gray-500 font-medium">
              {t("admin.dashboard.noUpcoming", "No upcoming appointments")}
            </div>
          ) : (
            <div className="flex flex-col">
              {data.upcoming_appointments?.map((apt, idx) => (
                <div key={apt.id}>
                  <div className="px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
                    <div>
                      <p className="font-bold text-fresha-dark">
                        {apt.client_name}
                      </p>
                      <p className="text-sm text-gray-500 mt-1">
                        {apt.services
                          ?.map((s) => (lang === "uk" ? s.name_uk : s.name_en))
                          .join(", ")}{" "}
                        • {apt.client_phone}
                      </p>
                    </div>
                    <div className="flex items-center gap-4">
                      <Chip
                        color={statusColors[apt.status] || "default"}
                        variant="flat"
                        size="sm"
                        className="font-semibold uppercase tracking-wider text-[10px]"
                      >
                        {t(
                          `admin.appointments.statuses.${apt.status}`,
                          apt.status,
                        )}
                      </Chip>
                      <div className="text-right">
                        <p className="font-bold text-fresha-dark">
                          {dayjs(apt.start_time).format("HH:mm")}
                        </p>
                        <p className="text-xs text-gray-500 font-medium">
                          {dayjs(apt.start_time).format("DD MMM")}
                        </p>
                      </div>
                    </div>
                  </div>
                  {idx < data.upcoming_appointments.length - 1 && (
                    <Divider className="mx-6" />
                  )}
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
