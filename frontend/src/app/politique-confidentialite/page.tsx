import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">
          Politique de Confidentialité
        </h1>

        <p className="text-gray-600 mb-4">
          Dernière mise à jour : Février 2026
        </p>

        <div className="prose prose-gray max-w-none">
          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            1. Collecte des données
          </h2>
          <p className="text-gray-700 mb-4">
            Conformément au Règlement Général sur la Protection des Données (RGPD),
            nous collectons uniquement les données nécessaires au fonctionnement
            de notre service : nom, prénom, adresse email, et les informations
            relatives aux annonces publiées.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            2. Utilisation des données
          </h2>
          <p className="text-gray-700 mb-4">
            Vos données personnelles sont utilisées pour :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
            <li>Gérer votre compte utilisateur</li>
            <li>Permettre la publication et la gestion de vos annonces</li>
            <li>Faciliter la mise en relation avec d&apos;autres utilisateurs</li>
            <li>Vous envoyer des notifications relatives à votre compte</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            3. Conservation des données
          </h2>
          <p className="text-gray-700 mb-4">
            Vos données sont conservées pendant toute la durée de votre inscription
            sur la plateforme. En cas de suppression de votre compte, vos données
            seront effacées dans un délai de 30 jours.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            4. Vos droits
          </h2>
          <p className="text-gray-700 mb-4">
            Conformément au RGPD, vous disposez des droits suivants :
          </p>
          <ul className="list-disc list-inside text-gray-700 mb-4 ml-4">
            <li>Droit d&apos;accès à vos données personnelles</li>
            <li>Droit de rectification de vos données</li>
            <li>Droit à l&apos;effacement (droit à l&apos;oubli)</li>
            <li>Droit à la portabilité de vos données</li>
            <li>Droit d&apos;opposition au traitement</li>
            <li>Droit de retirer votre consentement à tout moment</li>
          </ul>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            5. Sécurité des données
          </h2>
          <p className="text-gray-700 mb-4">
            Nous mettons en œuvre des mesures techniques et organisationnelles
            appropriées pour protéger vos données personnelles contre tout accès
            non autorisé, modification, divulgation ou destruction.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            6. Cookies
          </h2>
          <p className="text-gray-700 mb-4">
            Notre site utilise des cookies essentiels au fonctionnement du service.
            Pour plus d&apos;informations, consultez notre politique de cookies.
          </p>

          <h2 className="text-xl font-semibold text-gray-800 mt-6 mb-3">
            7. Contact DPO
          </h2>
          <p className="text-gray-700 mb-4">
            Pour exercer vos droits ou pour toute question relative à vos données
            personnelles, vous pouvez contacter notre Délégué à la Protection des
            Données à l&apos;adresse : dpo@secondlife-exchange.com
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
