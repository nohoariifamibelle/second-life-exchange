"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

interface CommunityStats {
  totalUsers: number;
  totalExchanges: number;
  totalCo2Saved: number;
  equivalentTrees: number;
}

// Données statiques pour la landing page
const features = [
  {
    icon: "🔄",
    title: "Échangez facilement",
    description:
      "Proposez vos objets et trouvez ce dont vous avez besoin. Notre système de matching intelligent facilite les échanges.",
  },
  {
    icon: "🌍",
    title: "Impact écologique",
    description:
      "Suivez votre contribution à l'environnement. Chaque échange évite la production de nouveaux objets et réduit les déchets.",
  },
  {
    icon: "🤖",
    title: "Suggestions IA",
    description:
      "Notre intelligence artificielle analyse vos objets et vous suggère les meilleurs échanges possibles.",
  },
  {
    icon: "📍",
    title: "Échanges locaux",
    description:
      "Trouvez des échangeurs près de chez vous. Favorisez les rencontres locales et réduisez l'empreinte carbone du transport.",
  },
  {
    icon: "🔒",
    title: "Sécurisé",
    description:
      "Profils vérifiés, système de notation et messagerie intégrée pour des échanges en toute confiance.",
  },
  {
    icon: "📊",
    title: "Tableau de bord",
    description:
      "Gérez vos objets, suivez vos échanges et visualisez vos statistiques personnelles en un coup d'œil.",
  },
];

const steps = [
  {
    number: "1",
    title: "Créez votre compte",
    description:
      "Inscription gratuite en quelques secondes. Complétez votre profil pour inspirer confiance.",
    icon: "👤",
  },
  {
    number: "2",
    title: "Publiez vos objets",
    description:
      "Photographiez et décrivez les objets que vous souhaitez échanger. Notre IA peut vous aider à rédiger.",
    icon: "📸",
  },
  {
    number: "3",
    title: "Trouvez et échangez",
    description:
      "Parcourez les objets disponibles, proposez un échange et convenez d'un rendez-vous.",
    icon: "🤝",
  },
];

const testimonials = [
  {
    name: "Henri Gillian",
    city: "Annecy",
    text: "J'ai échangé mon iPhone 12 contre une magnifique peinture du Lac d'Annecy. Un échange inattendu mais qui m'a permis de décorer mon salon tout en donnant une seconde vie à mon ancien téléphone !",
    initials: "HG",
  },
  {
    name: "Jean Val-Jean",
    city: "Toulouse",
    text: "Grâce à Second Life Exchange, j'ai pu vider mon grenier tout en récupérant des objets qui me servent au quotidien. Une vraie révolution dans ma façon de consommer !",
    initials: "JV",
  },
  {
    name: "Jeanne Mirot",
    city: "Nantes",
    text: "Le suivi d'impact CO2 est une idée géniale ! Voir concrètement l'effet positif de mes échanges sur l'environnement me motive vraiment à utiliser l'application régulièrement.",
    initials: "JM",
  },
];

