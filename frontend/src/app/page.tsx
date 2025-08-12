"use client";

import { HeroSection } from "@/components/blocks/hero-section";
import { Icons } from "@/components/ui/icons";

export default function Home() {
  return (
    <main>
      <HeroSection
        badge={{
          text: "🚀 Nouvelle génération de serrures connectées",
          action: {
            text: "En savoir plus",
            href: "/docs",
          },
        }}
        title={["Sécurisez votre avenir", "avec SmartLock"].join("\n")}
        description="La solution de serrures connectées la plus avancée du marché. Sécurité de niveau entreprise, gestion simplifiée, et tranquillité d'esprit garantie."
        actions={[
          {
            text: "Commencer",
            href: "/register",
            variant: "default",
          },
          {
            text: "GitHub",
            href: "https://github.com/your-repo",
            variant: "glow",
            icon: <Icons.gitHub className="h-5 w-5" />,
          },
        ]}
        image={{
          light: "/dashboard-light.png",
          dark: "/dashboard-dark.png",
          alt: "SmartLock Dashboard Preview",
        }}
      />
    </main>
  );
}