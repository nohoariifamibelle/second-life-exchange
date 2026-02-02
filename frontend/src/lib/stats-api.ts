import {
  userEcoImpactSchema,
  communityStatsSchema,
  type UserEcoImpact,
  type CommunityStats,
} from "@/schemas/stats";
import { apiErrorSchema } from "@/schemas/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Récupère l'impact écologique de l'utilisateur connecté
 * @param accessToken - Le token d'accès
 * @returns UserEcoImpact validé par Zod
 * @throws Error si la requête échoue
 */
export async function getUserEcoImpact(accessToken: string): Promise<UserEcoImpact> {
  const response = await fetch(`${API_URL}/stats/eco-impact`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Session expirée, veuillez vous reconnecter");
    }

    let jsonData;
    try {
      jsonData = await response.json();
    } catch {
      throw new Error(`Erreur serveur (${response.status}): ${response.statusText}`);
    }

    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(", ")
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors de la récupération de l'impact écologique");
  }

  const jsonData = await response.json();
  const result = userEcoImpactSchema.safeParse(jsonData);

  if (!result.success) {
    console.error("Erreur de validation eco-impact:", result.error);
    throw new Error("Format de réponse API invalide");
  }

  return result.data;
}

/**
 * Récupère les statistiques globales de la communauté
 * @returns CommunityStats validé par Zod
 * @throws Error si la requête échoue
 */
export async function getCommunityStats(): Promise<CommunityStats> {
  const response = await fetch(`${API_URL}/stats/community`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    let jsonData;
    try {
      jsonData = await response.json();
    } catch {
      throw new Error(`Erreur serveur (${response.status}): ${response.statusText}`);
    }

    const errorResult = apiErrorSchema.safeParse(jsonData);
    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(", ")
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors de la récupération des statistiques communauté");
  }

  const jsonData = await response.json();
  const result = communityStatsSchema.safeParse(jsonData);

  if (!result.success) {
    console.error("Erreur de validation community stats:", result.error);
    throw new Error("Format de réponse API invalide");
  }

  return result.data;
}
