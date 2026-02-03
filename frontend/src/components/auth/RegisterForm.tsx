"use client";

import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerUser } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { registerSchema, type RegisterFormData } from "@/schemas/auth";
import { useState } from "react";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [generalError, setGeneralError] = useState<string>("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    mode: "onBlur",
    defaultValues: {
      acceptedTerms: false,
    },
  });

  const acceptedTerms = watch("acceptedTerms");

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

      <div className="space-y-1">
        <label className="flex items-start gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-green-600 focus:ring-green-500"
            {...register("acceptedTerms")}
          />
          <span className="text-sm text-gray-700">
            J&apos;accepte les{" "}
            <Link
              href="/cgu"
              className="text-green-600 hover:underline"
              target="_blank"
            >
              Conditions Générales d&apos;Utilisation
            </Link>{" "}
            et la{" "}
            <Link
              href="/politique-confidentialite"
              className="text-green-600 hover:underline"
              target="_blank"
            >
              Politique de Confidentialité
            </Link>
          </span>
        </label>
        {errors.acceptedTerms && (
          <p className="text-red-600 text-sm">{errors.acceptedTerms.message}</p>
        )}
      </div>

      {generalError && (
        <p className="text-red-600 text-sm">{generalError}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting || !acceptedTerms}
        className="w-full py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSubmitting ? "Inscription..." : "S'inscrire"}
      </button>
    </form>
  );
}
