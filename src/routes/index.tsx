import { createFileRoute } from "@tanstack/react-router";
import { ConexaoPositiva } from "@/components/ConexaoPositiva";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Conexão Positiva 💛 Raspe e descubra" },
      { name: "description", content: "Raspe e descubra algo que você precisava ler hoje." },
      { property: "og:title", content: "Conexão Positiva 💛" },
      { property: "og:description", content: "Raspe e descubra algo que você precisava ler hoje." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ConexaoPositiva,
});
