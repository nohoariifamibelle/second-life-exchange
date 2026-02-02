"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserEcoImpact } from "@/lib/stats-api";
import {
  type UserEcoImpact,
  CATEGORY_LABELS,
  BADGE_CONFIG,
} from "@/schemas/stats";

export function EcoImpactCard() {
  const { accessToken } = useAuth();
  const [ecoImpact, setEcoImpact] = useState<UserEcoImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchEcoImpact() {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const data = await getUserEcoImpact(accessToken);
        setEcoImpact(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setLoading(false);
      }
    }

    fetchEcoImpact();
  }, [accessToken]);

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-green-200 rounded w-1/3 mb-4"></div>
        <div className="h-20 bg-green-200 rounded mb-4"></div>
        <div className="h-4 bg-green-200 rounded w-2/3"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6">
        <p className="text-red-600 text-sm">{error}</p>
      </div>
    );
  }

  if (!ecoImpact) {
    return null;
  }

  const badgeConfig = BADGE_CONFIG[ecoImpact.badge.level];

  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl shadow-lg overflow-hidden border border-green-200">
      {/* Header avec badge */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🌍</span>
            <div>
              <h3 className="text-white font-bold text-lg">Mon Impact Écologique</h3>
              <p className="text-green-100 text-sm">
                Merci de contribuer à l&apos;économie circulaire !
              </p>
            </div>
          </div>
          <div
            className={`px-4 py-2 rounded-full ${badgeConfig.bgColor} ${badgeConfig.color} font-semibold text-sm flex items-center gap-2`}
          >
            <span>{ecoImpact.badge.emoji}</span>
            <span>{badgeConfig.label}</span>
          </div>
        </div>
      </div>

      {/* Corps principal */}
      <div className="p-6">
        {/* Statistiques principales */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {/* CO2 économisé */}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-3xl mb-1">🌿</div>
            <p className="text-3xl font-bold text-green-700">
              {ecoImpact.co2Saved}
            </p>
            <p className="text-sm text-gray-600">kg CO2 économisés</p>
          </div>

          {/* Équivalent arbres */}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-3xl mb-1">🌳</div>
            <p className="text-3xl font-bold text-green-700">
              {ecoImpact.equivalentTrees}
            </p>
            <p className="text-sm text-gray-600">arbres plantés</p>
          </div>

          {/* Échanges */}
          <div className="bg-white rounded-xl p-4 text-center shadow-sm border border-green-100">
            <div className="text-3xl mb-1">🔄</div>
            <p className="text-3xl font-bold text-green-700">
              {ecoImpact.totalExchanges}
            </p>
            <p className="text-sm text-gray-600">échanges réalisés</p>
          </div>
        </div>

        {/* Message si pas d'échanges */}
        {ecoImpact.totalExchanges === 0 ? (
          <div className="bg-white rounded-xl p-6 text-center border border-green-100">
            <span className="text-5xl mb-4 block">🌱</span>
            <h4 className="font-semibold text-gray-800 mb-2">
              Commencez votre aventure écologique !
            </h4>
            <p className="text-gray-600 text-sm mb-4">
              Réalisez votre premier échange pour commencer à économiser du CO2
              et contribuer à l&apos;économie circulaire.
            </p>
            <Link
              href="/items"
              className="inline-block px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Découvrir les objets
            </Link>
          </div>
        ) : (
          <>
            {/* Détail par catégorie */}
            {ecoImpact.breakdown.length > 0 && (
              <div className="bg-white rounded-xl p-4 border border-green-100">
                <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <span>📊</span>
                  Répartition par catégorie
                </h4>
                <div className="space-y-2">
                  {ecoImpact.breakdown.slice(0, 5).map((item) => (
                    <div
                      key={item.category}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-gray-600">
                        {CATEGORY_LABELS[item.category] || item.category}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-500">
                          {item.count} objet{item.count > 1 ? "s" : ""}
                        </span>
                        <span className="text-sm font-semibold text-green-700">
                          {item.co2Saved} kg
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Message motivationnel */}
            <div className="mt-4 bg-green-100 rounded-xl p-4 border border-green-200">
              <p className="text-green-800 text-sm text-center">
                {getMotivationalMessage(ecoImpact.co2Saved)}
              </p>
            </div>
          </>
        )}
      </div>

      {/* Footer avec progression vers le prochain badge */}
      {ecoImpact.badge.level !== "hero" && (
        <div className="bg-white border-t border-green-100 px-6 py-4">
          <ProgressToNextBadge
            currentCo2={ecoImpact.co2Saved}
            currentLevel={ecoImpact.badge.level}
          />
        </div>
      )}
    </div>
  );
}

function ProgressToNextBadge({
  currentCo2,
  currentLevel,
}: {
  currentCo2: number;
  currentLevel: string;
}) {
  const thresholds: Record<string, { next: string; target: number }> = {
    beginner: { next: "actor", target: 10 },
    actor: { next: "champion", target: 50 },
    champion: { next: "hero", target: 100 },
  };

  const current = thresholds[currentLevel];
  if (!current) return null;

  const nextBadge = BADGE_CONFIG[current.next];
  const progress = Math.min((currentCo2 / current.target) * 100, 100);
  const remaining = Math.max(current.target - currentCo2, 0);

  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-gray-600">
          Progression vers <strong className={nextBadge.color}>{nextBadge.label}</strong>
        </span>
        <span className="text-sm text-gray-500">
          {remaining} kg restants
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2.5">
        <div
          className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

function getMotivationalMessage(co2Saved: number): string {
  if (co2Saved >= 100) {
    return "🎉 Incroyable ! Vous êtes un véritable héros de l'écologie. Continuez à inspirer les autres !";
  }
  if (co2Saved >= 50) {
    return "🌟 Félicitations ! Vous faites une vraie différence pour la planète. Continuez sur cette lancée !";
  }
  if (co2Saved >= 20) {
    return "👏 Bravo ! Chaque échange compte. Vous êtes sur la bonne voie !";
  }
  if (co2Saved >= 10) {
    return "🌿 Beau travail ! Vos efforts contribuent à un avenir plus durable.";
  }
  return "🌱 Chaque petit geste compte. Continuez à échanger pour faire grandir votre impact !";
}
