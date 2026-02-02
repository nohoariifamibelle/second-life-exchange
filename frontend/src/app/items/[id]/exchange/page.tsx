"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import { getItem, getMyItems } from "@/lib/items-api";
import { createExchange } from "@/lib/exchanges-api";
import { type Item } from "@/schemas/item";
import { getOptimizedImageUrl, getThumbnailUrl } from "@/utils/cloudinary";

export default function ProposeExchangePage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, isLoading, isAuthenticated } = useAuth();

  const [requestedItem, setRequestedItem] = useState<Item | null>(null);
  const [myItems, setMyItems] = useState<Item[]>([]);
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const itemId = params.id as string;

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(`/login?redirect=/items/${itemId}/exchange`);
    }
  }, [isLoading, isAuthenticated, router, itemId]);

  // Charger l'objet demandé et mes objets
  useEffect(() => {
    const loadData = async () => {
      if (!accessToken || !itemId) return;

      setIsLoadingData(true);
      try {
        const [item, myItemsResponse] = await Promise.all([
          getItem(itemId),
          getMyItems(accessToken, 1, 50),
        ]);

        // Vérifier que l'objet n'appartient pas à l'utilisateur
        if (item.owner?.id === user?.id || item.ownerId === user?.id) {
          toast.error("Vous ne pouvez pas proposer un échange pour votre propre objet");
          router.push(`/items/${itemId}`);
          return;
        }

        setRequestedItem(item);
        // Filtrer pour ne garder que les objets disponibles
        setMyItems(myItemsResponse.items.filter((i) => i.status === "available"));
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Objet non trouvé");
        router.push("/items");
      } finally {
        setIsLoadingData(false);
      }
    };

    if (isAuthenticated && accessToken && user) {
      loadData();
    }
  }, [isAuthenticated, accessToken, itemId, user, router]);

  // Toggle sélection d'un objet
  const toggleItem = (id: string) => {
    setSelectedItemIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  // Soumettre la proposition
  const handleSubmit = async () => {
    if (!accessToken || selectedItemIds.length === 0) {
      toast.error("Sélectionnez au moins un objet à proposer");
      return;
    }

    setIsSubmitting(true);
    try {
      const exchange = await createExchange(accessToken, {
        offeredItemIds: selectedItemIds,
        requestedItemId: itemId,
        message: message || undefined,
      });

      toast.success("Proposition envoyée !");
      router.push(`/exchanges/${exchange.id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !requestedItem) {
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

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Fil d'ariane */}
        <div className="mb-6">
          <Link href={`/items/${itemId}`} className="text-green-600 hover:text-green-700">
            ← Retour à l&apos;objet
          </Link>
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-6">Proposer un échange</h1>

        {/* Objet demandé */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Objet que vous souhaitez</h2>
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden relative">
              {requestedItem.images && requestedItem.images.length > 0 ? (
                <Image
                  src={getOptimizedImageUrl(requestedItem.images[0], { width: 160, height: 160 })}
                  alt={requestedItem.title}
                  fill
                  sizes="80px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-800">{requestedItem.title}</p>
              <p className="text-sm text-gray-500">
                {requestedItem.city} ({requestedItem.postalCode})
              </p>
              <p className="text-sm text-gray-500">
                Par {requestedItem.owner?.firstName} {requestedItem.owner?.lastName}
              </p>
            </div>
          </div>
        </div>

        {/* Sélection des objets */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">
            Sélectionnez les objets à proposer
          </h2>

          {myItems.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Vous n&apos;avez pas d&apos;objets disponibles</p>
              <Link
                href="/items/new"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Publier un objet
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {myItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => toggleItem(item.id)}
                  className={`relative rounded-lg overflow-hidden border-2 transition-all ${
                    selectedItemIds.includes(item.id)
                      ? "border-green-500 ring-2 ring-green-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="aspect-square bg-gray-100 relative">
                    {item.images && item.images.length > 0 ? (
                      <Image
                        src={getThumbnailUrl(item.images[0])}
                        alt={item.title}
                        fill
                        sizes="(max-width: 768px) 50vw, 33vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        ?
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-sm font-medium text-gray-800 truncate">{item.title}</p>
                  </div>

                  {/* Checkmark */}
                  {selectedItemIds.includes(item.id) && (
                    <div className="absolute top-2 right-2 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {selectedItemIds.length > 0 && (
            <p className="mt-4 text-sm text-green-600 font-medium">
              {selectedItemIds.length} objet{selectedItemIds.length > 1 ? "s" : ""} sélectionné
              {selectedItemIds.length > 1 ? "s" : ""}
            </p>
          )}
        </div>

        {/* Message */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Message (optionnel)</h2>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ajoutez un message pour accompagner votre proposition..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 resize-none"
            rows={4}
            maxLength={500}
          />
          <p className="text-sm text-gray-500 mt-1">{message.length}/500 caractères</p>
        </div>

        {/* Bouton de soumission */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting || selectedItemIds.length === 0}
          className="w-full py-3 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer la proposition"}
        </button>
      </main>
    </div>
  );
}
