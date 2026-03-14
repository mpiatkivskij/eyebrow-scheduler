import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Switch,
  Chip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  adminGetServices,
  adminCreateService,
  adminUpdateService,
  adminDeleteService,
} from "../../api/api";

const defaultForm = {
  name_en: "",
  name_uk: "",
  description_en: "",
  description_uk: "",
  price: "",
  duration_minutes: "",
  category: "brows",
  active: true,
};

export default function AdminServicesPage() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();

  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  // Queries
  const { data: services = [], isLoading } = useQuery({
    queryKey: ["adminServices"],
    queryFn: async () => (await adminGetServices()).data,
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: adminCreateService,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminServices"]);
      onClose();
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

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminUpdateService(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminServices"]);
      onClose();
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

  const deleteMutation = useMutation({
    mutationFn: adminDeleteService,
    onSuccess: () => queryClient.invalidateQueries(["adminServices"]),
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

  // Handlers
  const handleOpenModal = (service = null) => {
    if (service) {
      setEditingId(service.id);
      setForm({
        ...service,
        price: String(service.price),
        duration_minutes: String(service.duration_minutes),
      });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    onOpen();
  };

  const handleSave = () => {
    const payload = {
      ...form,
      price: parseFloat(form.price),
      duration_minutes: parseInt(form.duration_minutes, 10),
    };
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const handleDelete = (id) => {
    if (
      window.confirm(
        t(
          "admin.services.deleteConfirm",
          "Are you sure you want to delete this service?",
        ),
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  const categoryColors = {
    brows: "bg-rose-100 text-rose-800",
    eyelids: "bg-indigo-100 text-indigo-800",
    face: "bg-emerald-100 text-emerald-800",
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.services.title", "Services")}
        </h1>
        <Button
          onPress={() => handleOpenModal()}
          className="bg-fresha-dark text-white font-medium"
          startContent={
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
                d="M12 4v16m8-8H4"
              />
            </svg>
          }
        >
          {t("admin.services.add", "Add Service")}
        </Button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <Table
          aria-label="Services table"
          shadow="none"
          classNames={{
            th: "bg-gray-50 text-gray-500 uppercase font-bold tracking-wider text-xs px-6 py-4 border-b border-gray-100",
            td: "px-6 py-4 border-b border-gray-50 align-middle",
            tr: "hover:bg-gray-50/50 transition-colors",
          }}
        >
          <TableHeader>
            <TableColumn>{t("admin.services.nameEn", "Name (EN)")}</TableColumn>
            <TableColumn>{t("admin.services.nameUk", "Name (UK)")}</TableColumn>
            <TableColumn>{t("admin.services.price", "Price")}</TableColumn>
            <TableColumn>
              {t("admin.services.duration", "Duration")}
            </TableColumn>
            <TableColumn>
              {t("admin.services.category", "Category")}
            </TableColumn>
            <TableColumn>{t("admin.services.active", "Status")}</TableColumn>
            <TableColumn align="center">
              {t("admin.appointments.actions", "Actions")}
            </TableColumn>
          </TableHeader>
          <TableBody items={services} isLoading={isLoading}>
            {(item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium text-fresha-dark">
                  {item.name_en}
                </TableCell>
                <TableCell className="text-gray-600">{item.name_uk}</TableCell>
                <TableCell className="font-semibold text-fresha-dark whitespace-nowrap">
                  ₴{Number(item.price).toFixed(0)}
                </TableCell>
                <TableCell className="text-gray-500 whitespace-nowrap">
                  {item.duration_minutes} {t("services.durationSuffix", "min")}
                </TableCell>
                <TableCell>
                  <span
                    className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${categoryColors[item.category] || "bg-gray-100 text-gray-800"}`}
                  >
                    {t(`services.categories.${item.category}`, item.category)}
                  </span>
                </TableCell>
                <TableCell>
                  <Chip
                    size="sm"
                    color={item.active ? "success" : "default"}
                    variant="flat"
                    className="font-semibold"
                  >
                    {item.active
                      ? t("admin.services.activeLabel", "Active")
                      : t("admin.services.inactiveLabel", "Inactive")}
                  </Chip>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2 justify-end">
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleOpenModal(item)}
                      className="text-blue-600 hover:bg-blue-50"
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
                          d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
                        />
                      </svg>
                    </Button>
                    <Button
                      isIconOnly
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(item.id)}
                      className="text-red-600 hover:bg-red-50"
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="2xl"
        scrollBehavior="inside"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4">
                <h2 className="text-xl font-bold text-fresha-dark">
                  {editingId
                    ? t("admin.services.edit", "Edit Service")
                    : t("admin.services.add", "Add New Service")}
                </h2>
              </ModalHeader>
              <ModalBody className="p-6 gap-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label={t("admin.services.nameEn", "Name (EN)")}
                    value={form.name_en}
                    onValueChange={(val) => setForm({ ...form, name_en: val })}
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder={t(
                      "admin.services.nameEnPlaceholder",
                      "E.g. Powder Brows",
                    )}
                  />
                  <Input
                    label={t("admin.services.nameUk", "Name (UK)")}
                    value={form.name_uk}
                    onValueChange={(val) => setForm({ ...form, name_uk: val })}
                    variant="bordered"
                    labelPlacement="outside"
                    placeholder={t(
                      "admin.services.nameUkPlaceholder",
                      "Напр. Пудрові брови",
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Textarea
                    label={t("admin.services.descEn", "Description (EN)")}
                    value={form.description_en}
                    onValueChange={(val) =>
                      setForm({ ...form, description_en: val })
                    }
                    variant="bordered"
                    labelPlacement="outside"
                    minRows={3}
                  />
                  <Textarea
                    label={t("admin.services.descUk", "Description (UK)")}
                    value={form.description_uk}
                    onValueChange={(val) =>
                      setForm({ ...form, description_uk: val })
                    }
                    variant="bordered"
                    labelPlacement="outside"
                    minRows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    type="number"
                    label={t("admin.services.price", "Price (UAH)")}
                    value={form.price}
                    onValueChange={(val) => setForm({ ...form, price: val })}
                    variant="bordered"
                    labelPlacement="outside"
                    startContent={<span className="text-gray-400">₴</span>}
                  />
                  <Input
                    type="number"
                    label={t("admin.services.duration", "Duration (mins)")}
                    value={form.duration_minutes}
                    onValueChange={(val) =>
                      setForm({ ...form, duration_minutes: val })
                    }
                    variant="bordered"
                    labelPlacement="outside"
                    endContent={
                      <span className="text-gray-400 text-sm">min</span>
                    }
                  />
                  <Select
                    label={t("admin.services.category", "Category")}
                    selectedKeys={[form.category]}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    variant="bordered"
                    labelPlacement="outside"
                  >
                    <SelectItem key="brows" value="brows">
                      {t("services.categories.brows", "Brows")}
                    </SelectItem>
                    <SelectItem key="eyelids" value="eyelids">
                      {t("services.categories.eyelids", "Eyelids")}
                    </SelectItem>
                    <SelectItem key="face" value="face">
                      {t("services.categories.face", "Face")}
                    </SelectItem>
                  </Select>
                </div>

                <Switch
                  isSelected={form.active}
                  onValueChange={(val) => setForm({ ...form, active: val })}
                  color="success"
                >
                  {t("admin.services.activeStatusLabel", "Service is Active")}
                </Switch>
              </ModalBody>
              <ModalFooter className="border-t border-gray-100 px-6 py-4">
                <Button variant="light" onPress={onClose}>
                  {t("admin.services.cancel", "Cancel")}
                </Button>
                <Button
                  className="bg-fresha-dark text-white font-medium px-6"
                  onPress={handleSave}
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                >
                  {t("admin.services.save", "Save Changes")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
