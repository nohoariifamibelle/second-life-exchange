"use client";

import Link from "next/link";
import { CategoryTrend, TrendStatus } from "@/lib/ai-api";

interface TrendCardProps {
  trend: CategoryTrend;
}

const statusConfig: Record<
  TrendStatus,
  { label: string; bgColor: string; textColor: string; icon: string }
> = {
  hot: {
    label: "Forte demande",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
    icon: "🔥",
  },
  rising: {
    label: "En hausse",
    bgColor: "bg-orange-100",
    textColor: "text-orange-700",
    icon: "📈",
  },
  stable: {
    label: "Stable",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
    icon: "📊",
  },
};

const categoryIcons: Record<string, string> = {
  electronics: "📱",
  clothing: "👕",
  furniture: "🪑",
  books: "📚",
  sports: "⚽",
  toys: "🎮",
  other: "📦",
};

export function TrendCard({ trend }: TrendCardProps) {
  const status = statusConfig[trend.status];
  const icon = categoryIcons[trend.category] || "📦";

  const getScoreColor = (score: number) => {
    if (score >= 70) return "bg-green-500";
    if (score >= 40) return "bg-yellow-500";
    return "bg-gray-400";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border-l-4 border-green-500">
      <div className="p-4">
        {/* Header avec catégorie et statut */}
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{icon}</span>
            <h3 className="font-semibold text-gray-800">{trend.categoryLabel}</h3>
          </div>
          <span
            className={`px-2 py-1 text-xs font-medium rounded-full ${status.bgColor} ${status.textColor}`}
          >
            {status.icon} {status.label}
          </span>
        </div>

        {/* Score de tendance */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Score de tendance</span>
            <span className="text-sm font-bold text-gray-700">
              {trend.trendScore}/100
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(trend.trendScore)}`}
              style={{ width: `${trend.trendScore}%` }}
            />
          </div>
        </div>

        {/* Description IA */}
        <p className="text-sm text-gray-600 mb-3">{trend.aiDescription}</p>

        {/* Statistiques */}
        <div className="grid grid-cols-3 gap-2 text-center text-xs mb-3">
          <div className="bg-gray-50 rounded p-2">
            <p className="font-bold text-gray-700">{trend.recentExchanges}</p>
            <p className="text-gray-500">échanges</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="font-bold text-gray-700">{trend.recentRequests}</p>
            <p className="text-gray-500">demandes</p>
          </div>
          <div className="bg-gray-50 rounded p-2">
            <p className="font-bold text-gray-700">{trend.availableItems}</p>
            <p className="text-gray-500">disponibles</p>
          </div>
        </div>

        {/* Recommandation IA */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
          <p className="text-sm text-green-700 font-medium">
            {trend.aiRecommendation}
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex gap-2">
          <Link
            href={`/items?category=${trend.category}`}
            className="flex-1 text-center px-3 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
          >
            Voir les objets
          </Link>
          {trend.status === "hot" && (
            <Link
              href="/items/new"
              className="flex-1 text-center px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
            >
              Proposer le mien
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
