"use client";

import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CtaSection() {
  const { isAuthenticated } = useAuth();

  return (
    <section className="py-16 text-center">
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-2xl p-12 border border-green-200">
        <h2 className="text-3xl font-bold text-gray-900 mb-4">
          Prêt à faire la différence ?
        </h2>
        <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
          Rejoignez notre communauté d&apos;échangeurs et contribuez à un avenir
          plus durable. Chaque objet échangé est un pas vers une consommation
          plus responsable.
        </p>
        {isAuthenticated ? (
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/items"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Parcourir les objets
            </Link>
            <Link
              href="/profile"
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors border-2 border-green-600"
            >
              Voir mon impact
            </Link>
          </div>
        ) : (
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="px-8 py-3 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors shadow-lg"
            >
              Rejoindre la communauté
            </Link>
            <Link
              href="/items"
              className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors border-2 border-green-600"
            >
              Découvrir les objets
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
