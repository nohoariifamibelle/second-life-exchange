"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getMyItemsCount } from "@/lib/items-api";
import { getPendingCount } from "@/lib/exchanges-api";

export default function DashboardPage() {
  const { user, accessToken, isLoading, isAuthenticated, logout } = useAuth();
  const router = useRouter();
  const [itemsCount, setItemsCount] = useState<number>(0);
  const [pendingExchangesCount, setPendingExchangesCount] = useState<number>(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/items" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
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
        <div className="bg-white rounded-lg shadow p-6">
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
      </main>
    </div>
  );
}
