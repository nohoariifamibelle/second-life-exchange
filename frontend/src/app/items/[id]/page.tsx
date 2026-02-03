"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { getDetailImageUrl } from "@/utils/cloudinary";
import { useAuth } from "@/contexts/AuthContext";
import { getItem, deleteItem } from "@/lib/items-api";
import {
  type Item,
  categoryLabels,
  conditionLabels,
  statusLabels,
  type ItemCategoryType,
  type ItemConditionType,
  type ItemStatusType,
} from "@/schemas/item";

export default function ItemDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, isAuthenticated } = useAuth();

  const [item, setItem] = useState<Item | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const itemId = params.id as string;

  // Vérifier si l'utilisateur est le propriétaire
  const isOwner = user && item?.owner?.id === user.id;

  // Charger l'objet
  useEffect(() => {
    const loadItem = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const data = await getItem(itemId);
        setItem(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    if (itemId) {
      loadItem();
    }
  }, [itemId]);

  // Supprimer l'objet
  const handleDelete = async () => {
    if (!accessToken || !itemId) return;

    setIsDeleting(true);
    try {
      await deleteItem(accessToken, itemId);
      toast.success("Objet supprimé avec succès");
      router.push("/items");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Formater la date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
              Second Life Exchange
            </Link>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8">
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-lg text-red-600 mb-4">{error || "Objet non trouvé"}</p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Retour aux objets
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <Link
                href="/dashboard"
                className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Mon espace
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Se connecter
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Fil d'ariane */}
        <div className="mb-6">
          <Link href="/items" className="text-green-600 hover:text-green-700">
            ← Retour aux objets
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="md:flex">
            {/* Image */}
            <div className="md:w-1/2">
              <div className="aspect-square bg-gray-100 relative">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={getDetailImageUrl(item.images[0])}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    priority
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <svg
                      className="w-24 h-24"
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
                )}
                {/* Badge statut */}
                <span
                  className={`absolute top-4 right-4 px-3 py-1 text-sm font-medium rounded ${
                    item.status === "available"
                      ? "bg-green-100 text-green-800"
                      : item.status === "reserved"
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {statusLabels[item.status as ItemStatusType] || item.status}
                </span>
              </div>
            </div>

            {/* Informations */}
            <div className="md:w-1/2 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="inline-block px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded mb-2">
                    {categoryLabels[item.category as ItemCategoryType] || item.category}
                  </span>
                  <h1 className="text-2xl font-bold text-gray-800">{item.title}</h1>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">État :</span>
                  <span>{conditionLabels[item.condition as ItemConditionType] || item.condition}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Localisation :</span>
                  <span>
                    {item.city} ({item.postalCode})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Publié le :</span>
                  <span>{formatDate(item.createdAt)}</span>
                </div>

                <div className="flex items-center gap-2 text-gray-600">
                  <span className="font-medium">Vues :</span>
                  <span>{item.viewCount}</span>
                </div>
              </div>

              {/* Propriétaire */}
              {item.owner && (
                <div className="border-t pt-4 mb-6">
                  <p className="text-sm text-gray-500 mb-2">Proposé par</p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-medium">
                        {item.owner.firstName[0]}
                        {item.owner.lastName[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {item.owner.firstName} {item.owner.lastName}
                      </p>
                      {item.owner.city && (
                        <p className="text-sm text-gray-500">{item.owner.city}</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Actions */}
              {isOwner ? (
                <div className="space-y-3">
                  <Link
                    href={`/items/${item.id}/edit`}
                    className="block w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    Modifier l&apos;objet
                  </Link>
                  {!showDeleteConfirm ? (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="block w-full py-3 px-4 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors"
                    >
                      Supprimer l&apos;objet
                    </button>
                  ) : (
                    <div className="bg-red-50 p-4 rounded-lg">
                      <p className="text-red-700 text-sm mb-3">
                        Êtes-vous sûr de vouloir supprimer cet objet ?
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="flex-1 py-2 px-4 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {isDeleting ? "Suppression..." : "Oui, supprimer"}
                        </button>
                        <button
                          onClick={() => setShowDeleteConfirm(false)}
                          disabled={isDeleting}
                          className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors"
                        >
                          Annuler
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                isAuthenticated &&
                item.status === "available" && (
                  <Link
                    href={`/items/${item.id}/exchange`}
                    className="block w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    Proposer un échange
                  </Link>
                )
              )}
            </div>
          </div>

          {/* Description */}
          <div className="p-6 border-t">
            <h2 className="text-lg font-semibold text-gray-800 mb-3">Description</h2>
            <p className="text-gray-600 whitespace-pre-wrap">{item.description}</p>
          </div>
        </div>
      </main>
    </div>
  );
}
