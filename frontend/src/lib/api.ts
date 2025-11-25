import {
  type RegisterFormData,
  userSchema,
  type User,
  apiErrorSchema
} from "@/schemas/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

/**
 * Enregistre un nouvel utilisateur
 * @param data - Données du formulaire d'inscription validées par Zod
 * @returns User validé par Zod
 * @throws Error avec message d'erreur de l'API
 */
export async function registerUser(data: RegisterFormData): Promise<User> {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    // Valider l'erreur API avec Zod
    const errorResult = apiErrorSchema.safeParse(jsonData);

    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(", ")
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors de l'inscription");
  }

  // Valider la réponse utilisateur avec Zod
  const userResult = userSchema.safeParse(jsonData);

  if (!userResult.success) {
    console.error("Erreur de validation de la réponse API:", userResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return userResult.data;
}
