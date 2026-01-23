import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Boost",
    short_name: "Boost",
    description:
      "AI-powered growth strategy with real competitive research. Not ChatGPT fluff.",
    start_url: "/",
    display: "standalone",
    background_color: "#FDFCFB",
    theme_color: "#E67E22",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
