const videos = [
  {
    id: "seAAi2EDQTU",
    title: "L'économie circulaire expliquée en 2 minutes",
    description: "Comprendre les principes de l'économie circulaire",
  },
  {
    id: "zCRKvDyyHmI",
    title: "Pourquoi le réemploi est essentiel",
    description: "L'impact environnemental de nos modes de consommation",
  },
];

function VideoEmbed({ videoId, title }: { videoId: string; title: string }) {
  return (
    <div className="aspect-video rounded-xl overflow-hidden shadow-lg">
      <iframe
        width="100%"
        height="100%"
        src={`https://www.youtube-nocookie.com/embed/${videoId}`}
        title={title}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className="w-full h-full"
      />
    </div>
  );
}

export default function VideoSection() {
  return (
    <section className="py-16 bg-gray-50 -mx-4 px-4 md:-mx-8 md:px-8 hidden md:block">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-2">
          Comprendre l&apos;économie circulaire
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Des vidéos pour approfondir vos connaissances
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {videos.map((video) => (
            <div key={video.id}>
              <VideoEmbed videoId={video.id} title={video.title} />
              <h3 className="font-semibold text-lg mt-4 text-gray-800">
                {video.title}
              </h3>
              <p className="text-gray-600 text-sm">{video.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
