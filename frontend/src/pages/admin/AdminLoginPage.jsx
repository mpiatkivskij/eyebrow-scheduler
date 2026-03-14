import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import { Input, Button, Card, CardBody } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { adminLogin } from "../../api/api";

export default function AdminLoginPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const loginMutation = useMutation({
    mutationFn: async () => {
      const res = await adminLogin(email, password);
      return res.data;
    },
    onSuccess: (data) => {
      localStorage.setItem("admin_token", data.token);
      navigate("/admin/dashboard");
    },
    onError: () => {
      setError(t("admin.login.error", "Invalid credentials."));
      addToast({
        title: t("common.error", "Error"),
        description: t("admin.login.error", "Invalid credentials."),
        color: "danger",
        timeout: 4000,
      });
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    loginMutation.mutate();
  };

  return (
    <div className="flex items-center justify-center min-h-screen font-sans bg-fresha-light p-4 relative overflow-hidden">
      {/* Decorative gradient blob */}
      <div className="absolute top-[-20%] left-[-10%] w-96 h-96 bg-cyan-200/40 rounded-full blur-[80px]" />
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-fresha-dark/5 rounded-full blur-[60px]" />

      <Card className="w-full max-w-md shadow-2xl shadow-black/5 bg-white/95 backdrop-blur-md rounded-2xl border-none z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
        <CardBody className="p-8 md:p-10">
          <div className="flex justify-center mb-6">
            <div className="w-30 h-30 bg-fresha-dark rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-300">
              <img
                src="https://res.cloudinary.com/dme0dknht/image/upload/v1773429355/photo_2026-03-13_21-15-02_qtgk9r.jpg"
                alt="Avatar"
                className="w-full h-full object-cover rounded-2xl"
              />
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-fresha-dark mb-1">
              {t("admin.login.welcome", "Welcome back")}
            </h1>
            <p className="text-gray-500 font-medium tracking-wide">
              {t("admin.login.tagline", "Tetiana Piatkivska")}
            </p>
          </div>

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-xl border border-red-200 mb-6 text-sm text-center font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              type="email"
              label={t("admin.login.email", "Email")}
              placeholder="admin@example.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              variant="faded"
              labelPlacement="outside"
              classNames={{
                inputWrapper:
                  "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
              }}
            />
            <Input
              type="password"
              label={t("admin.login.password", "Password")}
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              isRequired
              variant="faded"
              labelPlacement="outside"
              classNames={{
                inputWrapper:
                  "bg-gray-50 border-gray-200 hover:border-gray-300 focus-within:border-fresha-dark focus-within:ring-1 focus-within:ring-fresha-dark",
              }}
            />
            <Button
              type="submit"
              isLoading={loginMutation.isPending}
              className="w-full mt-4 bg-fresha-dark text-white font-bold py-6 rounded-xl hover:bg-black transition-colors"
            >
              {t("admin.login.submit", "Sign in")}
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
