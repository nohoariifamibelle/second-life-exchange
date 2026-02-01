"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { getItems, getMyItems, type ItemsQueryParams } from "@/lib/items-api";
import {
  type Item,
  type Pagination,
  categoryLabels,
  conditionLabels,
  type ItemCategoryType,
  type ItemConditionType,
} from "@/schemas/item";
import { useAuth } from "@/contexts/AuthContext";

export default function ItemsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-gray-50"><div className="text-lg text-gray-600">Chargement...</div></div>}>
      <ItemsPageContent />
    </Suspense>
  );
}

function ItemsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, accessToken } = useAuth();

  // Mode "Mes objets" si le paramètre my=true est présent
  const isMyItemsMode = searchParams.get("my") === "true";

  const [items, setItems] = useState<Item[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  const currentPage = parseInt(searchParams.get("page") || "1", 10);

  // Rediriger vers la connexion si "Mes objets" sans être authentifié
  useEffect(() => {
    if (isMyItemsMode && !isAuthenticated) {
      router.push("/login?redirect=/items?my=true");
    }
  }, [isMyItemsMode, isAuthenticated, router]);

  // Charger les objets
  useEffect(() => {
    // Ne pas charger si on attend une redirection vers login
    if (isMyItemsMode && !accessToken) {
      return;
    }

    const loadItems = async () => {
      setIsLoading(true);
      setError(null);

      try {
        let result;

        if (isMyItemsMode && accessToken) {
          // Mode "Mes objets" : charger uniquement mes objets
          result = await getMyItems(accessToken, currentPage, 12);
        } else {
          // Mode normal : charger tous les objets avec filtres
          const params: ItemsQueryParams = {
            page: currentPage,
            limit: 12,
          };

          if (category) params.category = category;
          if (condition) params.condition = condition;
          if (city) params.city = city;
          if (search) params.search = search;

          result = await getItems(params);
        }

        setItems(result.items);
        setPagination(result.pagination);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    loadItems();
  }, [currentPage, category, condition, city, search, isMyItemsMode, accessToken]);

  // Appliquer les filtres
  const applyFilters = () => {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (condition) params.set("condition", condition);
    if (city) params.set("city", city);
    if (search) params.set("search", search);
    params.set("page", "1");

    router.push(`/items?${params.toString()}`);
  };

  // Réinitialiser les filtres
  const resetFilters = () => {
    setCategory("");
    setCondition("");
    setCity("");
    setSearch("");
    router.push("/items");
  };

  // Changer de page
  const changePage = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", newPage.toString());
    router.push(`/items?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link
                  href="/items/new"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  + Ajouter un objet
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Mon espace
                </Link>
              </>
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

      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-800">
            {isMyItemsMode ? "Mes objets" : "Objets disponibles"}
          </h1>
          {isMyItemsMode && (
            <Link
              href="/items"
              className="text-green-600 hover:text-green-700 text-sm font-medium"
            >
              Voir tous les objets
            </Link>
          )}
        </div>

        {/* Filtres (masqués en mode "Mes objets") */}
        {!isMyItemsMode && (
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Recherche */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recherche
              </label>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Mot-clé..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Catégorie
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Toutes</option>
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* État */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                État
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              >
                <option value="">Tous</option>
                {Object.entries(conditionLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            {/* Ville */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Ex: Paris..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
              />
            </div>

            {/* Boutons */}
            <div className="flex items-end gap-2">
              <button
                onClick={applyFilters}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Filtrer
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Reset
              </button>
            </div>
          </div>
        </div>
        )}

        {/* Contenu */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-lg text-gray-600">Chargement...</div>
          </div>
        ) : error ? (
          <div className="text-center py-12">
            <div className="text-lg text-red-600">{error}</div>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 mb-4">
              {isMyItemsMode ? "Vous n'avez pas encore publié d'objet" : "Aucun objet trouvé"}
            </p>
            {isAuthenticated && (
              <Link
                href="/items/new"
                className="inline-block px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                {isMyItemsMode ? "Publier mon premier objet" : "Publiez le premier objet !"}
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Grille d'objets */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {items.map((item) => (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
                >
                  {/* Image */}
                  <div className="aspect-square bg-gray-100 relative">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <svg
                          className="w-16 h-16"
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
                    {/* Badge catégorie */}
                    <span className="absolute top-2 left-2 px-2 py-1 bg-green-600 text-white text-xs rounded">
                      {categoryLabels[item.category as ItemCategoryType] || item.category}
                    </span>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    <h3 className="font-semibold text-gray-800 truncate">{item.title}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {conditionLabels[item.condition as ItemConditionType] || item.condition}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-sm text-gray-600">
                        {item.city} ({item.postalCode})
                      </span>
                      <span className="text-xs text-gray-400">{item.viewCount} vues</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  onClick={() => changePage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
                >
                  Précédent
                </button>
                <span className="px-4 py-2 text-gray-700">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <button
                  onClick={() => changePage(currentPage + 1)}
                  disabled={currentPage === pagination.totalPages}
                  className="px-4 py-2 bg-white border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-700"
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
