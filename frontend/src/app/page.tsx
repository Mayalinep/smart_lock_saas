import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation - Style Clerk */}
      <nav className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold text-text">SmartLock</span>
            </div>
            <div className="flex items-center space-x-8">
              <Link href="/pricing" className="text-text hover:text-primary transition-colors">
                Pricing
              </Link>
              <Link href="/docs" className="text-text hover:text-primary transition-colors">
                Docs
              </Link>
              <Link href="/test" className="text-text hover:text-primary transition-colors">
                API Test
              </Link>
              <Link href="/login" className="text-text hover:text-primary transition-colors">
                Sign in
              </Link>
              <button className="bg-text text-white hover:bg-primary px-4 py-2 rounded-md font-medium transition-colors">
                Get started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Style Clerk */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center">
            <h1 className="text-5xl md:text-7xl font-bold text-text mb-6 leading-tight">
              More than smart locks,<br />
              <span className="text-success">Complete Property Management</span>
            </h1>
            <p className="text-xl text-text/70 mb-8 max-w-2xl mx-auto leading-relaxed">
              Add secure, temporary access codes to your properties in minutes. 
              Built for property owners who demand reliability and simplicity.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <button className="bg-success hover:bg-primary text-white px-8 py-3 rounded-md font-semibold transition-colors">
                Start building for free
              </button>
              <button className="border border-border text-text hover:border-primary hover:text-primary px-8 py-3 rounded-md font-semibold transition-colors">
                View live demo
              </button>
            </div>
            
            {/* Placeholder pour capture d'écran principale - Style Clerk */}
            <div className="bg-neutral border border-border rounded-lg p-8 shadow-2xl max-w-4xl mx-auto">
              <div className="bg-white rounded-md p-6 border border-border">
                <div className="flex items-center space-x-2 mb-4">
                  <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                  <div className="w-3 h-3 bg-success rounded-full"></div>
                </div>
                <div className="text-left">
                  <div className="text-sm text-text/50 mb-2">Dashboard SmartLock</div>
                  <div className="h-48 bg-neutral rounded border-2 border-dashed border-border flex items-center justify-center">
                    <span className="text-text/40 text-lg">Screenshot du dashboard à venir</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trusted by Section - Style Clerk */}
      <section className="py-16 bg-neutral/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-text/60 text-sm uppercase tracking-wider font-medium">
              Trusted by property owners worldwide
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
            {/* Placeholders pour logos clients */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-12 w-32 bg-border rounded flex items-center justify-center">
                <span className="text-text/30 text-xs">Logo {i}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section - Style Clerk */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Feature 1 */}
            <div>
              <h2 className="text-4xl font-bold text-text mb-6">
                Generate secure access codes in seconds
              </h2>
              <p className="text-xl text-text/70 mb-8">
                Create temporary codes for tenants, cleaners, or maintenance teams. 
                Each code is encrypted, time-limited, and tracked automatically.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-text">Temporary access codes</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-text">Real-time monitoring</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-6 h-6 bg-success rounded-full flex items-center justify-center">
                    <span className="text-white text-xs">✓</span>
                  </div>
                  <span className="text-text">Automatic expiration</span>
                </div>
              </div>
            </div>
            <div className="bg-neutral border border-border rounded-lg p-6">
              <div className="h-80 bg-white border border-border rounded flex items-center justify-center">
                <span className="text-text/40">Code Generation Interface</span>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="lg:order-2">
              <h2 className="text-4xl font-bold text-text mb-6">
                Monitor every access in real-time
              </h2>
              <p className="text-xl text-text/70 mb-8">
                Get instant notifications when someone enters your property. 
                View detailed logs, track usage patterns, and ensure security.
              </p>
              <button className="bg-success text-white px-6 py-3 rounded-md font-semibold hover:bg-primary transition-colors">
                View monitoring features →
              </button>
            </div>
            <div className="bg-neutral border border-border rounded-lg p-6 lg:order-1">
              <div className="h-80 bg-white border border-border rounded flex items-center justify-center">
                <span className="text-text/40">Real-time Monitoring Dashboard</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Integration Section - Style Clerk */}
      <section className="py-24 bg-neutral/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-text mb-6">
              Built for developers, loved by property managers
            </h2>
            <p className="text-xl text-text/70 max-w-3xl mx-auto">
              Complete API, webhooks, and SDKs. Integrate SmartLock into your existing property management system in minutes.
            </p>
          </div>
          
          <div className="bg-white border border-border rounded-lg p-8 max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold text-text mb-4">Simple Integration</h3>
                <div className="bg-neutral p-4 rounded border border-border">
                  <div className="h-32 bg-white border border-dashed border-border rounded flex items-center justify-center">
                    <span className="text-text/40 text-sm">Code Example</span>
                  </div>
                </div>
              </div>
              <div>
                <h3 className="text-xl font-semibold text-text mb-4">Real-time Events</h3>
                <div className="bg-neutral p-4 rounded border border-border">
                  <div className="h-32 bg-white border border-dashed border-border rounded flex items-center justify-center">
                    <span className="text-text/40 text-sm">Webhook Example</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section - Style Clerk */}
      <section className="py-24 bg-text">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to secure your properties?
          </h2>
          <p className="text-xl text-white/70 mb-8">
            Join thousands of property owners using SmartLock to modernize their access management.
          </p>
          <button className="bg-success hover:bg-primary text-white px-8 py-4 rounded-md font-semibold text-lg transition-colors">
            Start your free trial
          </button>
          <p className="text-white/50 text-sm mt-4">
            No credit card required • 14-day free trial
          </p>
        </div>
      </section>

      {/* Footer - Style Clerk */}
      <footer className="bg-neutral border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <span className="text-xl font-bold text-text">SmartLock</span>
            </div>
            <div className="flex space-x-8">
              <Link href="/privacy" className="text-text/60 hover:text-text transition-colors">
                Privacy
              </Link>
              <Link href="/terms" className="text-text/60 hover:text-text transition-colors">
                Terms
              </Link>
              <Link href="/support" className="text-text/60 hover:text-text transition-colors">
                Support
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}