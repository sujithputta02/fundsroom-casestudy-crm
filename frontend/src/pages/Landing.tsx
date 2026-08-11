import { Link } from 'react-router-dom';
import { ArrowRight, BarChart3, Users, Package, ShieldCheck, Zap, Globe } from 'lucide-react';
import { Logo } from '../components/Logo';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#0a0a0d] text-white selection:bg-accent/30 overflow-hidden font-sans">
      
      {/* Background Ambient Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-500/20 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-[40%] left-[50%] -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-teal-500/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-md bg-[#0a0a0d]/50">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Logo size="md" showLabel={true} />
          <nav className="flex items-center gap-6">
            <a href="#features" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden md:block">Features</a>
            <a href="#solutions" className="text-sm font-medium text-white/60 hover:text-white transition-colors hidden md:block">Solutions</a>
            <Link 
              to="/login"
              className="group flex items-center gap-2 bg-white/10 hover:bg-white/20 border border-white/10 text-white px-5 py-2.5 rounded-custom-12 text-sm font-semibold transition-all duration-300 backdrop-blur-lg shadow-xl"
            >
              Access Portal
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center text-center animate-stagger-in">
          
          <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-white via-white to-white/50">
            The Operating System for Modern Teams.
          </h1>
          
          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl font-light">
            Streamline your CRM, inventory, and sales challans with a high-performance, dark-glassmorphic workspace designed for speed and clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link 
              to="/login"
              className="w-full sm:w-auto bg-gradient-to-r from-accent to-indigo-600 hover:from-accent-strong hover:to-indigo-700 text-white px-8 py-4 rounded-custom-12 text-base font-semibold shadow-[0_0_30px_rgba(124,92,255,0.4)] transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              Launch Dashboard
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a 
              href="#features"
              className="w-full sm:w-auto bg-white/5 hover:bg-white/10 border border-white/10 text-white px-8 py-4 rounded-custom-12 text-base font-semibold transition-all duration-300 flex items-center justify-center"
            >
              Explore Features
            </a>
          </div>

          {/* Hero Image Mockup (Miniature Dashboard UI) */}
          <div className="hidden md:block mt-20 w-full max-w-5xl aspect-video rounded-[24px] bg-gradient-to-br from-[#16161d] to-[#0d0d12] border border-white/10 shadow-[0_30px_100px_-20px_rgba(124,92,255,0.3)] overflow-hidden relative group">
            {/* Fake Browser Title Bar */}
            <div className="absolute top-0 w-full h-12 bg-white/5 border-b border-white/5 flex items-center px-4 gap-2 z-20 backdrop-blur-md">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <div className="mx-auto bg-white/10 px-32 py-1.5 rounded-md flex items-center gap-2">
                <ShieldCheck className="w-3 h-3 text-white/40" />
                <span className="text-[10px] text-white/40 font-mono">fundsroom.app/operations</span>
              </div>
            </div>
            
            <div className="absolute inset-0 pt-12 flex opacity-80 group-hover:opacity-100 transition-opacity duration-700">
               {/* Mini Sidebar */}
               <div className="w-20 border-r border-white/5 bg-[#0a0a0d] flex flex-col items-center py-6 gap-6 shrink-0">
                  <Logo size="sm" />
                  <div className="w-10 h-10 rounded-xl bg-accent/20 border border-accent/30 flex items-center justify-center mt-4">
                    <BarChart3 className="w-5 h-5 text-accent" />
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-40">
                    <Users className="w-5 h-5 text-white" />
                  </div>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center opacity-40">
                    <Package className="w-5 h-5 text-white" />
                  </div>
               </div>

               {/* Mini Content Area */}
               <div className="flex-1 p-8 bg-[#0d0d12] flex flex-col gap-6 overflow-hidden">
                  {/* Top header */}
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="h-6 w-48 bg-white/10 rounded-md mb-2" />
                      <div className="h-4 w-64 bg-white/5 rounded-md" />
                    </div>
                    <div className="flex gap-4">
                      <div className="h-8 w-8 rounded-full bg-white/10" />
                      <div className="h-8 w-24 rounded-full bg-white/10" />
                    </div>
                  </div>

                  {/* KPI Cards */}
                  <div className="grid grid-cols-4 gap-4">
                    {[
                      'bg-gradient-to-br from-blue-500/20 to-sky-500/20',
                      'bg-gradient-to-br from-teal-500/20 to-emerald-500/20',
                      'bg-gradient-to-br from-slate-500/20 to-gray-500/20',
                      'bg-gradient-to-br from-blue-500/20 to-indigo-500/20'
                    ].map((grad, i) => (
                      <div key={i} className={`h-24 rounded-2xl border border-white/10 ${grad} p-4 flex flex-col justify-between backdrop-blur-sm shadow-inner`}>
                        <div className="h-3 w-16 bg-white/20 rounded-full" />
                        <div className="h-8 w-24 bg-white/30 rounded-md" />
                      </div>
                    ))}
                  </div>

                  {/* Chart and Table Area */}
                  <div className="flex gap-4 flex-1">
                    <div className="flex-[2] rounded-2xl border border-white/10 bg-[#16161d] p-5 flex flex-col gap-4">
                       <div className="h-4 w-32 bg-white/10 rounded-md" />
                       <div className="flex-1 rounded-xl bg-gradient-to-b from-accent/10 to-transparent border border-accent/20 relative overflow-hidden">
                          {/* Fake chart line */}
                          <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 100 100">
                            <path d="M0,100 L0,70 Q25,40 50,60 T100,30 L100,100 Z" fill="rgba(124,92,255,0.2)" />
                            <path d="M0,70 Q25,40 50,60 T100,30" fill="none" stroke="#7c5cff" strokeWidth="2" />
                          </svg>
                       </div>
                    </div>
                    <div className="flex-1 rounded-2xl border border-white/10 bg-[#16161d] p-5 flex flex-col gap-4">
                       <div className="h-4 w-24 bg-white/10 rounded-md" />
                       {[1, 2, 3, 4].map(i => (
                         <div key={i} className="flex justify-between items-center border-b border-white/5 pb-3">
                           <div className="flex items-center gap-3">
                             <div className="w-8 h-8 rounded-lg bg-white/5" />
                             <div className="flex flex-col gap-2">
                               <div className="h-3 w-20 bg-white/20 rounded-sm" />
                               <div className="h-2 w-12 bg-white/10 rounded-sm" />
                             </div>
                           </div>
                           <div className="h-5 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30" />
                         </div>
                       ))}
                    </div>
                  </div>
               </div>
            </div>
            
            {/* Glowing reflection */}
            <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none z-30" />
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 border-t border-white/5 bg-black/20">
          <div className="max-w-7xl mx-auto px-6">
            <div className="mb-16 text-center max-w-2xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful modules, seamless workflow.</h2>
              <p className="text-white/60">Everything you need to manage operations, natively integrated into one beautiful interface.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { 
                  icon: Users, 
                  title: 'Smart CRM', 
                  desc: 'Track leads, active customers, and account histories with real-time status syncing.',
                  color: 'text-sky-400',
                  bg: 'bg-sky-400/10'
                },
                { 
                  icon: Package, 
                  title: 'Live Inventory', 
                  desc: 'Monitor stock health, set minimum thresholds, and receive instant low-stock alerts.',
                  color: 'text-emerald-400',
                  bg: 'bg-emerald-400/10'
                },
                { 
                  icon: BarChart3, 
                  title: 'Sales & Challans', 
                  desc: 'Draft, confirm, and manage multi-item sales challans with integrated pricing logic.',
                  color: 'text-amber-400',
                  bg: 'bg-amber-400/10'
                },
                { 
                  icon: ShieldCheck, 
                  title: 'Role-Based Access', 
                  desc: 'Secure your data with granular permissions for admins, managers, and operators.',
                  color: 'text-rose-400',
                  bg: 'bg-rose-400/10'
                },
                { 
                  icon: Zap, 
                  title: 'Lightning Fast', 
                  desc: 'Built on a modern tech stack ensuring sub-millisecond interaction times.',
                  color: 'text-accent',
                  bg: 'bg-accent/10'
                },
                { 
                  icon: Globe, 
                  title: 'Cloud Synced', 
                  desc: 'Access your operations data from anywhere, on any device securely.',
                  color: 'text-indigo-400',
                  bg: 'bg-indigo-400/10'
                }
              ].map((feat, idx) => (
                <div key={idx} className="bg-[#16161d] border border-white/5 rounded-custom-16 p-8 hover:bg-[#1c1c25] hover:border-white/10 transition-all duration-300 hover:-translate-y-1 group">
                  <div className={`w-12 h-12 rounded-custom-12 ${feat.bg} ${feat.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-semibold mb-3">{feat.title}</h3>
                  <p className="text-white/60 leading-relaxed text-sm">
                    {feat.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Footer CTA */}
        <section className="py-32 border-t border-white/5 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-accent/5" />
          <div className="max-w-3xl mx-auto px-6 relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to upgrade your operations?</h2>
            <p className="text-lg text-white/60 mb-10">
              Join forward-thinking teams using Fundsroom ERP to streamline their daily workflows.
            </p>
            <Link 
              to="/login"
              className="inline-flex bg-white text-black hover:bg-white/90 px-8 py-4 rounded-custom-12 text-base font-bold shadow-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
            >
              Access the Portal Now
            </Link>
          </div>
        </section>
      </main>
      
      {/* Footer minimal */}
      <footer className="border-t border-white/5 bg-[#050508] py-8 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-white/40 text-sm">
          <div className="flex items-center gap-2 mb-4 md:mb-0">
            <Logo size="sm" />
            <span>&copy; {new Date().getFullYear()} Fundsroom. All rights reserved.</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
