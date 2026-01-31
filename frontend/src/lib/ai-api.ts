const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export async function generateDescription(
  accessToken: string,
  title: string,
  category: string
): Promise<string> {
  const response = await fetch(`${API_URL}/ai/generate-description`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ title, category }),
  });

  const jsonData = await response.json();

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Session expirée. Veuillez vous reconnecter.');
    }
    const errorMessage = Array.isArray(jsonData.message)
      ? jsonData.message.join(', ')
      : jsonData.message || 'Erreur lors de la génération';
    throw new Error(errorMessage);
  }

  return jsonData.description;
}
