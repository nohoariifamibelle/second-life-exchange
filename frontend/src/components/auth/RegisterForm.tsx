"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { useState } from "react";

export function RegisterForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string>("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur", // Validation au blur pour une meilleure UX
  });

  const onSubmit = async (data: RegisterFormData) => {
    setGeneralError("");

    try {
      await registerUser(data);
      router.push("/login");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Une erreur est survenue";
      setGeneralError(message);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        label="Email"
        type="email"
        error={errors.email?.message}
        {...register("email")}
      />

      <Input
        label="Mot de passe"
        type="password"
        error={errors.password?.message}
        {...register("password")}
      />

      <Input
        label="Prénom"
        error={errors.firstName?.message}
        {...register("firstName")}
      />

      <Input
        label="Nom"
        error={errors.lastName?.message}
        {...register("lastName")}
      />

      {generalError && (
        <p className="text-red-600 text-sm">{generalError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
