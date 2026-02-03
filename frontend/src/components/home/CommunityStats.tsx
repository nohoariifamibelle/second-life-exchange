"use client";

import { useState, useEffect } from "react";
import { getCommunityStats } from "@/lib/stats-api";
import { type CommunityStats as CommunityStatsType } from "@/schemas/stats";

interface CommunityStatsProps {
  onStatsLoaded?: (stats: CommunityStatsType) => void;
}

export default function CommunityStats({ onStatsLoaded }: CommunityStatsProps) {
  const [stats, setStats] = useState<CommunityStatsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getCommunityStats();
        setStats(data);
        onStatsLoaded?.(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [onStatsLoaded]);

  if (loading) {
    return (
      <section className="py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white">
          <div className="h-8 bg-white/20 rounded w-64 mx-auto mb-8 animate-pulse" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="text-center">
                <div className="h-12 bg-white/20 rounded w-24 mx-auto mb-2 animate-pulse" />
                <div className="h-4 bg-white/20 rounded w-32 mx-auto animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error || !stats) {
    return (
      <section className="py-16">
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white text-center">
          <h2 className="text-2xl font-bold mb-4">Notre Impact Collectif</h2>
          <p className="text-green-100">
            Les statistiques sont temporairement indisponibles
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16">
      <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-8 text-white shadow-xl">
        <h2 className="text-2xl font-bold text-center mb-8">
          Notre Impact Collectif
        </h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold mb-1">
              {stats.totalUsers}
            </div>
            <div className="text-green-100 text-sm">Membres actifs</div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold mb-1">
              {stats.totalExchanges}
            </div>
            <div className="text-green-100 text-sm">Échanges réalisés</div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold mb-1">
              {stats.totalCo2Saved} kg
            </div>
            <div className="text-green-100 text-sm">CO2 économisé</div>
          </div>

          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm">
            <div className="text-3xl md:text-4xl font-bold mb-1">
              🌳 {stats.equivalentTrees}
            </div>
            <div className="text-green-100 text-sm">Arbres équivalents</div>
          </div>
        </div>

        <p className="text-center text-green-100 mt-6 text-sm">
          Ensemble, nous faisons la différence pour la planète !
        </p>
      </div>
    </section>
  );
}
