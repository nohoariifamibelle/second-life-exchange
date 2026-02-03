"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import {
  CommunityStats,
  TipsSection,
  EcoFacts,
  VideoSection,
} from "@/components/home";

export default function DiscoverPage() {
  const { isAuthenticated, isLoading, logout } = useAuth();
  const [isMounted, setIsMounted] = useState(false);

  // Éviter les erreurs d'hydratation en attendant le montage côté client
  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler
    setIsMounted(true);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-green-600">
            ♻️ Second Life Exchange
          </Link>
          <nav className="flex items-center gap-4">
            {isMounted && isAuthenticated ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
                >
                  Mon espace
                </Link>
                <Link
                  href="/profile"
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
                >
                  Mon profil
                </Link>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/"
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
                >
                  Accueil
                </Link>
                <Link
                  href="/items"
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
                >
                  Objets
                </Link>
                <Link
                  href="/login"
                  className="text-gray-600 hover:text-green-600 transition-colors text-sm font-medium"
                >
                  Connexion
                </Link>
                <Link
                  href="/register"
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                >
                  Inscription
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="py-16 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <span className="text-6xl mb-6 block">🌍</span>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Découverte Écologique
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprendre l&apos;économie circulaire et l&apos;impact positif de
            vos échanges sur l&apos;environnement. Chaque geste compte.
          </p>
        </div>
      </section>

      {/* Contenu principal */}
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        {/* Statistiques communautaires */}
        <CommunityStats />

        {/* Section éducative */}
        <section className="py-16">
          <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🔄 Qu&apos;est-ce que l&apos;économie circulaire ?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <p className="text-gray-600 mb-4">
                  L&apos;économie circulaire est un modèle économique qui vise à{" "}
                  <strong>réduire le gaspillage</strong> et à{" "}
                  <strong>optimiser l&apos;utilisation des ressources</strong>.
                  Contrairement au modèle linéaire traditionnel (extraire,
                  fabriquer, jeter), l&apos;économie circulaire cherche à créer
                  des boucles vertueuses.
                </p>
                <p className="text-gray-600 mb-4">
                  En échangeant vos objets plutôt que de les jeter, vous
                  participez activement à cette transition. Chaque objet qui
                  trouve un nouveau propriétaire, c&apos;est :
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Des ressources naturelles préservées
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Des émissions de CO2 évitées
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Des déchets en moins dans les décharges
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-green-600">✓</span>
                    Du lien social créé dans votre communauté
                  </li>
                </ul>
              </div>
              <div className="bg-green-50 rounded-xl p-6">
                <h3 className="font-semibold text-gray-900 mb-4">
                  Les 3R de l&apos;économie circulaire
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      1
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Réduire</h4>
                      <p className="text-sm text-gray-600">
                        Consommer moins et mieux
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      2
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Réutiliser</h4>
                      <p className="text-sm text-gray-600">
                        Donner une seconde vie aux objets
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="w-10 h-10 bg-green-600 text-white rounded-full flex items-center justify-center font-bold">
                      3
                    </span>
                    <div>
                      <h4 className="font-semibold text-gray-900">Recycler</h4>
                      <p className="text-sm text-gray-600">
                        Transformer les matériaux en fin de vie
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Conseils IA */}
        <TipsSection />

        {/* Faits écologiques */}
        <EcoFacts />

        {/* Vidéos */}
        <VideoSection />

        {/* CTA */}
        <section className="py-16">
          <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl p-12 text-white text-center">
            {isMounted && isAuthenticated ? (
              <>
                <h2 className="text-3xl font-bold mb-4">
                  Continuez à agir pour la planète !
                </h2>
                <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                  Publiez vos objets ou parcourez ceux de la communauté.
                  Chaque échange compte pour un avenir plus durable.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/items/new"
                    className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-lg"
                  >
                    Publier un objet
                  </Link>
                  <Link
                    href="/dashboard"
                    className="px-8 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-colors border-2 border-white/50"
                  >
                    Mon tableau de bord
                  </Link>
                </div>
              </>
            ) : (
              <>
                <h2 className="text-3xl font-bold mb-4">
                  Prêt à agir pour la planète ?
                </h2>
                <p className="text-green-100 mb-8 max-w-2xl mx-auto">
                  Rejoignez Second Life Exchange et commencez à échanger vos objets.
                  Chaque échange compte pour un avenir plus durable.
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link
                    href="/register"
                    className="px-8 py-3 bg-white text-green-600 font-semibold rounded-lg hover:bg-green-50 transition-colors shadow-lg"
                  >
                    Créer mon compte
                  </Link>
                  <Link
                    href="/items"
                    className="px-8 py-3 bg-transparent text-white font-semibold rounded-lg hover:bg-white/10 transition-colors border-2 border-white/50"
                  >
                    Voir les objets
                  </Link>
                </div>
              </>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-8">
        <div className="max-w-7xl mx-auto px-4 text-center text-gray-500 text-sm">
          <p>
            Second Life Exchange - Plateforme d&apos;échange pour une économie
            circulaire
          </p>
          <div className="flex justify-center gap-6 mt-4">
            <Link href="/cgu" className="hover:text-green-600 transition-colors">
              CGU
            </Link>
            <Link
              href="/politique-confidentialite"
              className="hover:text-green-600 transition-colors"
            >
              Politique de confidentialité
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
