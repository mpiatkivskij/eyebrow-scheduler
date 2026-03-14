import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { Button, Card, CardBody, Chip, Modal, ModalContent, ModalBody } from "@heroui/react";
import { getServices, getGalleryItems } from "../api/api";
import backgroundImg from "../assets/background.png";

const categoryIcons = {
  brows: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z"
      />
    </svg>
  ),
  eyelids: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  ),
  face: (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="w-6 h-6"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z"
      />
    </svg>
  ),
};

export default function HomePage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const lang = i18n.language?.startsWith("uk") ? "uk" : "en";
  const [selectedImage, setSelectedImage] = useState(null);

  const { data: services = [] } = useQuery({
    queryKey: ["services"],
    queryFn: async () => {
      const { data } = await getServices();
      return data;
    },
  });

  const { data: galleryItems = [] } = useQuery({
    queryKey: ["gallery"],
    queryFn: async () => {
      const { data } = await getGalleryItems();
      return data;
    },
  });

  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="relative min-h-[calc(100vh-64px)] md:min-h-[85vh] flex flex-col overflow-hidden">
        {/* Decorative background elements (Tailwind implementation) */}
        <div className="absolute top-[10%] left-[5%] w-[200px] h-[200px] rounded-full bg-cyan-500/5 animate-[pulse_6s_ease-in-out_infinite]" />
        <div className="absolute bottom-[15%] right-[10%] w-[150px] h-[150px] rounded-full bg-cyan-500/10 animate-[pulse_8s_ease-in-out_infinite_reverse]" />
        <div className="absolute top-[40%] right-[25%] w-[80px] h-[80px] rounded-full bg-cyan-500/5 animate-[pulse_5s_ease-in-out_infinite]" />

        <div className="container mx-auto px-4 relative z-10 max-w-4xl flex-1 flex flex-col">
          <div className="flex-1 flex flex-col justify-center items-center text-center animate-in fade-in zoom-in duration-1000">
            <h1 className="text-4xl md:text-6xl lg:text-[4.5rem] font-bold leading-tight mb-6 text-gray-900 tracking-tight">
              {t("hero.title").split(" ").slice(0, -2).join(" ")}{" "}
              <span className="block text-fresha-dark">
                {t("hero.title").split(" ").slice(-2).join(" ")}
              </span>
            </h1>
            <div className="my-6 md:my-8 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300 w-full flex flex-col items-center">
              <img
                src={backgroundImg}
                alt="ТЕТЯНА П'ЯТКІВСЬКА"
                className="w-full max-w-[320px] sm:max-w-[400px] md:max-w-[500px] lg:max-w-[550px] h-auto object-contain"
              />
              <div className="mt-6 text-center">
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-fresha-dark tracking-tight mb-1">
                  {t("hero.artistName")}
                </h2>
                <p className="text-xs md:text-sm font-bold text-gray-500 tracking-[0.3em] uppercase">
                  {t("hero.artistTitle")}
                </p>
              </div>
            </div>
            <p className="text-lg md:text-xl text-gray-600 font-normal max-w-2xl mx-auto leading-relaxed px-2">
              {t("hero.subtitle")}
            </p>
          </div>

          <div className="pb-12 pt-8 flex justify-center animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-500">
            <Button
              size="lg"
              color="primary"
              className="w-full sm:w-auto px-12 py-7 text-lg rounded-full shadow-xl shadow-fresha-dark/20 bg-fresha-dark text-white font-bold tracking-wide"
              endContent={
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={2.5}
                  stroke="currentColor"
                  className="w-5 h-5 ml-1"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3"
                  />
                </svg>
              }
              onPress={() => navigate("/booking")}
            >
              {t("hero.cta", "Book Now")}
            </Button>
          </div>
        </div>
      </section>
      {/* Gallery Section */}
      {galleryItems.length > 0 && (
        <section className="py-16 md:py-24 bg-transparent relative z-10 w-full">
          <div className="container mx-auto px-4 lg:px-8 max-w-7xl">
            <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl md:text-5xl font-bold mb-4 text-fresha-dark tracking-tight">
                {t("portfolio.title", "Our Portfolio")}
              </h2>
              <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                {t("portfolio.subtitle", "A glimpse into our beautiful transformations.")}
              </p>
              <div className="w-16 h-1 bg-fresha-dark mx-auto mt-6 rounded-full" />
            </div>

            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-4">
              {galleryItems.map((item, idx) => (
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
                      <>
                        <img
                          src={item.image_url.replace(/\.[^.]+$/, ".jpg")}
                          alt={lang === "uk" ? item.description_uk : item.description_en}
                          loading="lazy"
                          className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-12 h-12 rounded-full bg-black/50 flex items-center justify-center group-hover:bg-black/70 transition-colors">
                            <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M8 5v14l11-7z" />
                            </svg>
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={item.image_url}
                        alt={lang === "uk" ? item.description_uk : item.description_en}
                        loading="lazy"
                        className="w-full h-auto object-cover rounded-xl transition-transform duration-500 group-hover:scale-105"
                      />
                    )}
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
        </section>
      )}

      {/* Lightbox Modal */}
      <Modal
        isOpen={!!selectedImage}
        onOpenChange={(isOpen) => !isOpen && setSelectedImage(null)}
        size="4xl"
        classNames={{
          base: "bg-transparent shadow-none",
          closeButton: "top-2 right-2 bg-black/50 text-white hover:bg-black/80 z-50",
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
                    alt={lang === "uk" ? selectedImage?.description_uk : selectedImage?.description_en}
                    className="w-full max-h-[85vh] object-contain rounded-xl shadow-2xl"
                  />
                )}
                {selectedImage && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-md p-4 rounded-b-xl">
                    <p className="text-white text-center text-lg">
                      {lang === "uk" ? selectedImage.description_uk : selectedImage.description_en}
                    </p>
                  </div>
                )}
              </div>
            </ModalBody>
          )}
        </ModalContent>
      </Modal>

      {/* Map Section - How to find me */}
      <section className="py-16 md:py-24 bg-transparent relative z-10 w-full">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="text-center mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-fresha-dark tracking-tight">
              {t("findMe.title", "How to Find Me")}
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto text-lg">
              {t("footer.address", "Odesa, Ukraine")}
            </p>
            <div className="w-16 h-1 bg-fresha-dark mx-auto mt-6 rounded-full" />
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl border border-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1371.5322837054077!2d30.829514699659846!3d46.56618847355978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c63b1da34d876f%3A0xfa33a773051ed9b9!2z0JbQmiDQn9Cw0YDQuiDRhNC-0L3RgtCw0L3RltCy!5e0!3m2!1suk!2sua!4v1773431488582!5m2!1suk!2sua"
              width="100%"
              height="400"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>
      </section>
    </div>
  );
}
