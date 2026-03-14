import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Input,
  Select,
  SelectItem,
  Card,
  CardBody,
  CardFooter,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Spinner,
} from "@heroui/react";
import { addToast } from "@heroui/toast";
import {
  getGalleryItems,
  adminCreateGalleryItem,
  adminUpdateGalleryItem,
  adminDeleteGalleryItem,
} from "../../api/api";

const defaultForm = {
  image_url: "",
  description_en: "",
  description_uk: "",
  category: "brows",
  sort_order: 0,
  media_type: "photo",
};

export default function AdminGalleryPage() {
  const { t, i18n } = useTranslation();
  const queryClient = useQueryClient();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";

  const { isOpen, onOpen, onOpenChange, onClose } = useDisclosure();
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(defaultForm);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["adminGallery"],
    queryFn: async () => (await getGalleryItems()).data,
  });

  const createMutation = useMutation({
    mutationFn: adminCreateGalleryItem,
    onSuccess: () => {
      queryClient.invalidateQueries(["adminGallery"]);
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
    mutationFn: ({ id, data }) => adminUpdateGalleryItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["adminGallery"]);
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
    mutationFn: adminDeleteGalleryItem,
    onSuccess: () => queryClient.invalidateQueries(["adminGallery"]),
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

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingId(item.id);
      setForm({ ...item, sort_order: String(item.sort_order || 0) });
    } else {
      setEditingId(null);
      setForm(defaultForm);
    }
    onOpen();
  };

  const handleSave = () => {
    const payload = { ...form, sort_order: parseInt(form.sort_order, 10) || 0 };
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
          "admin.gallery.deleteConfirm",
          "Are you sure you want to delete this image?",
        ),
      )
    ) {
      deleteMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className="text-3xl font-bold text-fresha-dark">
          {t("admin.gallery.title", "Gallery")}
        </h1>
        <Button
          onPress={() => handleOpenModal()}
          className="bg-fresha-dark text-white font-medium shadow-md shadow-black/5"
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
          {t("admin.gallery.add", "Add Media")}
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner size="lg" />
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 shadow-sm">
          <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">
            {t("admin.gallery.noImages", "No images yet")}
          </h3>
          <p className="text-gray-500 mb-4">
            {t(
              "admin.gallery.addFirst",
              "Add your first image to showcase your portfolio.",
            )}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <Card
              key={item.id}
              className="border-none shadow-sm hover:shadow-md transition-shadow duration-300"
            >
              <div className="relative aspect-video w-full overflow-hidden bg-gray-100">
                {item.media_type === "video" ? (
                  <video
                    src={item.image_url}
                    className="w-full h-full object-cover"
                    muted
                    onMouseOver={(e) => e.target.play()}
                    onMouseOut={(e) => {
                      e.target.pause();
                      e.target.currentTime = 0;
                    }}
                  />
                ) : (
                  <img
                    src={item.image_url}
                    alt={
                      lang === "uk" ? item.description_uk : item.description_en
                    }
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                    loading="lazy"
                  />
                )}
              </div>
              <CardBody className="px-5 py-4 pb-2 text-left">
                <p
                  className="font-medium text-fresha-dark line-clamp-1 mb-1"
                  title={item.description_en}
                >
                  {lang === "uk"
                    ? item.description_uk
                    : item.description_en ||
                      t(
                        "admin.gallery.noDescription",
                        "No description provided",
                      )}
                </p>
                <div className="flex justify-between items-center text-xs text-gray-500 font-medium">
                  <span className="bg-gray-100 px-2 py-1 rounded-md uppercase tracking-wider">
                    {t(`services.categories.${item.category}`, item.category)}
                  </span>
                  <span>
                    {t("admin.gallery.order", "Order")}: {item.sort_order}
                  </span>
                </div>
              </CardBody>
              <CardFooter className="px-5 py-3 border-t border-gray-50 pt-3 flex justify-end gap-2">
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
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 border-b border-gray-100 px-6 py-4">
                <h2 className="text-xl font-bold text-fresha-dark">
                  {editingId
                    ? t("admin.gallery.edit", "Edit Media")
                    : t("admin.gallery.add", "Add New Media")}
                </h2>
              </ModalHeader>
              <ModalBody className="p-6 gap-5">
                <Select
                  label={t("admin.gallery.mediaType", "Media Type")}
                  selectedKeys={[form.media_type]}
                  onChange={(e) =>
                    setForm({ ...form, media_type: e.target.value })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                >
                  <SelectItem key="photo" value="photo">
                    {t("admin.gallery.photo", "Photo")}
                  </SelectItem>
                  <SelectItem key="video" value="video">
                    {t("admin.gallery.video", "Video")}
                  </SelectItem>
                </Select>

                <Input
                  label={t("admin.gallery.imageUrl", "Media URL")}
                  value={form.image_url}
                  onValueChange={(val) => setForm({ ...form, image_url: val })}
                  variant="bordered"
                  labelPlacement="outside"
                  placeholder={t(
                    "admin.gallery.imageUrlPlaceholder",
                    "https://",
                  )}
                  isRequired
                />

                {form.image_url && (
                  <div className="w-full h-40 bg-gray-100 rounded-xl overflow-hidden border border-gray-200">
                    {form.media_type === "video" ? (
                      <video
                        src={form.image_url}
                        className="w-full h-full object-cover"
                        controls
                      />
                    ) : (
                      <img
                        src={form.image_url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                        onLoad={(e) => {
                          e.target.style.display = "block";
                        }}
                      />
                    )}
                  </div>
                )}

                <Input
                  label={t("admin.gallery.descEn", "Description (EN)")}
                  value={form.description_en}
                  onValueChange={(val) =>
                    setForm({ ...form, description_en: val })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                />
                <Input
                  label={t("admin.gallery.descUk", "Description (UK)")}
                  value={form.description_uk}
                  onValueChange={(val) =>
                    setForm({ ...form, description_uk: val })
                  }
                  variant="bordered"
                  labelPlacement="outside"
                />

                <div className="grid grid-cols-2 gap-4">
                  <Select
                    label={t("admin.gallery.category", "Category")}
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
                  <Input
                    type="number"
                    label={t("admin.gallery.sortOrder", "Sort Order")}
                    value={form.sort_order}
                    onValueChange={(val) =>
                      setForm({ ...form, sort_order: val })
                    }
                    variant="bordered"
                    labelPlacement="outside"
                  />
                </div>
              </ModalBody>
              <ModalFooter className="border-t border-gray-100 px-6 py-4">
                <Button variant="light" onPress={onClose}>
                  {t("admin.gallery.cancel", "Cancel")}
                </Button>
                <Button
                  className="bg-fresha-dark text-white font-medium px-6"
                  onPress={handleSave}
                  isLoading={
                    createMutation.isPending || updateMutation.isPending
                  }
                  isDisabled={!form.image_url}
                >
                  {t("admin.gallery.save", "Save Media")}
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
