"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

interface HeroSectionProps {
  totalUsers?: number;
}

export default function HeroSection({ totalUsers }: HeroSectionProps) {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-20 bg-gradient-to-b from-green-50 to-white">
      <div className="max-w-4xl mx-auto text-center px-4">
        <span className="text-6xl mb-6 block">♻️</span>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
          Échangez vos objets,
          <br />
          <span className="text-green-600">préservez la planète</span>
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez la communauté Second Life Exchange et donnez une seconde vie
          à vos objets. Chaque échange compte pour l&apos;environnement.
        </p>

        {/* CTA adaptatif */}
        {isAuthenticated ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/items"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Parcourir les objets
            </Link>
            <Link
              href="/items/new"
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors border-2 border-green-600"
            >
              Publier un objet
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Créer un compte gratuit
            </Link>
            <Link
              href="/items"
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors border-2 border-green-600"
            >
              Voir les objets
            </Link>
          </div>
        )}

        {/* Social proof */}
        <p className="mt-6 text-sm text-gray-500">
          Déjà {totalUsers || "100+"} membres actifs
        </p>
      </div>
    </section>
  );
}
