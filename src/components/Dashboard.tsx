import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  TrendingUp, 
  ShoppingBag, 
  Tag, 
  Clock, 
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';

interface DashboardStats {
  metrics: {
    total_inquiries: number;
    status_counts: {
      pending: number;
      contacted: number;
      confirmed: number;
      fulfilled: number;
      cancelled: number;
    };
    total_estimated_revenue: number;
    products: {
      total: number;
      active: number;
      inactive: number;
    };
  };
  popular_brands: Array<{
    brand: string;
    count: number;
    items_sold: number;
  }>;
  recent_inquiries: Array<{
    id: string;
    reference_code: string;
    customer_name: string;
    customer_email: string;
    total_estimated_price: number;
    status: 'pending' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled';
    created_at: string;
  }>;
}

interface DashboardProps {
  onNavigate: (tab: 'inquiries' | 'catalog') => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (err: any) {
      console.error('Error fetching dashboard statistics:', err);
      toast.error('Failed to load dashboard metrics.');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    // Silent background auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchStats(true);
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading && !stats) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
        <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Assembling Dashboard Intelligence...</p>
      </div>
    );
  }

  const metrics = stats?.metrics;

  return (
    <div className="space-y-8 font-sans">
      {/* Page Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold tracking-wide text-brand-cream">
            Executive Overview
          </h1>
          <p className="text-sm text-brand-cream/60 mt-1">
            Real-time analytics and inquiry intelligence.
          </p>
        </div>
        <button 
          onClick={fetchStats}
          disabled={loading}
          className="p-2.5 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold rounded-sm transition duration-200 cursor-pointer disabled:opacity-50"
          title="Reload metrics"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total revenue */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-xl relative overflow-hidden group hover:border-brand-gold/30 transition duration-300 shadow-lg"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <TrendingUp className="w-20 h-20 text-brand-gold" />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-brand-gold">Confirmed Revenue</p>
          <h3 className="text-2xl font-serif font-bold text-brand-cream mt-2 tracking-wide">
            {formatCurrency(metrics?.total_estimated_revenue || 0)}
          </h3>
          <p className="text-xs text-brand-cream/50 mt-2">From confirmed/fulfilled decants.</p>
        </motion.div>

        {/* Total Inquiries */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-xl relative overflow-hidden group hover:border-brand-gold/30 transition duration-300 shadow-lg"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <Clock className="w-20 h-20 text-brand-gold" />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-brand-gold">Total Orders/Inquiries</p>
          <h3 className="text-2xl font-serif font-bold text-brand-cream mt-2 tracking-wide">
            {metrics?.total_inquiries || 0}
          </h3>
          <div className="flex gap-3 text-xs mt-2 text-brand-cream/60">
            <span>Pending: <strong className="text-yellow-500 font-semibold">{metrics?.status_counts.pending || 0}</strong></span>
            <span>Fulfilled: <strong className="text-emerald-500 font-semibold">{metrics?.status_counts.fulfilled || 0}</strong></span>
          </div>
        </motion.div>

        {/* Active Products */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-xl relative overflow-hidden group hover:border-brand-gold/30 transition duration-300 shadow-lg"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <ShoppingBag className="w-20 h-20 text-brand-gold" />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-brand-gold">Active Decants</p>
          <h3 className="text-2xl font-serif font-bold text-brand-cream mt-2 tracking-wide">
            {metrics?.products.active || 0}
          </h3>
          <p className="text-xs text-brand-cream/50 mt-2">
            Of {metrics?.products.total || 0} total products in catalog.
          </p>
        </motion.div>

        {/* Out of Stock / Inactive */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="bg-white/[0.02] border border-white/[0.06] p-6 rounded-xl relative overflow-hidden group hover:border-brand-gold/30 transition duration-300 shadow-lg"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-25 transition-opacity duration-300">
            <Tag className="w-20 h-20 text-brand-gold" />
          </div>
          <p className="text-xs uppercase font-semibold tracking-wider text-brand-gold">Archived Products</p>
          <h3 className="text-2xl font-serif font-bold text-brand-cream mt-2 tracking-wide">
            {metrics?.products.inactive || 0}
          </h3>
          <p className="text-xs text-brand-cream/50 mt-2">Disabled for customer views.</p>
        </motion.div>
      </div>

      {/* Main Analytics Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Inquiries Panel */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="font-serif text-xl font-semibold text-brand-cream flex items-center gap-2">
              <Clock className="w-5 h-5 text-brand-gold" /> Recent Customer Inquiries
            </h2>
            <button 
              onClick={() => onNavigate('inquiries')}
              className="text-xs uppercase tracking-wider text-brand-gold hover:underline hover:text-brand-gold-light cursor-pointer font-semibold transition"
            >
              Manage All Inquiries →
            </button>
          </div>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-brand-gold font-semibold">
                    <th className="py-4 px-6">Reference</th>
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Date</th>
                    <th className="py-4 px-6">Estimated Total</th>
                    <th className="py-4 px-6 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-sm text-brand-cream/80">
                  {stats?.recent_inquiries.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-12 text-center text-brand-cream/40 italic">
                        No inquiries have been received yet.
                      </td>
                    </tr>
                  ) : (
                    stats?.recent_inquiries.map((inquiry) => {
                      // Status color helper
                      let statusStyle = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                      if (inquiry.status === 'contacted') statusStyle = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                      if (inquiry.status === 'confirmed') statusStyle = 'text-purple-400 bg-purple-400/10 border-purple-400/20';
                      if (inquiry.status === 'fulfilled') statusStyle = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                      if (inquiry.status === 'cancelled') statusStyle = 'text-rose-500 bg-rose-500/10 border-rose-500/20';

                      return (
                        <tr key={inquiry.id} className="hover:bg-white/[0.01] transition duration-150">
                          <td className="py-4 px-6 font-mono font-semibold text-brand-gold select-all">{inquiry.reference_code}</td>
                          <td className="py-4 px-6 font-medium text-brand-cream">{inquiry.customer_name}</td>
                          <td className="py-4 px-6 text-brand-cream/60 text-xs">
                            {new Date(inquiry.created_at).toLocaleDateString(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </td>
                          <td className="py-4 px-6 text-brand-cream/90 font-medium">
                            {formatCurrency(inquiry.total_estimated_price)}
                          </td>
                          <td className="py-4 px-6 text-right">
                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusStyle}`}>
                              {inquiry.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Popular Brands Panel */}
        <div className="space-y-4">
          <h2 className="font-serif text-xl font-semibold text-brand-cream flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-brand-gold" /> Demanded Brands
          </h2>

          <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-6 shadow-xl space-y-5">
            <p className="text-xs text-brand-cream/50 uppercase tracking-widest font-semibold">
              Top 5 Brands by Decant Orders
            </p>

            {stats?.popular_brands.length === 0 ? (
              <div className="py-8 text-center text-brand-cream/40 italic text-sm">
                Insufficient order metrics to represent brands.
              </div>
            ) : (
              <div className="space-y-4">
                {stats?.popular_brands.map((brandInfo, index) => (
                  <div key={brandInfo.brand} className="space-y-1.5">
                    <div className="flex justify-between items-center text-sm">
                      <span className="font-medium text-brand-cream flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-brand-gold w-4">
                          {index + 1}.
                        </span>
                        {brandInfo.brand}
                      </span>
                      <span className="text-xs text-brand-gold font-semibold uppercase tracking-wide">
                        {brandInfo.items_sold} sold ({brandInfo.count} orders)
                      </span>
                    </div>
                    {/* Visual Progress Bar */}
                    <div className="h-1.5 bg-black/40 rounded-full overflow-hidden border border-white/[0.04]">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.min(100, (brandInfo.items_sold / (stats.popular_brands[0]?.items_sold || 1)) * 100)}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="h-full bg-gradient-to-r from-brand-gold-dark to-brand-gold rounded-full"
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="border-t border-white/[0.06] pt-4 mt-2">
              <button
                onClick={() => onNavigate('catalog')}
                className="w-full text-center text-xs uppercase tracking-wider font-semibold text-brand-gold hover:text-brand-gold-light hover:underline transition cursor-pointer"
              >
                View Catalog Inventory →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
