import Signin from "@/components/Auth/Signin";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Вход — SupportBot",
};

export default function SignIn() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray p-4 dark:bg-dark-2">
      <div className="w-full max-w-[450px] rounded-[10px] bg-white shadow-card dark:bg-gray-dark">
        <div className="w-full p-8 sm:p-12.5">
          {/* Лого */}
          <div className="mb-6 text-center">
            <h1 className="text-2xl font-bold text-dark dark:text-white">
              SupportBot
            </h1>
            <p className="mt-2 text-sm text-dark-5 dark:text-dark-6">
              Войдите в админ-панель
            </p>
          </div>

          <Signin />
        </div>
      </div>
    </div>
  );
}
