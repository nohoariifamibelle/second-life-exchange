const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export interface UploadResponse {
  urls: string[];
  publicIds: string[];
}

/**
 * Upload des images vers Cloudinary via l'API
 */
export async function uploadImages(
  accessToken: string,
  files: File[]
): Promise<UploadResponse> {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('images', file);
  });

  const response = await fetch(`${API_URL}/upload/images`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    body: formData,
  });

  const jsonData = await response.json();

  if (!response.ok) {
    const errorMessage = Array.isArray(jsonData.message)
      ? jsonData.message.join(', ')
      : jsonData.message || "Erreur lors de l'upload";
    throw new Error(errorMessage);
  }

  return jsonData as UploadResponse;
}

/**
 * Supprime une image de Cloudinary
 */
export async function deleteImage(
  accessToken: string,
  publicId: string
): Promise<void> {
  // Encoder en base64 pour éviter les problèmes avec les slashes dans l'URL
  const encodedPublicId = btoa(publicId);
  const response = await fetch(
    `${API_URL}/upload/images/${encodedPublicId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    const jsonData = await response.json();
    const errorMessage = Array.isArray(jsonData.message)
      ? jsonData.message.join(', ')
      : jsonData.message || "Erreur lors de la suppression";
    throw new Error(errorMessage);
  }
}
