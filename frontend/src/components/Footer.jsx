import { useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Button,
  Tooltip,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  useDisclosure,
} from "@heroui/react";

export default function Footer() {
  const { t } = useTranslation();
  const year = new Date().getFullYear();
  const { isOpen, onOpen, onOpenChange } = useDisclosure();
  const [copied, setCopied] = useState(false);

  const phone = "+380 (96) 034 45 36";
  const avatarUrl =
    "https://res.cloudinary.com/dme0dknht/image/upload/v1773429355/photo_2026-03-13_21-15-02_qtgk9r.jpg";

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(phone.replace(/[()\s-]/g, ""));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="bg-fresha-dark text-gray-300 py-8 mt-auto border-t border-white/5">
      <div className="container mx-auto px-4 lg:px-6 max-w-7xl">
        <div className="flex flex-col md:flex-row justify-between items-center gap-10 text-center md:text-left">
          {/* Brand & Artist */}
          <div className="flex flex-col items-center md:items-start gap-4 flex-shrink-0">
            <div className="flex items-center gap-4">
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-fresha-dark to-gray-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
                <img
                  src={avatarUrl}
                  alt="Artist Avatar"
                  className="relative w-16 h-16 rounded-full object-cover border-2 border-white/10 shadow-xl"
                />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-serif text-xl font-bold text-white tracking-wide uppercase whitespace-nowrap">
                  {t("footer.brand_name", "Тетяна П'ятківська")}
                </span>
                <span className="text-sm font-medium text-gray-400 italic whitespace-nowrap overflow-hidden text-ellipsis">
                  {t("footer.tagline", "Краса - це мистецтво. Ми - митці.")}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Location */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 flex-grow px-2">
            <div className="flex flex-col items-center">
              <Tooltip
                content={
                  copied
                    ? t("footer.copied", "Copied!")
                    : t("common.copy", "Click to copy")
                }
                placement="top"
                color={copied ? "success" : "default"}
              >
                <button
                  onClick={handleCopyPhone}
                  className="group flex flex-col items-center transition-transform hover:scale-105"
                >
                  <span className="text-gray-500 text-[10px] mb-1 uppercase tracking-[0.2em]">
                    {t("booking.phone", "Phone")}
                  </span>
                  <span className="text-lg font-bold text-white group-hover:text-amber-200 transition-colors flex items-center gap-2 whitespace-nowrap">
                    {phone}
                    <svg
                      className="w-4 h-4 opacity-50 group-hover:opacity-100"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m-3 8.5V11a.5.5 0 00-1 0v2.5a.5.5 0 01-1 0V11a.5.5 0 00-1 0v2.5a.5.5 0 01-1 0V11a.5.5 0 00-1 0v2.5a1.5 1.5 0 003 0z"
                      />
                    </svg>
                  </span>
                </button>
              </Tooltip>
            </div>

            <button
              onClick={onOpen}
              className="flex flex-col items-center group transition-transform hover:scale-105"
            >
              <span className="text-gray-500 text-[10px] mb-1 uppercase tracking-[0.2em]">
                {t("common.location", "Location")}
              </span>
              <div className="flex items-center gap-2 text-white group-hover:text-amber-200 transition-colors font-medium whitespace-nowrap">
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-amber-200"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
                <span className="text-lg font-bold">
                  {t("footer.address", "Odesa, Ukraine")}
                </span>
              </div>
            </button>
          </div>

          {/* Socials */}
          <div className="flex justify-center md:justify-end gap-5 flex-shrink-0">
            <a
              href="https://www.instagram.com/piatkivska.brows?igsh=MWJjNm5jcTE3bTUycQ%3D%3D&utm_source=qr"
              target="_blank"
              rel="noreferrer"
              className="w-16 h-16 rounded-full border border-white/10 flex items-center justify-center hover:bg-white/5 hover:border-amber-200/50 hover:text-amber-200 transition-all duration-300"
            >
              <svg
                className="w-8 h-8"
                fill="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
          </div>
        </div>

        <div className="border-t border-white/10 mt-8 pt-6 text-center">
          <p className="text-[10px] text-gray-500 tracking-widest uppercase">
            © {year} PIATKIVSKA BROW ARTIST.{" "}
            {t("footer.rights", "All rights reserved.")}
          </p>
        </div>
      </div>

      {/* Map Modal */}
      <Modal
        isOpen={isOpen}
        onOpenChange={onOpenChange}
        size="4xl"
        className="bg-fresha-dark border border-white/10"
        backdrop="blur"
      >
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-white antialiased font-serif italic border-b border-white/5 pb-4">
                {t("footer.address", "Odesa, Ukraine")}
              </ModalHeader>
              <ModalBody className="p-0 overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1371.5322837054077!2d30.829514699659846!3d46.56618847355978!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c63b1da34d876f%3A0xfa33a773051ed9b9!2z0JbQmiDQn9Cw0YDQuiDRhNC-0L3RgtCw0L3RltCy!5e0!3m2!1suk!2sua!4v1773431488582!5m2!1suk!2sua"
                  width="100%"
                  height="450"
                  style={{ border: 0 }}
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Google Maps Location"
                ></iframe>
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>
    </footer>
  );
}
