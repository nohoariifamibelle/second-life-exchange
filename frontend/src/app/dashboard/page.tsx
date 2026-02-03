"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMyItemsCount } from "@/lib/items-api";
import { getPendingCount } from "@/lib/exchanges-api";
import { getSuggestions, ExchangeSuggestion, getCommunityTrends, CategoryTrend } from "@/lib/ai-api";
import { SuggestionCard } from "@/components/SuggestionCard";
import { TrendCard } from "@/components/TrendCard";

export default function DashboardPage() {
  const { user, accessToken, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [pendingExchangesCount, setPendingExchangesCount] = useState<number>(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);
  const [suggestions, setSuggestions] = useState<ExchangeSuggestion[]>([]);
  const [suggestionsMessage, setSuggestionsMessage] = useState<string>("");
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(true);
  const [trends, setTrends] = useState<CategoryTrend[]>([]);
  const [trendsMessage, setTrendsMessage] = useState<string>("");
  const [isLoadingTrends, setIsLoadingTrends] = useState(true);
  const [trendsWeek, setTrendsWeek] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted && !isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isMounted, isLoading, isAuthenticated, router]);

  // Charger les compteurs
  useEffect(() => {
    const loadCounts = async () => {
      if (!accessToken) return;

      // Charger les compteurs indépendamment pour éviter qu'un échec bloque tout
      const loadItemsCount = async () => {
        try {
          const count = await getMyItemsCount(accessToken);
          setItemsCount(count);
        } catch (error) {
          console.error("Erreur lors du comptage des objets:", error);
          setItemsCount(0);
        }
      };

      const loadPendingCount = async () => {
        try {
          const count = await getPendingCount(accessToken);
          setPendingExchangesCount(count);
        } catch (error) {
          console.error("Erreur lors du comptage des échanges:", error);
          setPendingExchangesCount(0);
        }
      };

      await Promise.all([loadItemsCount(), loadPendingCount()]);
      setIsLoadingCounts(false);
    };

    if (isAuthenticated && accessToken) {
      loadCounts();
    }
  }, [isAuthenticated, accessToken]);

  // Charger les suggestions IA
  useEffect(() => {
    const loadSuggestions = async () => {
      if (!accessToken) return;

      try {
        const response = await getSuggestions(accessToken);
        setSuggestions(response.suggestions);
        if (response.message) {
          setSuggestionsMessage(response.message);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des suggestions:", error);
        setSuggestionsMessage("Impossible de charger les suggestions");
      } finally {
        setIsLoadingSuggestions(false);
      }
    };

    if (isAuthenticated && accessToken) {
      loadSuggestions();
    }
  }, [isAuthenticated, accessToken]);

  // Charger les tendances communautaires
  useEffect(() => {
    const loadTrends = async () => {
      if (!accessToken) return;

      try {
        const response = await getCommunityTrends(accessToken);
        setTrends(response.trends);
        setTrendsWeek(response.weekNumber);
        if (response.message) {
          setTrendsMessage(response.message);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des tendances:", error);
        setTrendsMessage("Impossible de charger les tendances");
      } finally {
        setIsLoadingTrends(false);
      }
    };

    if (isAuthenticated && accessToken) {
      loadTrends();
    }
  }, [isAuthenticated, accessToken]);

  // Afficher le loader tant que le composant n'est pas monté ou que l'auth est en cours
  if (!isMounted || isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
            >
              Accueil
            </Link>
            <Link
              href="/discover"
              className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
            >
              Découverte
            </Link>
            <Link
              href="/items"
              className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
            >
              Objets
            </Link>
            <span className="text-gray-700">
              Bonjour, {user.firstName} {user.lastName}
            </span>
            <Link
              href="/profile"
              className="px-4 py-2 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
            >
              Mon profil
            </Link>
            <button
              onClick={logout}
              className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Déconnexion
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {/* Actions rapides */}
        <div className="flex flex-wrap gap-4 mb-8">
          <Link
            href="/items/new"
            className="px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            + Publier un objet
          </Link>
          <Link
            href="/items"
            className="px-6 py-3 bg-white border border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Parcourir les objets
          </Link>
        </div>

        {/* Statistiques */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Bienvenue sur votre tableau de bord
          </h2>
          <p className="text-gray-600 mb-6">
            Gérez vos objets, suivez vos échanges et découvrez de nouvelles opportunités.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              href="/items?my=true"
              className="bg-green-50 border border-green-200 rounded-lg p-4 hover:bg-green-100 transition-colors"
            >
              <h3 className="font-semibold text-green-800">Mes objets</h3>
              <p className="text-green-600 text-2xl font-bold">
                {isLoadingCounts ? "..." : itemsCount}
              </p>
              <p className="text-sm text-green-700">objets publiés</p>
            </Link>

            <Link
              href="/exchanges"
              className="bg-blue-50 border border-blue-200 rounded-lg p-4 hover:bg-blue-100 transition-colors relative"
            >
              <h3 className="font-semibold text-blue-800">Mes échanges</h3>
              <p className="text-blue-600 text-2xl font-bold">
                {isLoadingCounts ? "..." : pendingExchangesCount}
              </p>
              <p className="text-sm text-blue-700">proposition{pendingExchangesCount !== 1 ? "s" : ""} en attente</p>
              {pendingExchangesCount > 0 && (
                <span className="absolute top-2 right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
              )}
            </Link>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <h3 className="font-semibold text-purple-800">Messages</h3>
              <p className="text-purple-600 text-2xl font-bold">0</p>
              <p className="text-sm text-purple-700">messages non lus</p>
            </div>
          </div>
        </div>

        {/* Section mes objets récents */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-800">Mes objets récents</h3>
            <Link
              href="/items?my=true"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Voir tous →
            </Link>
          </div>

          {itemsCount === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">Vous n&apos;avez pas encore publié d&apos;objet</p>
              <Link
                href="/items/new"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Publier mon premier objet
              </Link>
            </div>
          ) : (
            <p className="text-gray-500">
              Vous avez {itemsCount} objet{itemsCount > 1 ? "s" : ""} publié{itemsCount > 1 ? "s" : ""}.
            </p>
          )}
        </div>

        {/* Section Tendances Communautaires */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Tendances de la communauté</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-green-100 text-green-700 rounded-full">
                Semaine {trendsWeek}
              </span>
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                IA
              </span>
            </div>
          </div>

          {isLoadingTrends ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-gray-500">Analyse des tendances en cours...</p>
              </div>
            </div>
          ) : trends.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <p className="text-gray-500">
                {trendsMessage || "Pas de tendances disponibles pour le moment"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {trends.map((trend) => (
                <TrendCard key={trend.category} trend={trend} />
              ))}
            </div>
          )}
        </div>

        {/* Section suggestions d'échanges IA */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800">Suggestions d&apos;échanges</h3>
              <span className="px-2 py-0.5 text-xs font-medium bg-purple-100 text-purple-700 rounded-full">
                IA
              </span>
            </div>
          </div>

          {isLoadingSuggestions ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-green-600"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                <p className="text-gray-500">Analyse de vos objets en cours...</p>
              </div>
            </div>
          ) : suggestions.length === 0 ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="w-12 h-12 mx-auto text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
              </div>
              <p className="text-gray-500 mb-2">
                {suggestionsMessage || "Aucune suggestion disponible pour le moment"}
              </p>
              {itemsCount === 0 && (
                <Link
                  href="/items/new"
                  className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors mt-4"
                >
                  Publier un objet pour recevoir des suggestions
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((suggestion, index) => (
                <SuggestionCard key={index} suggestion={suggestion} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
