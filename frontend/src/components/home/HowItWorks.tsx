const steps = [
  {
    icon: "📸",
    title: "Publiez",
    description: "Photographiez et décrivez l'objet que vous souhaitez échanger",
  },
  {
    icon: "🔍",
    title: "Trouvez",
    description: "Parcourez les objets et trouvez celui qui vous intéresse",
  },
  {
    icon: "🤝",
    title: "Échangez",
    description: "Proposez un échange et convenez d'un rendez-vous",
  },
];

export default function HowItWorks() {
  return (
    <section className="py-16">
      <h2 className="text-2xl font-bold text-center mb-12">
        Comment ça marche ?
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
        {steps.map((step, index) => (
          <div key={index} className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">{step.icon}</span>
            </div>
            <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center mx-auto mb-3 text-sm font-bold">
              {index + 1}
            </div>
            <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
            <p className="text-gray-600 text-sm">{step.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
