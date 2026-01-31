"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { createItem } from "@/lib/items-api";
import { generateDescription } from "@/lib/ai-api";
import {
  createItemSchema,
  type CreateItemFormData,
  categoryLabels,
  conditionLabels,
} from "@/schemas/item";
import ImageUpload from "@/components/ui/ImageUpload";

export default function NewItemPage() {
  const { user, accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CreateItemFormData>({
    resolver: zodResolver(createItemSchema),
    defaultValues: {
      images: [],
    },
  });

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Pré-remplir la ville si disponible dans le profil
  useEffect(() => {
    if (user?.city) {
      setValue("city", user.city);
    }
  }, [user, setValue]);

  const handleGenerateDescription = async () => {
    const title = watch("title");
    const category = watch("category");

    if (!title || !category || !accessToken) {
      toast.error("Veuillez remplir le titre et la catégorie");
      return;
    }

    setIsGenerating(true);
    try {
      const description = await generateDescription(accessToken, title, category);
      setValue("description", description);
      toast.success("Description générée avec succès !");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la génération";
      toast.error(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = async (data: CreateItemFormData) => {
    if (!accessToken) return;

    setIsSubmitting(true);
    try {
      const item = await createItem(accessToken, data);
      toast.success("Objet publié avec succès !");
      router.push(`/items/${item.id}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la création";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <Link
            href="/dashboard"
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Mon espace
          </Link>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-800 mb-6">Publier un objet</h1>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Titre */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
                Titre *
              </label>
              <input
                id="title"
                type="text"
                {...register("title")}
                placeholder="Ex: iPhone 12, Vélo de route, Canapé 3 places..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                  Description *
                </label>
                <button
                  type="button"
                  onClick={handleGenerateDescription}
                  disabled={isGenerating || !watch("title") || !watch("category")}
                  className="text-sm text-purple-600 hover:text-purple-700 disabled:text-gray-400 disabled:cursor-not-allowed"
                >
                  {isGenerating ? "Génération..." : "✨ Générer avec l'IA"}
                </button>
              </div>
              <textarea
                id="description"
                rows={5}
                {...register("description")}
                placeholder="Décrivez votre objet en détail : marque, modèle, dimensions, défauts éventuels..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.description && (
                <p className="mt-1 text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            {/* Catégorie et État */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Catégorie */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                  Catégorie *
                </label>
                <select
                  id="category"
                  {...register("category")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    errors.category ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez...</option>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              {/* État */}
              <div>
                <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-1">
                  État *
                </label>
                <select
                  id="condition"
                  {...register("condition")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    errors.condition ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">Sélectionnez...</option>
                  {Object.entries(conditionLabels).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
                {errors.condition && (
                  <p className="mt-1 text-sm text-red-500">{errors.condition.message}</p>
                )}
              </div>
            </div>

            {/* Localisation */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Ville */}
              <div>
                <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                  Ville *
                </label>
                <input
                  id="city"
                  type="text"
                  {...register("city")}
                  placeholder="Ex: Paris, Lyon, Marseille..."
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    errors.city ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-500">{errors.city.message}</p>
                )}
              </div>

              {/* Code postal */}
              <div>
                <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                  Code postal *
                </label>
                <input
                  id="postalCode"
                  type="text"
                  {...register("postalCode")}
                  placeholder="Ex: 75001"
                  maxLength={5}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    errors.postalCode ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-500">{errors.postalCode.message}</p>
                )}
              </div>
            </div>

            {/* Images */}
            {accessToken && (
              <ImageUpload
                value={watch("images") || []}
                onChange={(urls) => setValue("images", urls)}
                accessToken={accessToken}
                maxImages={3}
                disabled={isSubmitting}
                error={errors.images?.message}
              />
            )}

            {/* Boutons */}
            <div className="flex gap-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? "Publication..." : "Publier l'objet"}
              </button>
              <Link
                href="/items"
                className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors text-center"
              >
                Annuler
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