const impactStats = [
  { value: "70 kg", label: "de CO2 économisés par smartphone réutilisé", source: "ADEME" },
  { value: "10%", label: "des émissions mondiales dues à la mode", source: "ONU" },
  { value: "2.7M", label: "tonnes de meubles jetés/an en France", source: "Éco-mobilier" },
];

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [communityStats, setCommunityStats] = useState<CommunityStats | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Rediriger vers dashboard si déjà connecté
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, isLoading, router]);

  // Charger les statistiques de la communauté
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch(`${API_URL}/stats/community`);
        if (response.ok) {
          const data = await response.json();
          setCommunityStats(data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des stats:", error);
      }
    };
    fetchStats();
  }, []);

  // Fermer le menu mobile quand on redimensionne
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMobileMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Bloquer le scroll quand le menu mobile est ouvert
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobileMenuOpen]);

  // Fonction pour le smooth scroll
  const handleSmoothScroll = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setIsMobileMenuOpen(false);
  };

  // Afficher un loader pendant la vérification
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg text-gray-600">Chargement...</div>
      </div>
    );
  }

  // Ne pas afficher si connecté (en attente de redirection)
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="text-xl font-bold text-green-600">
            ♻️ Second Life Exchange
          </Link>

          {/* Navigation Desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className="text-gray-600 hover:text-green-600 transition-colors duration-300 text-sm cursor-pointer"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "how-it-works")}
              className="text-gray-600 hover:text-green-600 transition-colors duration-300 text-sm cursor-pointer"
            >
              Comment ça marche
            </a>
            <Link
              href="/discover"
              className="text-gray-600 hover:text-green-600 transition-colors duration-300 text-sm"
            >
              Découverte écologique
            </Link>
            <Link
              href="/items"
              className="text-gray-600 hover:text-green-600 transition-colors duration-300 text-sm"
            >
              Voir les objets
            </Link>
          </nav>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/login"
              className="text-gray-600 hover:text-green-600 transition-colors duration-300 text-sm font-medium"
            >
              Connexion
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-300 font-medium"
            >
              S&apos;inscrire gratuitement
            </Link>
          </div>

          {/* Bouton Burger Mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-300"
            aria-label="Menu"
            aria-expanded={isMobileMenuOpen}
          >
            <svg
              className="w-6 h-6 text-gray-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Menu Mobile Overlay */}
        <div
          className={`md:hidden fixed inset-0 top-[65px] transform transition-transform duration-300 ease-in-out ${
            isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <nav className="flex flex-col p-6 space-y-4  bg-white">
            <a
              href="#features"
              onClick={(e) => handleSmoothScroll(e, "features")}
              className="text-lg text-gray-700 hover:text-green-600 transition-colors duration-300 py-2 border-b border-gray-100"
            >
              Fonctionnalités
            </a>
            <a
              href="#how-it-works"
              onClick={(e) => handleSmoothScroll(e, "how-it-works")}
              className="text-lg text-gray-700 hover:text-green-600 transition-colors duration-300 py-2 border-b border-gray-100"
            >
              Comment ça marche
            </a>
            <Link
              href="/discover"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg text-gray-700 hover:text-green-600 transition-colors duration-300 py-2 border-b border-gray-100"
            >
              Découverte écologique
            </Link>
            <Link
              href="/items"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-lg text-gray-700 hover:text-green-600 transition-colors duration-300 py-2 border-b border-gray-100"
            >
              Voir les objets
            </Link>

            <div className="pt-4 space-y-3">
              <Link
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 text-green-600 font-medium border-2 border-green-600 rounded-lg hover:bg-green-50 transition-colors duration-300"
              >
                Connexion
              </Link>
              <Link
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block w-full text-center py-3 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors duration-300"
              >
                S&apos;inscrire gratuitement
              </Link>
            </div>
          </nav>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-linear-to-br from-green-50 via-white to-emerald-50 py-20 md:py-32">
          <div className="max-w-7xl mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <span className="inline-block px-4 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium mb-6">
                🌱 Rejoignez le mouvement de l&apos;économie circulaire
              </span>
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Échangez vos objets,
                <br />
                <span className="text-green-600">préservez la planète</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                Donnez une seconde vie à vos objets en les échangeant avec
                d&apos;autres particuliers. Gratuit, écologique et convivial.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 text-lg"
                >
                  Créer mon compte gratuit
                </Link>
                <Link
                  href="/items"
                  className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors border-2 border-green-200 text-lg"
                >
                  Parcourir les objets
                </Link>
              </div>
              <p className="mt-6 text-sm text-gray-500">
                ✓ Inscription gratuite &nbsp; ✓ Sans engagement &nbsp; ✓ 100%
                sécurisé
              </p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute -top-24 -right-24 w-96 h-96 bg-green-200 rounded-full opacity-20 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-200 rounded-full opacity-20 blur-3xl" />
        </section>

        {/* Social Proof Bar - Affiché uniquement si des stats existent */}
        {communityStats && (communityStats.totalUsers > 0 || communityStats.totalExchanges > 0) && (
          <section className="bg-gray-900 text-white py-6">
            <div className="max-w-7xl mx-auto px-4">
              <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 text-center">
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {communityStats.totalUsers}
                  </div>
                  <div className="text-gray-400 text-sm">Membres actifs</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {communityStats.totalExchanges}
                  </div>
                  <div className="text-gray-400 text-sm">Échanges réalisés</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {communityStats.totalCo2Saved >= 1000
                      ? `${(communityStats.totalCo2Saved / 1000).toFixed(1)}T`
                      : `${communityStats.totalCo2Saved.toFixed(0)} kg`}
                  </div>
                  <div className="text-gray-400 text-sm">CO2 économisé</div>
                </div>
                <div>
                  <div className="text-2xl md:text-3xl font-bold">
                    {communityStats.equivalentTrees}
                  </div>
                  <div className="text-gray-400 text-sm">Arbres équivalents</div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Features Section */}
        <section id="features" className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin pour échanger
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Une plateforme complète pensée pour faciliter vos échanges et
                maximiser votre impact positif.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-gray-50 hover:bg-green-50 transition-colors border border-gray-100 hover:border-green-200"
                >
                  <span className="text-4xl mb-4 block">{feature.icon}</span>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="py-20 bg-linear-to-b from-gray-50 to-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Comment ça marche ?
              </h2>
              <p className="text-xl text-gray-600">
                Trois étapes simples pour commencer à échanger
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="text-center relative">
                  {index < steps.length - 1 && (
                    <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-green-200" />
                  )}
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
                    <span className="text-4xl">{step.icon}</span>
                  </div>
                  <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 font-bold">
                    {step.number}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/register"
                className="inline-block px-8 py-4 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors shadow-lg"
              >
                Commencer maintenant
              </Link>
            </div>
          </div>
        </section>

        {/* Impact Section */}
        <section className="py-20 bg-green-600 text-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Pourquoi c&apos;est important ?
              </h2>
              <p className="text-xl text-green-100 max-w-2xl mx-auto">
                Chaque objet réutilisé est un pas vers un avenir plus durable
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {impactStats.map((stat, index) => (
                <div
                  key={index}
                  className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-center"
                >
                  <div className="text-4xl md:text-5xl font-bold mb-2">
                    {stat.value}
                  </div>
                  <p className="text-green-100 mb-2">{stat.label}</p>
                  <p className="text-sm text-green-200">Source : {stat.source}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-12">
              <Link
                href="/discover"
                className="inline-block px-6 py-3 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors"
              >
                En savoir plus sur l&apos;impact écologique →
              </Link>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Ils ont adopté l&apos;échange
              </h2>
              <p className="text-xl text-gray-600">
                Découvrez les témoignages de notre communauté
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <div
                  key={index}
                  className="bg-gray-50 rounded-2xl p-8 border border-gray-100"
                >
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-green-600 font-semibold text-lg">
                        {testimonial.initials}
                      </span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900">
                        {testimonial.name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {testimonial.city}
                      </div>
                    </div>
                  </div>
                  <p className="text-gray-600 italic">
                    &quot;{testimonial.text}&quot;
                  </p>
                  <div className="mt-4 text-yellow-500">★★★★★</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-linear-to-br from-green-600 to-emerald-700 text-white">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Prêt à rejoindre le mouvement ?
            </h2>
            <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
              Créez votre compte gratuitement et commencez à échanger dès
              aujourd&apos;hui. Rejoignez une communauté engagée pour la
              planète.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/register"
                className="px-8 py-4 bg-white text-green-600 font-semibold rounded-xl hover:bg-green-50 transition-colors text-lg shadow-lg"
              >
                Créer mon compte gratuit
              </Link>
              <Link
                href="/items"
                className="px-8 py-4 bg-transparent text-white font-semibold rounded-xl hover:bg-white/10 transition-colors text-lg border-2 border-white/50"
              >
                Explorer les objets
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-4">♻️ Second Life Exchange</h3>
              <p className="text-gray-400 text-sm">
                La plateforme d&apos;échange d&apos;objets pour une économie
                circulaire et responsable.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Plateforme</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/items" className="hover:text-white transition-colors">
                    Parcourir les objets
                  </Link>
                </li>
                <li>
                  <Link href="/discover" className="hover:text-white transition-colors">
                    Découverte écologique
                  </Link>
                </li>
                <li>
                  <Link href="/register" className="hover:text-white transition-colors">
                    Créer un compte
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Légal</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li>
                  <Link href="/cgu" className="hover:text-white transition-colors">
                    Conditions d&apos;utilisation
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politique-confidentialite"
                    className="hover:text-white transition-colors"
                  >
                    Politique de confidentialité
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <p className="text-gray-400 text-sm">
                Une question ?{" "}
                <a
                  href="mailto:contact@secondlife-exchange.fr"
                  className="text-green-400 hover:text-green-300"
                >
                  contact@secondlife-exchange.fr
                </a>
              </p>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-500 text-sm">
            <p>© 2026 Second Life Exchange. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
