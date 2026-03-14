import { Link, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/react";

export default function Header() {
  const { t, i18n } = useTranslation();
  const location = useLocation();

  const navItems = [
    { label: t("nav.home", "Home"), path: "/" },
    { label: t("nav.portfolio", "Portfolio"), path: "/portfolio" },
    { label: t("nav.booking", "Booking"), path: "/booking" },
  ];

  const handleLanguageChange = (key) => {
    i18n.changeLanguage(key);
  };

  const isActive = (path) => location.pathname === path;
  const currentLang = i18n.language?.startsWith("uk") ? "uk" : "en";

  return (
    <Navbar
      isBordered
      classNames={{
        item: [
          "flex",
          "relative",
          "h-full",
          "items-center",
          "data-[active=true]:after:content-['']",
          "data-[active=true]:after:absolute",
          "data-[active=true]:after:bottom-0",
          "data-[active=true]:after:left-0",
          "data-[active=true]:after:right-0",
          "data-[active=true]:after:h-[2px]",
          "data-[active=true]:after:rounded-[2px]",
          "data-[active=true]:after:bg-fresha-dark",
        ],
      }}
    >
      <NavbarContent>
        <NavbarBrand className="gap-2">
          <Link
            to="/"
            className="font-bold text-inherit tracking-wide flex items-center gap-1.5 sm:gap-2 max-w-full overflow-hidden"
          >
            <img
              src="/icon.svg"
              alt="Logo"
              className="w-6 h-6 sm:w-8 sm:h-8 object-contain flex-shrink-0"
            />
            <span className="text-fresha-dark font-serif text-sm sm:text-lg whitespace-nowrap truncate">
              Piatkivska Brow Artist
            </span>
          </Link>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent className="hidden lg:flex gap-4" justify="center">
        {navItems.map((item) => (
          <NavbarItem key={item.path} isActive={isActive(item.path)}>
            <Link
              to={item.path}
              className={
                isActive(item.path)
                  ? "text-fresha-dark font-semibold"
                  : "text-gray-600 hover:text-fresha-dark"
              }
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>

      <NavbarContent justify="end">
        <NavbarItem>
          <Dropdown>
            <DropdownTrigger>
              <Button
                variant="bordered"
                size="sm"
                className="min-w-16 border-gray-300"
              >
                {currentLang.toUpperCase()}
              </Button>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Language selection"
              onAction={(key) => handleLanguageChange(key)}
            >
              <DropdownItem
                key="en"
                className={
                  currentLang === "en"
                    ? "bg-gray-100 text-fresha-dark font-bold"
                    : ""
                }
              >
                English
              </DropdownItem>
              <DropdownItem
                key="uk"
                className={
                  currentLang === "uk"
                    ? "bg-gray-100 text-fresha-dark font-bold"
                    : ""
                }
              >
                Українська
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </NavbarItem>
      </NavbarContent>


    </Navbar>
  );
}
