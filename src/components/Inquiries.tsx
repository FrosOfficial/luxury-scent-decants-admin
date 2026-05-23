import React, { useEffect, useState } from 'react';
import api from '../lib/api';
import { 
  Search, 
  Filter, 
  Calendar, 
  ChevronLeft, 
  ChevronRight, 
  ExternalLink,
  MessageSquare,
  Copy,
  X,
  FileText,
  User,
  MapPin,
  Mail,
  Phone,
  ShoppingBag
} from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface InquiryItem {
  id: string;
  product_name: string;
  product_brand: string;
  volume_size: string;
  unit_price: number;
  quantity: number;
}

interface Inquiry {
  id: string;
  user_id: string | null;
  reference_code: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  city: string;
  province: string;
  facebook_profile: string | null;
  additional_notes: string | null;
  status: 'pending' | 'contacted' | 'confirmed' | 'fulfilled' | 'cancelled';
  total_estimated_price: number;
  messenger_message: string;
  created_at: string;
  updated_at: string;
  items: InquiryItem[];
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number;
  to: number;
}

export const Inquiries: React.FC = () => {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  
  // Filter States
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const fetchInquiries = async (background = false) => {
    if (!background) setLoading(true);
    try {
      const params: any = { page };
      if (search) params.search = search;
      if (status) params.status = status;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await api.get('/admin/inquiries', { params });
      setInquiries(response.data.data);
      setPagination({
        current_page: response.data.current_page,
        last_page: response.data.last_page,
        per_page: response.data.per_page,
        total: response.data.total,
        from: response.data.from,
        to: response.data.to,
      });
    } catch (err: any) {
      console.error('Error fetching inquiries:', err);
      toast.error('Failed to load inquiries.');
    } finally {
      if (!background) setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries();

    // Silent background auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchInquiries(true);
    }, 30000);

    return () => clearInterval(interval);
  }, [page, status, startDate, endDate]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInquiries();
  };

  const handleClearFilters = () => {
    setSearch('');
    setStatus('');
    setStartDate('');
    setEndDate('');
    setPage(1);
  };

  const handleRowClick = async (inquiryId: string) => {
    try {
      const response = await api.get(`/admin/inquiries/${inquiryId}`);
      setSelectedInquiry(response.data);
    } catch (err: any) {
      console.error('Error fetching inquiry details:', err);
      toast.error('Failed to load inquiry details.');
    }
  };

  const handleStatusChange = async (inquiryId: string, newStatus: Inquiry['status']) => {
    try {
      const response = await api.patch(`/admin/inquiries/${inquiryId}/status`, {
        status: newStatus
      });
      
      const updatedInquiry = response.data.inquiry;
      toast.success(`Inquiry status updated to ${newStatus.toUpperCase()}`);
      
      // Update local list
      setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq));
      
      // Update selected modal inquiry
      if (selectedInquiry && selectedInquiry.id === inquiryId) {
        setSelectedInquiry(updatedInquiry);
      }
    } catch (err: any) {
      console.error('Error changing inquiry status:', err);
      toast.error(err.response?.data?.message || 'Failed to update status.');
    }
  };

  const handleCopyClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Inquiry Messenger template copied to clipboard.');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-PH', {
      style: 'currency',
      currency: 'PHP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Page Header */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-wide text-brand-cream">
          Inquiry Intelligence
        </h1>
        <p className="text-sm text-brand-cream/60 mt-1">
          Review, status sync, and communication routing for customer orders.
        </p>
      </div>

      {/* Advanced Filter Toolbar */}
      <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 shadow-xl space-y-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Box */}
          <div className="md:col-span-2 relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-brand-gold/60">
              <Search className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              placeholder="Search by Reference, Customer Name, Email, or Phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream placeholder-brand-cream/30 focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            />
          </div>

          {/* Status Dropdown */}
          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-4 py-2.5 bg-black/40 border border-brand-gold/20 focus:border-brand-gold rounded-sm text-brand-cream focus:outline-none focus:ring-1 focus:ring-brand-gold text-sm"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="contacted">Contacted</option>
              <option value="confirmed">Confirmed</option>
              <option value="fulfilled">Fulfilled</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <button
              type="submit"
              className="flex-1 py-2.5 bg-brand-gold text-brand-emerald-dark font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light active:scale-[0.98] transition cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Filter className="w-3.5 h-3.5" /> Filter
            </button>
            {(search || status || startDate || endDate) && (
              <button
                type="button"
                onClick={handleClearFilters}
                className="py-2.5 px-4 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>
        </form>

        {/* Date Filters Expansion */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-brand-cream/60 border-t border-white/[0.04] pt-4">
          <span className="font-semibold uppercase text-brand-gold flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" /> Filter by Date Received:
          </span>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase">Start</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => {
                setStartDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-[10px] uppercase">End</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => {
                setEndDate(e.target.value);
                setPage(1);
              }}
              className="px-2 py-1 bg-black/40 border border-brand-gold/20 rounded-sm text-brand-cream focus:outline-none focus:border-brand-gold text-xs"
            />
          </div>
        </div>
      </div>

      {/* Main Table Display */}
      {loading ? (
        <div className="flex flex-col items-center justify-center h-[40vh] gap-4">
          <div className="w-10 h-10 border-4 border-brand-gold border-t-transparent rounded-full animate-spin"></div>
          <p className="text-brand-gold font-medium uppercase tracking-widest text-xs">Querying Order Ledger...</p>
        </div>
      ) : (
        <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/[0.06] bg-white/[0.02] text-xs uppercase tracking-wider text-brand-gold font-semibold">
                  <th className="py-4 px-6">Reference</th>
                  <th className="py-4 px-6">Customer</th>
                  <th className="py-4 px-6">Date Received</th>
                  <th className="py-4 px-6">Estimated Total</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04] text-sm text-brand-cream/80">
                {inquiries.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center text-brand-cream/40 italic">
                      No customer inquiries match the current filter criteria.
                    </td>
                  </tr>
                ) : (
                  inquiries.map((inquiry) => {
                    let statusStyle = 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
                    if (inquiry.status === 'contacted') statusStyle = 'text-blue-400 bg-blue-400/10 border-blue-400/20';
                    if (inquiry.status === 'confirmed') statusStyle = 'text-purple-400 bg-purple-400/10 border-purple-400/20';
                    if (inquiry.status === 'fulfilled') statusStyle = 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                    if (inquiry.status === 'cancelled') statusStyle = 'text-rose-500 bg-rose-500/10 border-rose-500/20';

                    return (
                      <tr 
                        key={inquiry.id} 
                        className="hover:bg-white/[0.01] transition duration-150 cursor-pointer"
                        onClick={() => handleRowClick(inquiry.id)}
                      >
                        <td className="py-4 px-6 font-mono font-semibold text-brand-gold select-all">{inquiry.reference_code}</td>
                        <td className="py-4 px-6">
                          <div className="font-medium text-brand-cream">{inquiry.customer_name}</div>
                          <div className="text-xs text-brand-cream/50 mt-0.5">{inquiry.customer_phone}</div>
                        </td>
                        <td className="py-4 px-6 text-brand-cream/60 text-xs">
                          {new Date(inquiry.created_at).toLocaleString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-4 px-6 text-brand-cream/90 font-medium">
                          {formatCurrency(inquiry.total_estimated_price)}
                        </td>
                        <td className="py-4 px-6">
                          <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider border ${statusStyle}`}>
                            {inquiry.status}
                          </span>
                        </td>
                        <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
                          {/* Inline fast status toggle */}
                          <select
                            value={inquiry.status}
                            onChange={(e) => handleStatusChange(inquiry.id, e.target.value as Inquiry['status'])}
                            className="bg-black/40 border border-white/[0.08] hover:border-brand-gold text-brand-cream text-xs rounded-sm p-1.5 focus:outline-none"
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="fulfilled">Fulfilled</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pagination && pagination.last_page > 1 && (
            <div className="bg-white/[0.02] border-t border-white/[0.06] px-6 py-4 flex items-center justify-between text-xs text-brand-cream/60">
              <div>
                Showing <strong className="font-semibold text-brand-cream">{pagination.from}</strong> to{' '}
                <strong className="font-semibold text-brand-cream">{pagination.to}</strong> of{' '}
                <strong className="font-semibold text-brand-cream">{pagination.total}</strong> results
              </div>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(prev => prev - 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  disabled={page === pagination.last_page}
                  onClick={() => setPage(prev => prev + 1)}
                  className="p-2 border border-white/[0.08] hover:border-brand-gold text-brand-gold rounded-sm disabled:opacity-30 disabled:pointer-events-none transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Inquiry Details Glass Modal */}
      <AnimatePresence>
        {selectedInquiry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="bg-brand-emerald-dark border border-brand-gold/30 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative p-8 text-brand-cream font-sans"
            >
              {/* Top border gold light leaks */}
              <div className="absolute top-0 left-0 right-0 h-[1.5px] bg-gradient-to-r from-transparent via-brand-gold/50 to-transparent"></div>

              {/* Close Button */}
              <button 
                onClick={() => setSelectedInquiry(null)}
                className="absolute top-6 right-6 p-2 text-brand-cream/60 hover:text-brand-gold transition cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>

              {/* Modal Title Banner */}
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/[0.08] pb-6 mb-6 gap-4">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xl font-bold tracking-wider text-brand-gold">{selectedInquiry.reference_code}</span>
                    <span className="text-xs text-brand-cream/40 uppercase">Inquiry Receipt</span>
                  </div>
                  <p className="text-xs text-brand-cream/60 mt-1">
                    Submitted on {new Date(selectedInquiry.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <label className="text-xs font-semibold uppercase text-brand-gold tracking-wide">Status Workflow:</label>
                  <select
                    value={selectedInquiry.status}
                    onChange={(e) => handleStatusChange(selectedInquiry.id, e.target.value as Inquiry['status'])}
                    className="bg-black/60 border border-brand-gold/30 text-brand-gold text-xs font-bold uppercase tracking-wider rounded-sm py-2 px-3 focus:outline-none focus:ring-1 focus:ring-brand-gold"
                  >
                    <option value="pending">Pending Review</option>
                    <option value="contacted">Customer Contacted</option>
                    <option value="confirmed">Order Confirmed</option>
                    <option value="fulfilled">Inquiry Fulfilled</option>
                    <option value="cancelled">Inquiry Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Modal Grid content */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Column 1: Customer Profile & Order Items */}
                <div className="space-y-6">
                  {/* Customer Information Card */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
                    <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                      <User className="w-4.5 h-4.5 text-brand-gold" /> Customer Profile
                    </h3>
                    <div className="space-y-3 text-sm text-brand-cream/80">
                      <div className="flex gap-3">
                        <span className="font-medium text-brand-cream min-w-[70px]">Name:</span>
                        <span>{selectedInquiry.customer_name}</span>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1">
                          <Mail className="w-3.5 h-3.5 text-brand-gold/60" /> Email:
                        </span>
                        <a href={`mailto:${selectedInquiry.customer_email}`} className="text-brand-gold hover:underline font-medium">
                          {selectedInquiry.customer_email}
                        </a>
                      </div>
                      <div className="flex gap-3 items-center">
                        <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-brand-gold/60" /> Phone:
                        </span>
                        <a href={`tel:${selectedInquiry.customer_phone}`} className="text-brand-gold hover:underline">
                          {selectedInquiry.customer_phone}
                        </a>
                      </div>
                      <div className="flex gap-3 items-start">
                        <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-gold/60" /> Address:
                        </span>
                        <div>
                          <div>{selectedInquiry.delivery_address}</div>
                          <div className="text-xs text-brand-cream/50 mt-0.5">{selectedInquiry.city}, {selectedInquiry.province}</div>
                        </div>
                      </div>
                      
                      {selectedInquiry.facebook_profile && (
                        <div className="flex gap-3 items-center pt-2 border-t border-white/[0.04]">
                          <span className="font-medium text-brand-cream min-w-[70px] flex items-center gap-1">
                            <svg className="w-3.5 h-3.5 text-brand-gold/60 fill-current" viewBox="0 0 24 24">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg> FB:
                          </span>
                          <a 
                            href={selectedInquiry.facebook_profile.startsWith('http') ? selectedInquiry.facebook_profile : `https://${selectedInquiry.facebook_profile}`}
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="text-brand-gold hover:underline inline-flex items-center gap-1 font-medium"
                          >
                            Visit Profile <ExternalLink className="w-3 h-3" />
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Additional Notes Card */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-3">
                    <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                      <FileText className="w-4.5 h-4.5 text-brand-gold" /> Special Instructions
                    </h3>
                    <p className="text-sm text-brand-cream/80 whitespace-pre-line leading-relaxed italic">
                      {selectedInquiry.additional_notes || 'No special requests or instructions provided by client.'}
                    </p>
                  </div>
                </div>

                {/* Column 2: Order decants & Messenger copy paste template */}
                <div className="space-y-6">
                  {/* Decant Items list */}
                  <div className="bg-white/[0.02] border border-white/[0.06] rounded-xl p-5 space-y-4">
                    <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                      <ShoppingBag className="w-4.5 h-4.5 text-brand-gold" /> Decant Selection Details
                    </h3>
                    
                    <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                      {selectedInquiry.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center py-2 border-b border-white/[0.03] text-sm last:border-b-0">
                          <div>
                            <div className="font-medium text-brand-cream">{item.product_name}</div>
                            <div className="text-xs text-brand-cream/50 mt-0.5">{item.product_brand} • Size: {item.volume_size}</div>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-brand-gold">{formatCurrency(item.unit_price * item.quantity)}</div>
                            <div className="text-xs text-brand-cream/40 mt-0.5">{formatCurrency(item.unit_price)} × {item.quantity}</div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="border-t border-white/[0.06] pt-4 flex justify-between items-center text-base">
                      <span className="font-serif font-semibold text-brand-cream">Estimated Bill Summary:</span>
                      <span className="font-bold text-brand-gold text-lg">{formatCurrency(selectedInquiry.total_estimated_price)}</span>
                    </div>
                  </div>

                  {/* Messenger Communication Card */}
                  <div className="bg-white/[0.02] border border-brand-gold/10 rounded-xl p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                      <MessageSquare className="w-20 h-20 text-brand-gold" />
                    </div>

                    <h3 className="font-serif text-base font-semibold text-brand-cream flex items-center gap-2 border-b border-white/[0.04] pb-2">
                      <MessageSquare className="w-4.5 h-4.5 text-brand-gold" /> Pre-built Messenger Format
                    </h3>
                    
                    <p className="text-xs text-brand-cream/60">
                      Copy this template to respond back to the user on Messenger easily.
                    </p>

                    <div className="bg-black/60 border border-white/[0.08] rounded-sm p-4 text-[11px] font-mono text-brand-cream/80 max-h-[160px] overflow-y-auto whitespace-pre-wrap select-all">
                      {selectedInquiry.messenger_message}
                    </div>

                    <div className="flex gap-3">
                      <button
                        onClick={() => handleCopyClipboard(selectedInquiry.messenger_message)}
                        className="flex-1 py-2.5 bg-white/[0.03] border border-white/[0.08] hover:border-brand-gold/40 text-brand-gold text-xs font-semibold uppercase tracking-wider rounded-sm transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <Copy className="w-3.5 h-3.5" /> Copy Message
                      </button>

                      {/* Direct Messenger Chat redirect */}
                      <a
                        href={`https://m.me/LuxuryScentDecants?ref=${selectedInquiry.reference_code}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 py-2.5 bg-brand-gold text-brand-emerald-dark font-semibold text-xs tracking-wider uppercase rounded-sm hover:bg-brand-gold-light transition cursor-pointer flex items-center justify-center gap-2"
                      >
                        <ExternalLink className="w-3.5 h-3.5" /> Open Messenger
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
