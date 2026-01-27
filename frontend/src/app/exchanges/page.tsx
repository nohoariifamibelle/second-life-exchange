"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getExchanges } from "@/lib/exchanges-api";
import {
  type Exchange,
  statusLabels,
  statusColors,
  type ExchangeStatusType,
} from "@/schemas/exchange";

export default function ExchangesPage() {
  const { user, accessToken, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();

  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [isLoadingExchanges, setIsLoadingExchanges] = useState(true);

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Charger les échanges
  useEffect(() => {
    const loadExchanges = async () => {
      if (!accessToken) return;

      setIsLoadingExchanges(true);
      try {
        const type = filter === 'all' ? undefined : filter;
        const data = await getExchanges(accessToken, type);
        setExchanges(data);
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setIsLoadingExchanges(false);
      }
    };

    if (isAuthenticated && accessToken) {
      loadExchanges();
    }
  }, [isAuthenticated, accessToken, filter]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Déterminer le rôle de l'utilisateur dans un échange
  const getUserRole = (exchange: Exchange) => {
    if (exchange.proposer.id === user.id) return 'proposer';
    return 'receiver';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Mon espace
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Mes échanges</h1>
        </div>

        {/* Filtres */}
        <div className="flex gap-2 mb-6">
          {(['all', 'received', 'sent'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === f
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {f === 'all' ? 'Tous' : f === 'received' ? 'Reçus' : 'Envoyés'}
            </button>
          ))}
        </div>

        {/* Liste */}
        {isLoadingExchanges ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        ) : exchanges.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-500 mb-4">Aucun échange pour le moment</p>
            <Link
              href="/items"
              className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Parcourir les objets
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {exchanges.map((exchange) => {
              const role = getUserRole(exchange);
              const otherUser = role === 'proposer' ? exchange.receiver : exchange.proposer;

              return (
                <Link
                  key={exchange.id}
                  href={`/exchanges/${exchange.id}`}
                  className="block bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start gap-4">
                    {/* Images des objets */}
                    <div className="flex -space-x-2">
                      {exchange.offeredItems.slice(0, 2).map((item, idx) => (
                        <div
                          key={idx}
                          className="w-16 h-16 bg-gray-100 rounded-lg border-2 border-white overflow-hidden"
                        >
                          {item.images && item.images.length > 0 ? (
                            <img
                              src={item.images[0]}
                              alt={item.title || ''}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                              ?
                            </div>
                          )}
                        </div>
                      ))}
                      {exchange.offeredItems.length > 2 && (
                        <div className="w-16 h-16 bg-gray-200 rounded-lg border-2 border-white flex items-center justify-center text-gray-600 text-sm font-medium">
                          +{exchange.offeredItems.length - 2}
                        </div>
                      )}
                    </div>

                    {/* Flèche */}
                    <div className="flex items-center justify-center w-8 h-16 text-gray-400">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </div>

                    {/* Objet demandé */}
                    <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden">
                      {exchange.requestedItem.images && exchange.requestedItem.images.length > 0 ? (
                        <img
                          src={exchange.requestedItem.images[0]}
                          alt={exchange.requestedItem.title || ''}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                          ?
                        </div>
                      )}
                    </div>

                    {/* Infos */}
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded ${
                            statusColors[exchange.status as ExchangeStatusType] || 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {statusLabels[exchange.status as ExchangeStatusType] || exchange.status}
                        </span>
                        <span className="text-sm text-gray-500">
                          {role === 'proposer' ? 'Envoyé à' : 'Reçu de'}{' '}
                          <span className="font-medium text-gray-700">
                            {otherUser.firstName} {otherUser.lastName}
                          </span>
                        </span>
                      </div>

                      <p className="text-gray-800 font-medium">
                        {exchange.offeredItems.length} objet{exchange.offeredItems.length > 1 ? 's' : ''} proposé{exchange.offeredItems.length > 1 ? 's' : ''}{' '}
                        contre &quot;{exchange.requestedItem.title}&quot;
                      </p>

                      <p className="text-sm text-gray-500 mt-1">
                        {new Date(exchange.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        })}
                      </p>
                    </div>

                    {/* Indicateur d'action requise */}
                    {exchange.status === 'pending' && role === 'receiver' && (
                      <div className="flex items-center">
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 text-sm font-medium rounded-full">
                          Action requise
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
