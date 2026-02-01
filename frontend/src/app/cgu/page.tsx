import Link from "next/link";

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Conditions Générales d&apos;Utilisation
        </h1>

        <p className="text-gray-600 mb-4">
          Dernière mise à jour : Février 2026
        </p>

        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            1. Objet
          </h2>
          <p className="text-gray-700 mb-4">
            Les présentes Conditions Générales d&apos;Utilisation (CGU) ont pour objet
            de définir les modalités et conditions d&apos;utilisation de la plateforme
            SecondLife Exchange, ainsi que les droits et obligations des utilisateurs.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2. Acceptation des CGU
          </h2>
          <p className="text-gray-700 mb-4">
            L&apos;utilisation de la plateforme implique l&apos;acceptation pleine et entière
            des présentes CGU. Si vous n&apos;acceptez pas ces conditions, veuillez ne
            pas utiliser notre service.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3. Description du service
          </h2>
          <p className="text-gray-700 mb-4">
            SecondLife Exchange est une plateforme permettant aux utilisateurs
            d&apos;échanger des biens entre particuliers. La plateforme met en relation
            des utilisateurs souhaitant donner ou échanger des objets.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4. Inscription
          </h2>
          <p className="text-gray-700 mb-4">
            Pour utiliser les services de la plateforme, l&apos;utilisateur doit créer
            un compte en fournissant des informations exactes et complètes.
            L&apos;utilisateur s&apos;engage à maintenir ces informations à jour.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5. Responsabilités
          </h2>
          <p className="text-gray-700 mb-4">
            Les utilisateurs sont seuls responsables du contenu qu&apos;ils publient
            sur la plateforme. SecondLife Exchange ne peut être tenu responsable
            des transactions effectuées entre utilisateurs.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6. Contact
          </h2>
          <p className="text-gray-700 mb-4">
            Pour toute question concernant ces CGU, vous pouvez nous contacter
            à l&apos;adresse : contact@secondlife-exchange.com
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200">
          <Link
            href="/register"
            className="text-blue-600 hover:underline"
          >
            ← Retour à l&apos;inscription
          </Link>
        </div>
      </div>
    </div>
  );
}
