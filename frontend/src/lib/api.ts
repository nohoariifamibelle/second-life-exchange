import {
  type RegisterFormData,
  type LoginFormData,
  userSchema,
  type User,
  apiErrorSchema,
  loginResponseSchema,
  type LoginResponse,
  profileSchema,
  type Profile,
  type UpdateProfileFormData,
  type UpdatePasswordFormData,
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

  // Gérer les erreurs HTTP sans corps JSON (ex: 405, 502)
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

    throw new Error("Erreur lors de l'inscription");
  }

  const jsonData = await response.json();

  // Valider la réponse utilisateur avec Zod
  const userResult = userSchema.safeParse(jsonData);

  if (!userResult.success) {
    console.error("Erreur de validation de la réponse API:", userResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return userResult.data;
}

/**
 * Connecte un utilisateur
 * @param data - Données du formulaire de connexion validées par Zod
 * @returns LoginResponse validée par Zod (accessToken, refreshToken, user)
 * @throws Error avec message d'erreur de l'API
 */
export async function loginUser(data: LoginFormData): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  // Gérer les erreurs HTTP sans corps JSON (ex: 405, 502)
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

    throw new Error("Erreur lors de la connexion");
  }

  const jsonData = await response.json();

  const loginResult = loginResponseSchema.safeParse(jsonData);

  if (!loginResult.success) {
    console.error("Erreur de validation de la réponse API:", loginResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return loginResult.data;
}

/**
 * Rafraîchit le token d'accès
 * @param refreshToken - Le refresh token actuel
 * @returns Nouveau access token
 * @throws Error si le refresh échoue
 */
export async function refreshAccessToken(refreshToken: string): Promise<string> {
  const response = await fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Session expirée, veuillez vous reconnecter");
  }

  const data = await response.json();
  return data.accessToken;
}

/**
 * Récupère le profil de l'utilisateur connecté
 * @param accessToken - Le token d'accès
 * @returns Profile validé par Zod
 * @throws Error si la requête échoue
 */
export async function getProfile(accessToken: string): Promise<Profile> {
  const response = await fetch(`${API_URL}/users/me`, {
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
    const errorData = await response.json().catch(() => ({}));
    console.error("Erreur API /users/me:", response.status, errorData);
    throw new Error(errorData.message || "Erreur lors de la récupération du profil");
  }

  const jsonData = await response.json();
  const profileResult = profileSchema.safeParse(jsonData);

  if (!profileResult.success) {
    console.error("Erreur de validation du profil:", profileResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return profileResult.data;
}

/**
 * Met à jour le profil de l'utilisateur connecté
 * @param accessToken - Le token d'accès
 * @param data - Les données à mettre à jour
 * @returns Profile mis à jour
 * @throws Error si la requête échoue
 */
export async function updateProfile(
  accessToken: string,
  data: UpdateProfileFormData
): Promise<Profile> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorResult = apiErrorSchema.safeParse(jsonData);

    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(", ")
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors de la mise à jour du profil");
  }

  const profileResult = profileSchema.safeParse(jsonData);

  if (!profileResult.success) {
    console.error("Erreur de validation du profil:", profileResult.error);
    throw new Error("Format de réponse API invalide");
  }

  return profileResult.data;
}

/**
 * Change le mot de passe de l'utilisateur connecté
 * @param accessToken - Le token d'accès
 * @param data - Mot de passe actuel et nouveau
 * @throws Error si la requête échoue
 */
export async function updatePassword(
  accessToken: string,
  data: Omit<UpdatePasswordFormData, "confirmPassword">
): Promise<void> {
  const response = await fetch(`${API_URL}/users/me/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const jsonData = await response.json();
    const errorResult = apiErrorSchema.safeParse(jsonData);

    if (errorResult.success) {
      const errorMessage = Array.isArray(errorResult.data.message)
        ? errorResult.data.message.join(", ")
        : errorResult.data.message;
      throw new Error(errorMessage);
    }

    throw new Error("Erreur lors du changement de mot de passe");
  }
}

/**
 * Supprime le compte de l'utilisateur connecté
 * @param accessToken - Le token d'accès
 * @throws Error si la requête échoue
 */
export async function deleteAccount(accessToken: string): Promise<void> {
  const response = await fetch(`${API_URL}/users/me`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erreur lors de la suppression du compte");
  }
}
