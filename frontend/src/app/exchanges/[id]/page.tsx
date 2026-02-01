"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  getExchange,
  respondToExchange,
  cancelExchange,
  completeExchange,
  createReview,
} from "@/lib/exchanges-api";
import {
  type Exchange,
  statusLabels,
  statusColors,
  type ExchangeStatusType,
} from "@/schemas/exchange";

export default function ExchangeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, accessToken, isLoading, isAuthenticated } = useAuth();

  const [exchange, setExchange] = useState<Exchange | null>(null);
  const [isLoadingExchange, setIsLoadingExchange] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");

  const exchangeId = params.id as string;

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Charger l'échange
  useEffect(() => {
    const loadExchange = async () => {
      if (!accessToken || !exchangeId) return;

      setIsLoadingExchange(true);
      try {
        const data = await getExchange(accessToken, exchangeId);
        setExchange(data);
      } catch (error) {
        console.error("Erreur:", error);
        toast.error("Échange non trouvé");
        router.push("/exchanges");
      } finally {
        setIsLoadingExchange(false);
      }
    };

    if (isAuthenticated && accessToken) {
      loadExchange();
    }
  }, [isAuthenticated, accessToken, exchangeId, router]);

  // Accepter la proposition
  const handleAccept = async () => {
    if (!accessToken || !exchangeId) return;

    setIsProcessing(true);
    try {
      const updated = await respondToExchange(accessToken, exchangeId, {
        response: "accept",
        message: responseMessage,
      });
      setExchange(updated);
      toast.success("Proposition acceptée !");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Refuser la proposition
  const handleRefuse = async () => {
    if (!accessToken || !exchangeId) return;

    setIsProcessing(true);
    try {
      const updated = await respondToExchange(accessToken, exchangeId, {
        response: "refuse",
        message: responseMessage,
      });
      setExchange(updated);
      toast.success("Proposition refusée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Annuler la proposition
  const handleCancel = async () => {
    if (!accessToken || !exchangeId) return;

    setIsProcessing(true);
    try {
      const updated = await cancelExchange(accessToken, exchangeId);
      setExchange(updated);
      toast.success("Proposition annulée");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Finaliser l'échange
  const handleComplete = async () => {
    if (!accessToken || !exchangeId) return;

    setIsProcessing(true);
    try {
      const updated = await completeExchange(accessToken, exchangeId);
      setExchange(updated);
      toast.success("Échange finalisé !");
      setShowReviewForm(true);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  // Laisser un avis
  const handleReview = async () => {
    if (!accessToken || !exchangeId) return;

    setIsProcessing(true);
    try {
      await createReview(accessToken, {
        exchangeId,
        rating,
        comment: reviewComment,
      });
      toast.success("Avis envoyé !");
      setShowReviewForm(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Erreur");
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading || isLoadingExchange) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !exchange) {
    return null;
  }

  const isProposer = exchange.proposer.id === user.id;
  const isReceiver = exchange.receiver.id === user.id;
  const otherUser = isProposer ? exchange.receiver : exchange.proposer;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <Link
            href="/exchanges"
            className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Mes échanges
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Fil d'ariane */}
        <div className="mb-6">
          <Link href="/exchanges" className="text-green-600 hover:text-green-700">
            ← Retour aux échanges
          </Link>
        </div>

        {/* Statut */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-bold text-gray-800">Proposition d&apos;échange</h1>
            <span
              className={`px-3 py-1 text-sm font-medium rounded ${
                statusColors[exchange.status as ExchangeStatusType] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {statusLabels[exchange.status as ExchangeStatusType] || exchange.status}
            </span>
          </div>

          <div className="text-gray-600">
            <p>
              {isProposer ? 'Vous avez proposé' : `${exchange.proposer.firstName} vous propose`} un échange
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Le {new Date(exchange.createdAt).toLocaleDateString('fr-FR', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>
        </div>

        {/* Objets échangés */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Objets de l&apos;échange</h2>

          <div className="flex items-center gap-4">
            {/* Objets proposés */}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                {isProposer ? 'Vos objets' : 'Objets proposés'}
              </p>
              <div className="space-y-2">
                {exchange.offeredItems.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                    <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.title || ''} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">{item.title || 'Sans titre'}</p>
                      <p className="text-sm text-gray-500">{item.city}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Flèche */}
            <div className="text-gray-400">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>

            {/* Objet demandé */}
            <div className="flex-1">
              <p className="text-sm text-gray-500 mb-2">
                {isProposer ? 'Objet demandé' : 'Votre objet'}
              </p>
              {exchange.requestedItem ? (
                <div className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-gray-200 rounded overflow-hidden">
                    {exchange.requestedItem.images && exchange.requestedItem.images.length > 0 ? (
                      <img
                        src={exchange.requestedItem.images[0]}
                        alt={exchange.requestedItem.title || ''}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">?</div>
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-gray-800">{exchange.requestedItem.title || 'Sans titre'}</p>
                    <p className="text-sm text-gray-500">{exchange.requestedItem.city}</p>
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg text-gray-500 italic">
                  Objet supprimé ou indisponible
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message */}
        {exchange.message && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Message</h2>
            <p className="text-gray-600">{exchange.message}</p>
          </div>
        )}

        {/* Message de réponse */}
        {exchange.responseMessage && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">Réponse</h2>
            <p className="text-gray-600">{exchange.responseMessage}</p>
          </div>
        )}

        {/* Actions */}
        {exchange.status === 'pending' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            {isReceiver ? (
              <>
                <h2 className="text-lg font-semibold text-gray-800 mb-4">Répondre à la proposition</h2>
                <textarea
                  value={responseMessage}
                  onChange={(e) => setResponseMessage(e.target.value)}
                  placeholder="Message (optionnel)..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-900 resize-none"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleAccept}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? '...' : 'Accepter'}
                  </button>
                  <button
                    onClick={handleRefuse}
                    disabled={isProcessing}
                    className="flex-1 py-2 px-4 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                  >
                    {isProcessing ? '...' : 'Refuser'}
                  </button>
                </div>
              </>
            ) : (
              <>
                <p className="text-gray-600 mb-4">En attente de la réponse de {otherUser.firstName}...</p>
                <button
                  onClick={handleCancel}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
                >
                  {isProcessing ? '...' : 'Annuler la proposition'}
                </button>
              </>
            )}
          </div>
        )}

        {/* Finaliser */}
        {exchange.status === 'accepted' && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Finaliser l&apos;échange</h2>
            <p className="text-gray-600 mb-4">
              Une fois que vous avez échangé les objets en personne, cliquez sur Finaliser.
            </p>
            <button
              onClick={handleComplete}
              disabled={isProcessing}
              className="w-full py-3 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? '...' : "Confirmer l'échange effectué"}
            </button>
          </div>
        )}

        {/* Formulaire d'avis */}
        {(exchange.status === 'completed' && showReviewForm) && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Noter {otherUser.firstName}
            </h2>

            {/* Étoiles */}
            <div className="flex gap-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => setRating(star)}
                  className={`text-3xl ${
                    star <= rating ? 'text-yellow-400' : 'text-gray-300'
                  }`}
                >
                  ★
                </button>
              ))}
            </div>

            <textarea
              value={reviewComment}
              onChange={(e) => setReviewComment(e.target.value)}
              placeholder="Commentaire (optionnel)..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 text-gray-900 resize-none"
              rows={3}
            />

            <button
              onClick={handleReview}
              disabled={isProcessing}
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
            >
              {isProcessing ? '...' : 'Envoyer mon avis'}
            </button>
          </div>
        )}

        {/* Contact */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Contact</h2>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-medium">
                {otherUser.firstName?.[0] || '?'}{otherUser.lastName?.[0] || ''}
              </span>
            </div>
            <div>
              <p className="font-medium text-gray-800">
                {otherUser.firstName} {otherUser.lastName}
              </p>
              {otherUser.city && (
                <p className="text-sm text-gray-500">{otherUser.city}</p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
