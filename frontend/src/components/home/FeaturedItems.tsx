"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { getItems } from "@/lib/items-api";
import { getThumbnailUrl } from "@/utils/cloudinary";
import { type Item } from "@/schemas/item";

export default function FeaturedItems() {
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const res = await getItems({ limit: 4 });
        setItems(res.items);
      } catch (error) {
        console.error("Erreur lors du chargement des objets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-24 animate-pulse" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow">
                <div className="aspect-square bg-gray-200 rounded-t-lg animate-pulse" />
                <div className="p-3">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (items.length === 0) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold mb-4">Objets récents</h2>
          <p className="text-gray-500 mb-6">
            Aucun objet disponible pour le moment.
          </p>
          <Link
            href="/items/new"
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors"
          >
            Soyez le premier à publier !
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold">Objets récents</h2>
          <Link
            href="/items"
            className="text-green-600 hover:text-green-700 font-medium"
          >
            Voir tout →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <Link
              key={item.id}
              href={`/items/${item.id}`}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow overflow-hidden"
            >
              <div className="aspect-square relative bg-gray-100">
                {item.images && item.images.length > 0 ? (
                  <Image
                    src={getThumbnailUrl(item.images[0])}
                    alt={item.title}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <span className="text-4xl">📦</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="font-medium truncate text-gray-800">
                  {item.title}
                </h3>
                <p className="text-sm text-gray-500">{item.owner?.city || "Non précisé"}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
