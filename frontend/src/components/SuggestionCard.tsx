"use client";

import Link from "next/link";
import Image from "next/image";
import { ExchangeSuggestion } from "@/lib/ai-api";

interface SuggestionCardProps {
  suggestion: ExchangeSuggestion;
}

const categoryLabels: Record<string, string> = {
  electronics: "Électronique",
  clothing: "Vêtements",
  furniture: "Meubles",
  books: "Livres",
  sports: "Sports",
  toys: "Jouets",
  other: "Autre",
};

export function SuggestionCard({ suggestion }: SuggestionCardProps) {
  const { userItem, suggestedItem, matchScore, reason } = suggestion;

  const getScoreColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-orange-500";
  };

  const getScoreTextColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-orange-600";
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="p-4">
        {/* Images côte à côte */}
        <div className="flex items-center gap-4 mb-4">
          {/* Image de l'objet de l'utilisateur */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1 text-center">Votre objet</p>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {userItem.images.length > 0 ? (
                <Image
                  src={userItem.images[0]}
                  alt={userItem.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-8 h-8"
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
            </div>
            <p className="text-sm font-medium text-gray-800 mt-1 text-center truncate">
              {userItem.title}
            </p>
          </div>

          {/* Flèche d'échange */}
          <div className="flex flex-col items-center">
            <svg
              className="w-6 h-6 text-green-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </div>

          {/* Image de l'objet suggéré */}
          <div className="flex-1">
            <p className="text-xs text-gray-500 mb-1 text-center">Objet proposé</p>
            <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {suggestedItem.images.length > 0 ? (
                <Image
                  src={suggestedItem.images[0]}
                  alt={suggestedItem.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <svg
                    className="w-8 h-8"
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
            </div>
            <p className="text-sm font-medium text-gray-800 mt-1 text-center truncate">
              {suggestedItem.title}
            </p>
          </div>
        </div>

        {/* Score de match */}
        <div className="mb-3">
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs text-gray-500">Compatibilité</span>
            <span className={`text-sm font-bold ${getScoreTextColor(matchScore)}`}>
              {matchScore}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getScoreColor(matchScore)}`}
              style={{ width: `${matchScore}%` }}
            />
          </div>
        </div>

        {/* Raison de l'IA */}
        <p className="text-sm text-gray-600 mb-3 italic">&quot;{reason}&quot;</p>

        {/* Informations sur le propriétaire */}
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <span>
            {categoryLabels[suggestedItem.category] || suggestedItem.category}
          </span>
          <span>
            {suggestedItem.owner.firstName} - {suggestedItem.owner.city}
          </span>
        </div>

        {/* Bouton d'action */}
        <Link
          href={`/items/${suggestedItem.id}/exchange`}
          className="block w-full text-center px-4 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          Proposer l&apos;échange
        </Link>
      </div>
    </div>
  );
}
