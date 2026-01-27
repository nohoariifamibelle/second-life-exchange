"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
  updateProfileSchema,
  updatePasswordSchema,
  type UpdateProfileFormData,
  type UpdatePasswordFormData,
} from "@/schemas/auth";
import {
  getProfile,
  updateProfile,
  updatePassword,
  deleteAccount,
} from "@/lib/api";

export default function ProfilePage() {
  const { user, accessToken, isLoading, isAuthenticated, logout, updateUser } = useAuth();
  const router = useRouter();
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Formulaire de profil
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
    reset: resetProfile,
  } = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
  });

  // Formulaire de mot de passe
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    formState: { errors: passwordErrors },
    reset: resetPassword,
  } = useForm<UpdatePasswordFormData>({
    resolver: zodResolver(updatePasswordSchema),
  });

  // Redirection si non authentifié
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  // Charger le profil complet
  useEffect(() => {
    const loadProfile = async () => {
      if (!accessToken) return;

      try {
        const profile = await getProfile(accessToken);
        resetProfile({
          email: profile.email,
          firstName: profile.firstName,
          lastName: profile.lastName,
          bio: profile.bio || "",
          city: profile.city || "",
        });
        // Mettre à jour le contexte avec les données complètes
        updateUser(profile);
      } catch (error) {
        console.error("Erreur lors du chargement du profil:", error);
        toast.error("Erreur lors du chargement du profil");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    if (isAuthenticated && accessToken) {
      loadProfile();
    }
  }, [isAuthenticated, accessToken, resetProfile, updateUser]);

  // Soumission du formulaire de profil
  const onSubmitProfile = async (data: UpdateProfileFormData) => {
    if (!accessToken) return;

    setIsUpdatingProfile(true);
    try {
      const updatedProfile = await updateProfile(accessToken, data);
      updateUser(updatedProfile);
      toast.success("Profil mis à jour avec succès");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la mise à jour";
      toast.error(message);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Soumission du formulaire de mot de passe
  const onSubmitPassword = async (data: UpdatePasswordFormData) => {
    if (!accessToken) return;

    setIsUpdatingPassword(true);
    try {
      await updatePassword(accessToken, {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      resetPassword();
      toast.success("Mot de passe modifié avec succès");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors du changement de mot de passe";
      toast.error(message);
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  // Suppression du compte
  const handleDeleteAccount = async () => {
    if (!accessToken) return;

    setIsDeleting(true);
    try {
      await deleteAccount(accessToken);
      toast.success("Compte supprimé avec succès");
      logout();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Erreur lors de la suppression";
      toast.error(message);
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading || isLoadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold text-green-600 hover:text-green-700">
            Second Life Exchange
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-gray-700">
              {user.firstName} {user.lastName}
            </span>
            <Link
              href="/dashboard"
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Retour au dashboard
            </Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-8">Mon profil</h1>

        {/* Formulaire de profil */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Informations personnelles</h2>

          <form onSubmit={handleSubmitProfile(onSubmitProfile)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Prénom */}
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Prénom
                </label>
                <input
                  id="firstName"
                  type="text"
                  {...registerProfile("firstName")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    profileErrors.firstName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {profileErrors.firstName && (
                  <p className="mt-1 text-sm text-red-500">{profileErrors.firstName.message}</p>
                )}
              </div>

              {/* Nom */}
              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nom
                </label>
                <input
                  id="lastName"
                  type="text"
                  {...registerProfile("lastName")}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                    profileErrors.lastName ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {profileErrors.lastName && (
                  <p className="mt-1 text-sm text-red-500">{profileErrors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <input
                id="email"
                type="email"
                {...registerProfile("email")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  profileErrors.email ? "border-red-500" : "border-gray-300"
                }`}
              />
              {profileErrors.email && (
                <p className="mt-1 text-sm text-red-500">{profileErrors.email.message}</p>
              )}
            </div>

            {/* Ville */}
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                Ville
              </label>
              <input
                id="city"
                type="text"
                {...registerProfile("city")}
                placeholder="Ex: Paris, Lyon, Marseille..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  profileErrors.city ? "border-red-500" : "border-gray-300"
                }`}
              />
              {profileErrors.city && (
                <p className="mt-1 text-sm text-red-500">{profileErrors.city.message}</p>
              )}
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                rows={4}
                {...registerProfile("bio")}
                placeholder="Parlez-nous de vous..."
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 resize-none ${
                  profileErrors.bio ? "border-red-500" : "border-gray-300"
                }`}
              />
              {profileErrors.bio && (
                <p className="mt-1 text-sm text-red-500">{profileErrors.bio.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingProfile}
              className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingProfile ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </form>
        </div>

        {/* Formulaire de mot de passe */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Changer le mot de passe</h2>

          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            {/* Mot de passe actuel */}
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                type="password"
                {...registerPassword("currentPassword")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  passwordErrors.currentPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {passwordErrors.currentPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.currentPassword.message}</p>
              )}
            </div>

            {/* Nouveau mot de passe */}
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Nouveau mot de passe
              </label>
              <input
                id="newPassword"
                type="password"
                {...registerPassword("newPassword")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  passwordErrors.newPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {passwordErrors.newPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.newPassword.message}</p>
              )}
            </div>

            {/* Confirmation */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                {...registerPassword("confirmPassword")}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900 ${
                  passwordErrors.confirmPassword ? "border-red-500" : "border-gray-300"
                }`}
              />
              {passwordErrors.confirmPassword && (
                <p className="mt-1 text-sm text-red-500">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isUpdatingPassword}
              className="w-full py-2 px-4 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isUpdatingPassword ? "Modification..." : "Changer le mot de passe"}
            </button>
          </form>
        </div>

        {/* Zone de danger - Suppression du compte */}
        <div className="bg-white rounded-lg shadow p-6 border-2 border-red-200">
          <h2 className="text-lg font-semibold text-red-600 mb-4">Zone de danger</h2>
          <p className="text-gray-600 mb-4">
            La suppression de votre compte est irréversible. Toutes vos données, objets et historique
            d&apos;échanges seront définitivement supprimés.
          </p>

          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="px-4 py-2 bg-red-100 text-red-600 font-semibold rounded-lg hover:bg-red-200 transition-colors"
            >
              Supprimer mon compte
            </button>
          ) : (
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-700 font-medium mb-4">
                Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Suppression..." : "Oui, supprimer définitivement"}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-4 py-2 bg-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
