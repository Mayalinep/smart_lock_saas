import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <nav className="bg-white border-b border-neutral">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <div className="text-2xl font-bold text-primary">
                🔐 SmartLock
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                href="/test"
                className="text-text hover:text-primary transition-colors"
              >
                API Test
              </Link>
              <button className="bg-success hover:bg-primary text-white px-6 py-2 rounded-lg font-medium transition-colors">
                Commencer
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white to-neutral py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-text mb-6">
              Sécurisez vos propriétés avec
              <span className="text-success block">SmartLock SaaS</span>
            </h1>
            <p className="text-xl text-accent max-w-3xl mx-auto mb-8">
              La solution moderne de gestion d'accès pour propriétaires intelligents. 
              Contrôlez, surveillez et sécurisez vos biens immobiliers en temps réel.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-success hover:bg-primary text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg">
                Essai Gratuit 14 jours
              </button>
              <button className="border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors">
                Voir la Démo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-4">
              Pourquoi choisir SmartLock ?
            </h2>
            <p className="text-xl text-accent">
              Une plateforme complète pour la gestion moderne de vos accès
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6 rounded-xl bg-neutral/20 hover:bg-neutral/30 transition-colors">
              <div className="text-4xl mb-4">🔒</div>
              <h3 className="text-xl font-semibold text-text mb-2">Sécurité Maximale</h3>
              <p className="text-accent">
                Codes temporaires, logs d'accès, notifications en temps réel. Votre sécurité est notre priorité.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-neutral/20 hover:bg-neutral/30 transition-colors">
              <div className="text-4xl mb-4">📱</div>
              <h3 className="text-xl font-semibold text-text mb-2">Contrôle Total</h3>
              <p className="text-accent">
                Interface web intuitive accessible partout. Gérez tous vos accès depuis un seul endroit.
              </p>
            </div>
            
            <div className="text-center p-6 rounded-xl bg-neutral/20 hover:bg-neutral/30 transition-colors">
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-xl font-semibold text-text mb-2">Installation Simple</h3>
              <p className="text-accent">
                Configuration en 5 minutes. Compatible avec la plupart des serrures connectées du marché.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-4">
            Prêt à révolutionner votre gestion d'accès ?
          </h2>
          <p className="text-xl text-white/90 mb-8">
            Rejoignez des centaines de propriétaires qui font confiance à SmartLock
          </p>
          <button className="bg-success hover:bg-white hover:text-success text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors shadow-lg border-2 border-success">
            Commencer Maintenant
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-text py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="text-2xl font-bold text-white mb-4">
              🔐 SmartLock
            </div>
            <p className="text-white/70">
              La solution de gestion d'accès qui grandit avec vous
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
