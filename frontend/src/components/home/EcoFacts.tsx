const ecoFacts = [
  {
    icon: "👕",
    title: "Industrie textile",
    fact: "L'industrie de la mode est responsable de 10% des émissions mondiales de CO2.",
    source: "ONU Environnement",
  },
  {
    icon: "📱",
    title: "Électronique",
    fact: "Fabriquer un smartphone génère en moyenne 70 kg de CO2.",
    source: "ADEME",
  },
  {
    icon: "📚",
    title: "Livres",
    fact: "Produire un livre neuf émet environ 1,3 kg de CO2.",
    source: "Carbon Trust",
  },
  {
    icon: "🛋️",
    title: "Meubles",
    fact: "En France, 2,7 millions de tonnes de meubles sont jetées chaque année.",
    source: "Éco-mobilier",
  },
];

export default function EcoFacts() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-center mb-2">Le Saviez-Vous ?</h2>
      <p className="text-center text-gray-500 mb-8">
        Des chiffres qui font réfléchir
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {ecoFacts.map((fact, index) => (
          <div
            key={index}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100"
          >
            <span className="text-4xl mb-4 block">{fact.icon}</span>
            <h3 className="font-semibold text-lg mb-2 text-gray-800">
              {fact.title}
            </h3>
            <p className="text-gray-700 text-sm mb-3">{fact.fact}</p>
            <p className="text-xs text-gray-500 italic">
              Source : {fact.source}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
