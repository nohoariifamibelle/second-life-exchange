"use client";

import { useState, useEffect } from "react";

interface EcoTip {
  icon: string;
  title: string;
  description: string;
}

// Conseils de secours si l'API échoue
const fallbackTips: EcoTip[] = [
  {
    icon: "🔧",
    title: "Réparer avant de jeter",
    description:
      "Beaucoup d'objets peuvent être réparés. Consultez des tutoriels en ligne.",
  },
  {
    icon: "🔄",
    title: "Échanger plutôt qu'acheter",
    description:
      "Avant d'acheter neuf, vérifiez si quelqu'un propose l'objet en échange.",
  },
  {
    icon: "📦",
    title: "Donner une seconde vie",
    description:
      "Un objet inutilisé peut faire le bonheur de quelqu'un d'autre.",
  },
  {
    icon: "🌱",
    title: "Privilégier la qualité",
    description:
      "Un objet de qualité dure plus longtemps et peut être échangé plusieurs fois.",
  },
];

function TipsSkeleton() {
  return (
    <section className="py-16">
      <div className="h-8 bg-gray-200 rounded w-64 mx-auto mb-2 animate-pulse" />
      <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8 animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl p-6 shadow-md">
            <div className="h-12 w-12 bg-gray-200 rounded-full mb-4 animate-pulse" />
            <div className="h-5 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-full animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-2/3 mt-1 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default function TipsSection() {
  const [tips, setTips] = useState<EcoTip[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/ai/eco-tips`
        );
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setTips(data.tips);
      } catch {
        setError(true);
        setTips(fallbackTips);
      } finally {
        setLoading(false);
      }
    };

    fetchTips();
  }, []);

  if (loading) return <TipsSkeleton />;

  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-center mb-2 text-gray-900">
        Conseils Pratiques
      </h2>
      <p className="text-center text-gray-500 mb-8">
        Générés par notre IA pour vous inspirer
        {error && (
          <span className="text-orange-500 ml-1">(mode hors-ligne)</span>
        )}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {tips.map((tip, index) => (
          <div
            key={index}
            className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100"
          >
            <span className="text-4xl mb-4 block">{tip.icon}</span>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {tip.title}
            </h3>
            <p className="text-gray-600 text-sm">{tip.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
