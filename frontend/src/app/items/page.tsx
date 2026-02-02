"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { getThumbnailUrl } from "@/utils/cloudinary";
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
import { useDebounce, useIsDebouncing } from "@/hooks/useDebounce";

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

  // Fix hydration mismatch : attendre le montage côté client
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filtres
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [city, setCity] = useState(searchParams.get("city") || "");
  const [search, setSearch] = useState(searchParams.get("search") || "");

  // Debounce des champs texte (400ms) pour éviter les requêtes API excessives
  const debouncedSearch = useDebounce(search, 400);
  const debouncedCity = useDebounce(city, 400);

  // Indicateur de saisie en cours
  const isTypingSearch = useIsDebouncing(search, debouncedSearch);
  const isTypingCity = useIsDebouncing(city, debouncedCity);
  const isTyping = isTypingSearch || isTypingCity;

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
          // Utilise les valeurs débouncées pour les champs texte
          const params: ItemsQueryParams = {
            page: currentPage,
            limit: 12,
          };

          if (category) params.category = category;
          if (condition) params.condition = condition;
          if (debouncedCity) params.city = debouncedCity;
          if (debouncedSearch) params.search = debouncedSearch;

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
  }, [currentPage, category, condition, debouncedCity, debouncedSearch, isMyItemsMode, accessToken]);

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
            {isMounted && isAuthenticated ? (
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
            ) : isMounted ? (
              <Link
                href="/login"
                className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Se connecter
              </Link>
            ) : null}
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
              <div className="relative">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Mot-clé..."
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                {isTypingSearch && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
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
              <div className="relative">
                <input
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Ex: Paris..."
                  className="w-full px-3 py-2 pr-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                />
                {isTypingCity && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                )}
              </div>
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
        {isLoading || isTyping ? (
          <div className="text-center py-12">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
              <div className="text-lg text-gray-600">
                {isTyping ? "Recherche en cours..." : "Chargement..."}
              </div>
            </div>
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
            {isMounted && isAuthenticated && (
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
                      <Image
                        src={getThumbnailUrl(item.images[0])}
                        alt={item.title}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                        loading="lazy"
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
