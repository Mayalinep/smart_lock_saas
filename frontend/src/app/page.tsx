"use client";

import { HeroSection } from "@/components/blocks/hero-section";
import { Icons } from "@/components/ui/icons";
import { MenuBar } from "@/components/ui/glow-menu";
import { Home as HomeIcon, ListVideo, User, Mail } from "lucide-react";
import { StarBorder } from "@/components/ui/star-border";
import { cn } from "@/lib/utils";
import { useState } from "react";

const menuItems = [
  {
    icon: HomeIcon,
    label: "Accueil",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: ListVideo,
    label: "Demonstration",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: Mail,
    label: "Contact",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
  {
    icon: User,
    label: "Profil",
    href: "#",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
];

export default function HomePage() {
  const [activeItem, setActiveItem] = useState<string>("Accueil");

  return (
    <main>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
        <MenuBar
          items={menuItems}
          activeItem={activeItem}
          onItemClick={setActiveItem}
        />
      </div>
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
            text: "",
            href: "/demo",
            variant: "default",
            children: (
              <StarBorder as="a" href="/demo" speed="3s">
                <span className="flex items-center justify-center gap-2">
                  <ListVideo className="h-5 w-5" />
                  Découvrir la démo
                </span>
              </StarBorder>
            ),
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