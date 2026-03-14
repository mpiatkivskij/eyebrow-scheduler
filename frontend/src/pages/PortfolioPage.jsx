import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Modal, ModalContent, ModalBody, Button } from "@heroui/react";
import { getGalleryItems } from "../api/api";

export default function PortfolioPage() {
  const { t, i18n } = useTranslation();
  const [selectedImage, setSelectedImage] = useState(null);
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";

  const { data: items = [] } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await getGalleryItems();
      return data;
    },
  });

  return (
    <div className="py-16 md:py-24 min-h-[80vh] w-full">
      <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 text-fresha-dark tracking-tight">
            {t("portfolio.title", "Our Portfolio")}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto text-lg">
            {t(
              "portfolio.subtitle",
              "A glimpse into our beautiful transformations.",
            )}
          </p>
          <div className="w-16 h-1 bg-fresha-dark mx-auto mt-6 rounded-full" />
        </div>

        {/* Masonry Layout using CSS Columns */}
        <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
          {items.map((item, idx) => (
            <div
              key={item.id}
              className="break-inside-avoid animate-in fade-in zoom-in duration-700 fill-mode-both"
              style={{ animationDelay: `${idx * 100}ms` }}
            >
              <div
                className="relative group rounded-xl overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300"
                onClick={() => setSelectedImage(item)}
              >
                {item.media_type === "video" ? (
                  <video
                    src={item.image_url}
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                    muted
                    loop
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
                    loading="lazy"
                    className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                  />
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/0 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 rounded-xl">
                  <p className="text-white text-sm font-medium translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    {lang === "uk" ? item.description_uk : item.description_en}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox Modal using Hero UI Modal */}
      <Modal
        isOpen={!!selectedImage}
        onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
        size="4xl"
        classNames={{
          base: "bg-transparent shadow-none",
          closeButton:
            "top-2 right-2 right-0 bg-black/50 text-white hover:bg-black/80 z-50",
          backdrop: "bg-black/90 backdrop-blur-sm",
        }}
      >
        <ModalContent>
          {() => (
            <ModalBody className="p-0 items-center justify-center pointer-events-none relative pt-12">
              <div className="relative pointer-events-auto">
                {selectedImage?.media_type === "video" ? (
                  <video
                    src={selectedImage?.image_url}
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                    controls
                    autoPlay
                  />
                ) : (
                  <img
                    src={selectedImage?.image_url}
                    alt={
                      lang === "uk"
                        ? selectedImage?.description_uk
                        : selectedImage?.description_en
                    }
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />
                )}
                {selectedImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4 rounded-b-xl">
                    <p className="text-white text-center text-lg shadow-sm">
                      {lang === "uk"
                        ? selectedImage.description_uk
                        : selectedImage.description_en}
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>
    </div>
  );
}
