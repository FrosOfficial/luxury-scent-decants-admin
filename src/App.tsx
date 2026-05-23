import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { Dashboard } from './components/Dashboard';
import { Inquiries } from './components/Inquiries';
import { Catalog } from './components/Catalog';
import { Toaster } from 'react-hot-toast';
import { 
  LayoutDashboard, 
  ClipboardList, 
  Sparkles, 
  LogOut, 
  User as UserIcon,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const AppContent: React.FC = () => {
  const { isAuthenticated, localUser, loading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'dashboard' | 'inquiries' | 'catalog'>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-brand-emerald-dark flex flex-col items-center justify-center gap-4 relative overflow-hidden">
        {/* Background Decor */}
        <div className="absolute inset-0 bg-marble opacity-5 pointer-events-none mix-blend-overlay"></div>
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-brand-gold/10 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-gold/15 rounded-full blur-[120px] pointer-events-none"></div>

        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Synchronizing Security Tokens...</p>
      </div>
    );
  }

  if (!isAuthenticated || !localUser) {
    return <Login />;
  }

  // Visual Tab Renderer
  const renderActiveContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
      case 'inquiries':
        return <Inquiries />;
      case 'catalog':
        return <Catalog />;
      default:
        return <Dashboard onNavigate={(tab) => setActiveTab(tab)} />;
    }
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Overview Metrics', icon: LayoutDashboard },
    { id: 'inquiries' as const, label: 'Order Inquiries', icon: ClipboardList },
    { id: 'catalog' as const, label: 'Decant Catalog', icon: Sparkles },
  ];

  return (
    <div className="min-h-screen bg-brand-emerald-dark flex text-brand-cream relative overflow-hidden font-sans">
      {/* Background overlay */}
      <div className="absolute inset-0 bg-marble opacity-5 pointer-events-none mix-blend-overlay"></div>

      {/* Dynamic Gold Blurs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-brand-gold/5 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Sidebar - Desktop Layout */}
      <aside className="hidden lg:flex flex-col w-72 bg-black/40 border-r border-white/[0.08] min-h-screen relative z-10">
        {/* Subtle top border gold accent */}
        <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/30 to-transparent"></div>

        {/* Brand Header */}
        <div className="p-6 border-b border-white/[0.06] flex flex-col items-center">
          <div className="w-12 h-12 rounded-full overflow-hidden border border-brand-gold/30 shadow-lg shadow-black/40 mb-3 select-none bg-brand-emerald-dark shrink-0 flex items-center justify-center">
            <img 
              src="/logo.webp" 
              alt="Luxury Scent Decants Logo" 
              className="w-full h-full object-cover" 
            />
          </div>
          <h2 className="font-serif text-xl font-bold tracking-wider text-brand-cream text-center select-none">
            LUXURY SCENT
          </h2>
          <span className="text-[10px] uppercase tracking-[0.25em] text-brand-gold font-semibold mt-1">
            Admin Console
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-4 mt-6 bg-white/[0.02] border border-white/[0.06] rounded-xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-brand-gold/10 border border-brand-gold/30 flex items-center justify-center text-brand-gold">
            <UserIcon className="w-5 h-5" />
          </div>
          <div className="overflow-hidden">
            <div className="font-semibold text-sm text-brand-cream truncate leading-tight">
              {localUser.full_name}
            </div>
            <div className="text-[10px] uppercase text-brand-gold font-semibold tracking-wider mt-0.5">
              Administrator
            </div>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex-1 px-4 py-8 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full py-3 px-4 rounded-sm flex items-center gap-3.5 text-sm transition duration-300 font-semibold cursor-pointer select-none group relative ${
                  isActive 
                    ? 'text-brand-emerald-dark bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light shadow-xl shadow-brand-gold/10' 
                    : 'text-brand-cream/65 hover:text-brand-cream hover:bg-white/[0.03] border border-transparent hover:border-white/[0.04]'
                }`}
              >
                <Icon className={`w-4.5 h-4.5 ${isActive ? 'text-brand-emerald-dark' : 'text-brand-gold group-hover:scale-105 transition-transform'}`} />
                <span>{item.label}</span>
                {isActive && (
                  <motion.div 
                    layoutId="activeGlow" 
                    className="absolute inset-0 border border-brand-gold/40 rounded-sm pointer-events-none" 
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Logout button */}
        <div className="p-4 border-t border-white/[0.06]">
          <button
            onClick={logout}
            className="w-full py-3 bg-white/[0.02] border border-white/[0.08] hover:border-red-500/30 text-brand-cream/70 hover:text-red-400 text-sm font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Terminal</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-brand-emerald-dark/90 backdrop-blur-md border-b border-white/[0.08] flex items-center justify-between px-6 z-30">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          <span className="font-serif text-lg font-bold tracking-wide">LUXURY SCENT</span>
        </div>
        <button 
          onClick={() => setIsMobileSidebarOpen(true)}
          className="p-2 text-brand-cream/80 hover:text-brand-gold transition cursor-pointer"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Sidebar Modal */}
      <AnimatePresence>
        {isMobileSidebarOpen && (
          <div className="lg:hidden fixed inset-0 z-40 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="w-72 bg-brand-emerald-dark border-r border-brand-gold/20 h-full p-6 flex flex-col z-50 relative"
            >
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="absolute top-5 right-5 p-2 text-brand-cream/60 hover:text-brand-gold cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-2 border-b border-white/[0.06] pb-5 mb-6 select-none mt-2">
                <Sparkles className="w-5 h-5 text-brand-gold" />
                <span className="font-serif text-lg font-bold tracking-wide">LUXURY SCENT</span>
                <span className="text-[8px] uppercase tracking-widest text-brand-gold font-bold bg-brand-gold/10 px-1.5 py-0.5 rounded-sm">Admin</span>
              </div>

              <nav className="flex-grow space-y-2">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileSidebarOpen(false);
                      }}
                      className={`w-full py-3 px-4 rounded-sm flex items-center gap-3.5 text-sm transition duration-300 font-semibold cursor-pointer ${
                        isActive 
                          ? 'text-brand-emerald-dark bg-gradient-to-r from-brand-gold-dark via-brand-gold to-brand-gold-light' 
                          : 'text-brand-cream/65 hover:text-brand-cream hover:bg-white/[0.03]'
                      }`}
                    >
                      <Icon className="w-4.5 h-4.5" />
                      <span>{item.label}</span>
                    </button>
                  );
                })}
              </nav>

              <div className="border-t border-white/[0.06] pt-4">
                <button
                  onClick={() => {
                    setIsMobileSidebarOpen(false);
                    logout();
                  }}
                  className="w-full py-3 bg-white/[0.02] border border-white/[0.08] text-brand-cream/70 text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen overflow-y-auto px-6 lg:px-12 pt-24 lg:pt-12 pb-12 relative z-10 w-full">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="max-w-7xl mx-auto"
        >
          {renderActiveContent()}
        </motion.div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        duration: 2000,
        className: 'font-sans font-medium text-sm',
        style: {
          background: '#021c13',
          color: '#fdfbf7',
          border: '1px solid rgba(212, 175, 55, 0.2)',
        },
        success: {
          iconTheme: {
            primary: '#d4af37',
            secondary: '#021c13',
          },
        },
      }} />
      <AppContent />
    </AuthProvider>
  );
}
