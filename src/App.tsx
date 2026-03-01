import { useState, useEffect, FormEvent, FC, useRef } from 'react';
import { LayoutDashboard, Building2, Wrench, MessageSquare, PieChart, Wallet, Bell, Settings, Menu, X, User, LogOut, Plus, CheckCircle, Sparkles, AlertTriangle, Calendar, DollarSign, ShieldCheck, TrendingUp, TrendingDown, ArrowRight, Bot } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import Markdown from 'react-markdown';
import { Property, FinanceSummary, MaintenanceRequest, Alert, HistoricalFinance } from './types';
import { getAIClient, GEMINI_MODELS } from './services/ai';

// --- Components ---

const MetricCard: FC<{ label: string, value: string, subtext?: string, trend?: 'up' | 'down' | 'neutral', icon?: any }> = ({ label, value, subtext, trend, icon: Icon }) => {
  return (
    <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-stone-50 rounded-lg group-hover:bg-stone-100 transition-colors">
          {Icon && <Icon size={20} className="text-stone-600" />}
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
            trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 
            trend === 'down' ? 'bg-red-50 text-red-600' : 'bg-stone-50 text-stone-600'
          }`}>
            {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : null}
            {trend === 'up' ? '+12%' : trend === 'down' ? '-4%' : 'Stable'}
          </div>
        )}
      </div>
      <h3 className="text-stone-500 text-xs font-medium uppercase tracking-wider mb-1">{label}</h3>
      <div className="text-2xl font-semibold text-stone-900 tracking-tight">{value}</div>
      {subtext && <div className="text-stone-400 text-xs mt-2 flex items-center gap-1">
        <ArrowRight size={12} />
        {subtext}
      </div>}
    </div>
  );
}

const CashFlowChart: FC<{ data: HistoricalFinance[] }> = ({ data }) => {
  if (!data || data.length === 0) return <div className="h-[300px] flex items-center justify-center text-stone-400">No data available</div>;

  return (
    <div className="h-[300px] w-full mt-4 min-h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f4" />
          <XAxis 
            dataKey="month" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#78716c' }} 
            dy={10}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fontSize: 12, fill: '#78716c' }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#fff', 
              borderRadius: '12px', 
              border: '1px solid #e7e5e4',
              boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="profit" 
            stroke="#10b981" 
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorProfit)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

const PropertyRow: FC<{ property: Property }> = ({ property }) => {
  const netCashFlow = (property.monthly_rent || 0) - (property.monthly_payment || 0);
  
  return (
    <div className="grid grid-cols-12 gap-4 p-4 border-b border-stone-100 hover:bg-stone-50 transition-colors items-center group">
      <div className="col-span-4 flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-stone-200 overflow-hidden shrink-0">
          <img src={property.image_url} alt="" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
        </div>
        <div>
          <div className="font-medium text-stone-900 truncate max-w-[200px]">{property.address}</div>
          <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider">{property.type}</div>
        </div>
      </div>
      <div className="col-span-2 text-stone-600 text-sm">
        {property.tenant_name || <span className="text-amber-600 text-[10px] font-bold uppercase bg-amber-50 px-2 py-0.5 rounded-full">Vacant</span>}
      </div>
      <div className="col-span-2 text-stone-900 font-mono text-sm">
        ${property.monthly_rent?.toLocaleString() ?? 0}
      </div>
      <div className="col-span-2 text-stone-500 font-mono text-sm">
        ${property.monthly_payment?.toLocaleString() ?? 0}
      </div>
      <div className={`col-span-2 font-mono text-sm font-medium ${netCashFlow >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
        {netCashFlow >= 0 ? '+' : ''}${netCashFlow.toLocaleString()}
      </div>
    </div>
  );
}

const PropertyCard: FC<{ property: Property }> = ({ property }) => {
  return (
    <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 group">
      <div className="h-56 bg-stone-100 relative overflow-hidden">
        <img 
          src={property.image_url} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider text-stone-900 shadow-sm">
            {property.type}
          </div>
          <div className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm ${
            property.status === 'Leased' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'
          }`}>
            {property.status}
          </div>
        </div>
      </div>
      <div className="p-6">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-lg text-stone-900 leading-tight">{property.address}</h3>
          <div className="text-right">
            <div className="text-xs text-stone-400 uppercase font-medium">Monthly Rent</div>
            <div className="text-lg font-bold text-stone-900">${property.monthly_rent?.toLocaleString() ?? 0}</div>
          </div>
        </div>
        <div className="text-sm text-stone-500 mb-6 flex items-center gap-1">
          <Building2 size={14} />
          {property.city}, {property.state} {property.zip}
        </div>
        
        <div className="grid grid-cols-2 gap-4 py-4 border-t border-stone-100">
          <div>
            <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Tenant</div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-stone-100 flex items-center justify-center text-[10px] font-bold text-stone-600">
                {property.tenant_name ? property.tenant_name.charAt(0) : '?'}
              </div>
              <span className="font-medium text-sm text-stone-800 truncate">
                {property.tenant_name || 'Vacant'}
              </span>
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] text-stone-400 uppercase font-bold tracking-wider mb-1">Payment</div>
            <div className={`text-sm font-bold ${property.payment_status === 'Unpaid' ? 'text-red-600' : 'text-emerald-600'}`}>
              {property.payment_status || 'N/A'}
            </div>
          </div>
        </div>
        
        <button className="w-full mt-2 py-2.5 bg-stone-50 hover:bg-stone-100 text-stone-600 text-sm font-semibold rounded-xl border border-stone-200 transition-colors flex items-center justify-center gap-2">
          View Details
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

const MaintenanceRow: FC<{ request: MaintenanceRequest, onAssign: (id: number) => void }> = ({ request, onAssign }) => {
  return (
    <tr className="hover:bg-stone-50/50 transition-colors group">
      <td className="py-4 px-6">
        <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
          ${request.status === 'pending' ? 'bg-amber-50 text-amber-700 border border-amber-100' : 
            request.status === 'scheduled' ? 'bg-blue-50 text-blue-700 border border-blue-100' : 
            'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
          <div className={`w-1.5 h-1.5 rounded-full ${
            request.status === 'pending' ? 'bg-amber-500' : 
            request.status === 'scheduled' ? 'bg-blue-500' : 
            'bg-emerald-500'
          }`} />
          {request.status}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className={`text-[10px] font-bold uppercase tracking-wider ${
          request.priority === 'emergency' ? 'text-red-600' : 
          request.priority === 'high' ? 'text-amber-600' : 
          'text-stone-400'
        }`}>
          {request.priority}
        </div>
      </td>
      <td className="py-4 px-6">
        <div className="text-sm font-medium text-stone-900 mb-0.5">{request.description}</div>
        <div className="text-xs text-stone-400 flex items-center gap-1">
          <Building2 size={12} />
          {request.address}
        </div>
      </td>
      <td className="py-4 px-6">
        {request.contractor_name ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-emerald-50 flex items-center justify-center">
              <User size={14} className="text-emerald-600" />
            </div>
            <div>
              <div className="text-sm font-semibold text-stone-900 leading-none mb-1">{request.contractor_name}</div>
              <div className="text-[10px] text-stone-400 uppercase font-bold tracking-tight">Assigned</div>
            </div>
          </div>
        ) : (
          <button 
            onClick={() => onAssign(request.id)}
            className="text-xs font-bold text-stone-600 bg-white hover:bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200 shadow-sm transition-all flex items-center gap-2"
          >
            <Plus size={14} />
            Assign
          </button>
        )}
      </td>
      <td className="py-4 px-6 text-right">
        <div className="text-sm font-medium text-stone-900">{new Date(request.reported_date).toLocaleDateString()}</div>
        <div className="text-[10px] text-stone-400 uppercase font-bold tracking-tight">Reported</div>
      </td>
    </tr>
  );
}

function ChatInterface() {
  const [messages, setMessages] = useState<{role: 'user' | 'model', text: string}[]>([
    { role: 'model', text: 'Hello! I am your PropAI Assistant. I can help you analyze your portfolio, draft maintenance responses, or check on your tenants. How can I help?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (textOverride?: string) => {
    const userMsg = textOverride || input;
    if (!userMsg.trim()) return;
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setIsLoading(true);

    try {
      const ai = getAIClient();
      if (!ai) {
        setMessages(prev => [...prev, { role: 'model', text: "I'm sorry, but I haven't been configured with an API key yet. Please add your GEMINI_API_KEY to the environment variables." }]);
        setIsLoading(false);
        return;
      }
      
      const contextRes = await fetch('/api/dashboard/data');
      if (!contextRes.ok) throw new Error("Failed to fetch context");
      const contextData = await contextRes.json();
      const context = JSON.stringify(contextData);

      const response = await ai.models.generateContent({
        model: GEMINI_MODELS.FLASH,
        contents: { parts: [{ text: userMsg }] },
        config: {
          systemInstruction: `You are an expert Property Management AI assistant named PropAI. 
          You have access to the user's real estate portfolio data.
          Answer questions concisely and professionally. 
          ALWAYS format your responses using Markdown for better readability:
          - Use bold text for names and amounts.
          - Use bulleted lists for multiple items (like tenants or properties).
          - Use tables for structured data if appropriate.
          - Use headers for different sections of your response.
          If asked about maintenance, suggest actions.
          If asked about finances, provide summaries.
          Current Data Context: ${context}`
        }
      });
      
      setMessages(prev => [...prev, { role: 'model', text: response.text || '' }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: `I'm having trouble connecting to the server right now. Please try again.` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickActions = [
    { label: 'Portfolio Summary', prompt: 'Give me a summary of my portfolio performance.' },
    { label: 'Overdue Rent', prompt: 'Which tenants have overdue rent?' },
    { label: 'Maintenance Issues', prompt: 'Show me all high priority maintenance requests.' },
  ];

  return (
    <div className="flex flex-col h-full bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
      <div className="p-4 border-b border-stone-100 bg-stone-50/50 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-stone-900 rounded-lg">
            <Bot size={16} className="text-white" />
          </div>
          <div>
            <span className="font-semibold text-stone-900 text-sm block leading-none">PropAI Assistant</span>
            <span className="text-[10px] text-emerald-600 font-medium uppercase tracking-wider">Online</span>
          </div>
        </div>
      </div>
      
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scroll-smooth">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
              m.role === 'user' 
                ? 'bg-stone-900 text-white rounded-tr-none shadow-sm' 
                : 'bg-stone-100 text-stone-800 rounded-tl-none'
            }`}>
              {m.role === 'user' ? m.text : (
                <div className="markdown-body prose prose-sm prose-stone max-w-none">
                  <Markdown>{m.text}</Markdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 p-3 rounded-2xl rounded-tl-none text-sm text-stone-500 flex items-center gap-2">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-stone-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-stone-100 bg-white">
        <div className="flex flex-wrap gap-2 mb-4">
          {quickActions.map((action, i) => (
            <button
              key={i}
              onClick={() => handleSend(action.prompt)}
              className="text-[11px] font-medium text-stone-600 bg-stone-50 hover:bg-stone-100 border border-stone-200 px-3 py-1.5 rounded-full transition-colors"
            >
              {action.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            className="flex-1 bg-stone-50 border border-stone-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-stone-900/10 transition-all"
            placeholder="Type a message..."
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
            className="bg-stone-900 text-white p-2.5 rounded-xl hover:bg-stone-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
          >
            <MessageSquare size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

function TenantPortal({ onLogout }: { onLogout: () => void }) {
  const [request, setRequest] = useState({ description: '', priority: 'normal' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    await fetch('/api/maintenance', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        property_id: 'PROP001', // Hardcoded for demo
        tenant_id: 'TEN001',   // Hardcoded for demo
        description: request.description,
        priority: request.priority
      })
    });
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setRequest({ description: '', priority: 'normal' });
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-stone-50 p-6 flex flex-col items-center justify-center">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden border border-stone-100">
        <div className="bg-stone-900 p-6 text-white flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Welcome Home</h1>
            <p className="text-stone-400 text-sm">123 Oak Street</p>
          </div>
          <button onClick={onLogout} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <LogOut size={18} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="bg-emerald-50 border border-emerald-100 p-4 rounded-xl flex justify-between items-center">
            <div>
              <div className="text-xs text-emerald-600 font-medium uppercase tracking-wide">Next Rent Due</div>
              <div className="text-2xl font-semibold text-emerald-900">$3,200</div>
            </div>
            <button 
              onClick={async () => {
                await fetch('/api/tenants/TEN001/pay', { method: 'POST' });
                alert('Rent paid successfully!');
              }}
              className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700"
            >
              Pay Now
            </button>
          </div>

          <div>
            <h2 className="text-lg font-medium text-stone-900 mb-4">Request Maintenance</h2>
            {submitted ? (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-green-50 text-green-800 p-4 rounded-xl text-center text-sm">
                Request submitted successfully! The property manager has been notified.
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Issue Description</label>
                  <textarea 
                    required
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-stone-900/10 focus:outline-none resize-none h-32"
                    placeholder="Describe the issue (e.g., Leaky faucet in bathroom)..."
                    value={request.description}
                    onChange={e => setRequest({...request, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-stone-500 uppercase mb-1">Priority</label>
                  <select 
                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-stone-900/10 focus:outline-none"
                    value={request.priority}
                    onChange={e => setRequest({...request, priority: e.target.value})}
                  >
                    <option value="low">Low (Cosmetic)</option>
                    <option value="normal">Normal (Standard Repair)</option>
                    <option value="high">High (Urgent)</option>
                    <option value="emergency">Emergency (Safety Hazard)</option>
                  </select>
                </div>
                <button type="submit" className="w-full bg-stone-900 text-white py-3 rounded-xl font-medium hover:bg-stone-800 transition-colors flex items-center justify-center gap-2">
                  <Wrench size={18} />
                  Submit Request
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContractorModal({ isOpen, onClose, onAssign, contractors }: { isOpen: boolean, onClose: () => void, onAssign: (id: number) => void, contractors: any[] }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-4 border-b border-stone-100 flex justify-between items-center">
          <h3 className="font-medium">Select Contractor</h3>
          <button onClick={onClose}><X size={18} className="text-stone-400" /></button>
        </div>
        <div className="p-2">
          {contractors.map(c => (
            <button 
              key={c.id}
              onClick={() => onAssign(c.id)}
              className="w-full text-left p-3 hover:bg-stone-50 rounded-lg flex items-center justify-between group"
            >
              <div>
                <div className="font-medium text-stone-900">{c.name}</div>
                <div className="text-xs text-stone-500">{c.specialty}</div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 text-stone-400 text-xs">Assign</div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Toast({ message, onClose }: { message: string, onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 4000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 50, scale: 0.9 }} 
      animate={{ opacity: 1, y: 0, scale: 1 }} 
      exit={{ opacity: 0, y: 20, scale: 0.9 }}
      className="fixed bottom-6 right-6 bg-stone-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 z-50"
    >
      <div className="bg-emerald-500/20 p-1.5 rounded-lg">
        <Sparkles size={18} className="text-emerald-400" />
      </div>
      <div className="text-sm font-medium">{message}</div>
    </motion.div>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'properties' | 'maintenance' | 'alerts'>('dashboard');
  const [finance, setFinance] = useState<FinanceSummary | null>(null);
  const [historicalFinance, setHistoricalFinance] = useState<HistoricalFinance[]>([]);
  const [properties, setProperties] = useState<Property[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceRequest[]>([]);
  const [contractors, setContractors] = useState<any[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isTenantView, setIsTenantView] = useState(false);
  const [assigningId, setAssigningId] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [alertContact, setAlertContact] = useState('');

  const refreshData = () => {
    fetch('/api/dashboard/data')
      .then(r => {
        if (!r.ok) throw new Error(`HTTP error! status: ${r.status}`);
        return r.json();
      })
      .then(data => {
        console.log("Dashboard data received:", data);
        setFinance(data.finance);
        setHistoricalFinance(data.historical_finance || []);
        setProperties(data.properties);
        setMaintenance(data.maintenance);
        setContractors(data.contractors);
        setAlerts(data.alerts);
      })
      .catch(err => {
        console.error("Error fetching dashboard data:", err);
      });
  };

  useEffect(() => {
    fetch('/api/health')
      .then(r => r.json())
      .then(d => console.log("Backend health check:", d))
      .catch(e => console.error("Backend health check failed:", e));
    
    refreshData();
    // Poll for updates every 5 seconds to see new tenant requests
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (contractorId: number) => {
    if (!assigningId) return;
    
    const contractorName = contractors.find(c => c.id === contractorId)?.name;

    // Optimistic update
    setMaintenance(prev => prev.map(m => 
      m.id === assigningId ? { ...m, status: 'scheduled', contractor_name: contractorName } : m
    ));
    setAssigningId(null);
    setToast(`AI Agent: Contacting ${contractorName} to schedule repairs...`);

    await fetch(`/api/maintenance/${assigningId}/assign`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contractor_id: contractorId })
    });
    
    // Simulate AI Agent Action
    const ai = getAIClient();
    if (ai) {
      // In a real app, this would trigger a backend job
      console.log("AI Agent: Drafting email to contractor...");
    }
  };

  if (isTenantView) {
    return <TenantPortal onLogout={() => setIsTenantView(false)} />;
  }

  return (
    <div className="flex h-screen bg-[#F5F5F4] text-stone-900 font-sans overflow-hidden">
      <AnimatePresence>
        {toast && <Toast message={toast} onClose={() => setToast(null)} />}
      </AnimatePresence>

      <ContractorModal 
        isOpen={!!assigningId} 
        onClose={() => setAssigningId(null)} 
        onAssign={handleAssign}
        contractors={contractors}
      />
      
      {/* Sidebar */}
      <motion.div 
        initial={false}
        animate={{ width: isSidebarOpen ? 260 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-stone-200 flex flex-col shrink-0 overflow-hidden"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-8 h-8 bg-stone-900 rounded-lg flex items-center justify-center text-white font-bold">P</div>
            <span className="font-semibold text-lg tracking-tight">PropAI</span>
          </div>
          
          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Overview' },
              { id: 'properties', icon: Building2, label: 'Properties' },
              { id: 'maintenance', icon: Wrench, label: 'Maintenance' },
              { id: 'alerts', icon: Bell, label: 'Alerts', count: alerts.length },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === item.id 
                    ? 'bg-stone-100 text-stone-900' 
                    : 'text-stone-500 hover:bg-stone-50 hover:text-stone-900'
                }`}
              >
                <item.icon size={18} />
                <span className="flex-1 text-left">{item.label}</span>
                {item.count ? (
                  <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full font-bold">{item.count}</span>
                ) : null}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-6 border-t border-stone-100">
          <button 
            onClick={() => setIsTenantView(true)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-stone-500 hover:bg-stone-50 hover:text-stone-900 transition-colors mb-2"
          >
            <User size={18} />
            Switch to Tenant View
          </button>
          <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
            <div className="w-8 h-8 rounded-full bg-stone-200" />
            <div className="text-sm">
              <div className="font-medium">Landlord User</div>
              <div className="text-stone-500 text-xs">Premium Plan</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-16 border-b border-stone-200 bg-white/50 backdrop-blur-sm flex items-center justify-between px-6 shrink-0">
          <button onClick={() => setSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-stone-100 rounded-lg text-stone-500">
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-stone-100 px-3 py-1.5 rounded-lg">
              <span className="text-xs text-stone-500 font-medium uppercase">Alert Contact:</span>
              <input 
                className="bg-transparent border-none text-sm focus:outline-none w-40"
                placeholder="Enter email/phone"
                value={alertContact}
                onChange={e => setAlertContact(e.target.value)}
              />
            </div>
            <button className="p-2 hover:bg-stone-100 rounded-full text-stone-400 relative">
              <Bell size={20} />
              {alerts.length > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-7xl mx-auto space-y-6">
            
            {/* Dashboard View */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                <div className="flex items-end justify-between">
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-900">Financial Overview</h1>
                    <p className="text-stone-500 mt-1">Real-time tracking of your portfolio performance.</p>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-stone-500">Net Monthly Cash Flow</div>
                    <div className="text-2xl font-mono font-medium text-emerald-600">
                      +${((finance?.total_rent || 0) - (finance?.total_mortgage || 0)).toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <MetricCard 
                    label="Total Asset Value" 
                    value={`$${(finance?.total_asset_value || 0).toLocaleString()}`} 
                    icon={Building2}
                    trend="up"
                    subtext="Market value estimate"
                  />
                  <MetricCard 
                    label="Outstanding Principal" 
                    value={`$${(finance?.total_debt || 0).toLocaleString()}`} 
                    icon={Wallet}
                    trend="down"
                    subtext="Total mortgage debt"
                  />
                  <MetricCard 
                    label="Monthly Revenue" 
                    value={`$${(finance?.total_rent || 0).toLocaleString()}`} 
                    icon={DollarSign}
                    trend="up"
                    subtext="Gross rental income"
                  />
                  <MetricCard 
                    label="Monthly Mortgage" 
                    value={`$${(finance?.total_mortgage || 0).toLocaleString()}`} 
                    icon={Calendar}
                    trend="neutral"
                    subtext="Total debt service"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-medium">Cash Flow Trends</h2>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                            <span className="text-xs text-stone-500">Net Profit</span>
                          </div>
                        </div>
                      </div>
                      <CashFlowChart data={historicalFinance} />
                    </div>

                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 overflow-hidden flex flex-col">
                      <h2 className="text-lg font-medium mb-4">Property Performance</h2>
                      <div className="flex-1 overflow-y-auto">
                        <div className="grid grid-cols-12 gap-4 px-4 py-2 border-b border-stone-100 text-xs font-medium text-stone-400 uppercase tracking-wider">
                          <div className="col-span-4">Property</div>
                          <div className="col-span-2">Tenant</div>
                          <div className="col-span-2">Rent</div>
                          <div className="col-span-2">Mortgage</div>
                          <div className="col-span-2">Net</div>
                        </div>
                        {properties.map(p => <PropertyRow key={p.id} property={p} />)}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:col-span-1 h-[800px] lg:h-auto">
                    <ChatInterface />
                  </div>
                </div>
              </motion.div>
            )}

            {/* Properties View */}
            {activeTab === 'properties' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-900">Portfolio</h1>
                    <p className="text-stone-500 mt-1">Manage and track your real estate assets.</p>
                  </div>
                  <button className="bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all flex items-center gap-2 shadow-sm">
                    <Plus size={18} />
                    Add Property
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {properties.map(p => (
                    <PropertyCard key={p.id} property={p} />
                  ))}
                </div>
              </motion.div>
            )}

            {/* Maintenance View */}
            {activeTab === 'maintenance' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-900">Maintenance</h1>
                    <p className="text-stone-500 mt-1">Track and manage service requests across your properties.</p>
                  </div>
                  <button className="bg-stone-900 text-white px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-stone-800 transition-all flex items-center gap-2 shadow-sm">
                    <Plus size={18} />
                    New Request
                  </button>
                </div>
                
                <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-stone-50/50 border-b border-stone-100">
                          <th className="py-4 px-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Status</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Priority</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Issue & Location</th>
                          <th className="py-4 px-6 text-[10px] font-bold text-stone-400 uppercase tracking-widest">Contractor</th>
                          <th className="py-4 px-6 text-right text-[10px] font-bold text-stone-400 uppercase tracking-widest">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-100">
                        {maintenance.map(m => (
                          <MaintenanceRow key={m.id} request={m} onAssign={(id) => setAssigningId(id)} />
                        ))}
                        {maintenance.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-12 text-center">
                              <div className="flex flex-col items-center gap-2 text-stone-400">
                                <Wrench size={32} strokeWidth={1.5} />
                                <p className="text-sm font-medium">No active maintenance requests</p>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Alerts View */}
            {activeTab === 'alerts' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h1 className="text-2xl font-semibold text-stone-900">Notifications</h1>
                    <p className="text-stone-500 mt-1">Stay updated on your portfolio's critical events.</p>
                  </div>
                  <div className="bg-stone-100 px-3 py-1 rounded-full text-xs font-bold text-stone-600 uppercase tracking-wider">
                    {alerts.length} Total
                  </div>
                </div>

                <div className="space-y-4">
                  {alerts.map((a, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all flex gap-4 items-start group">
                      <div className={`p-3 rounded-xl shrink-0 ${
                        a.type === 'payment_overdue' ? 'bg-red-50 text-red-600' :
                        a.type === 'lease_end' ? 'bg-amber-50 text-amber-600' :
                        a.type === 'emi_due' ? 'bg-blue-50 text-blue-600' :
                        a.type === 'escrow_due' ? 'bg-purple-50 text-purple-600' :
                        a.type === 'warranty_end' ? 'bg-orange-50 text-orange-600' :
                        'bg-emerald-50 text-emerald-600'
                      }`}>
                        {a.type === 'payment_overdue' && <AlertTriangle size={20} />}
                        {a.type === 'lease_end' && <Calendar size={20} />}
                        {a.type === 'emi_due' && <Wallet size={20} />}
                        {a.type === 'escrow_due' && <ShieldCheck size={20} />}
                        {a.type === 'warranty_end' && <Wrench size={20} />}
                        {a.type === 'rent_paid' && <CheckCircle size={20} />}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-semibold text-stone-900 capitalize">{a.type.replace('_', ' ')}</h3>
                          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{new Date(a.date).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-stone-500 leading-relaxed">
                          {a.message}
                        </p>
                        <div className="mt-4 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="text-xs font-bold text-stone-900 bg-stone-50 hover:bg-stone-100 px-3 py-1.5 rounded-lg border border-stone-200 transition-colors">
                            Take Action
                          </button>
                          <button className="text-xs font-bold text-stone-400 hover:text-stone-600 px-3 py-1.5 transition-colors">
                            Dismiss
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {alerts.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-stone-200">
                      <Bell size={48} className="mx-auto text-stone-200 mb-4" />
                      <p className="text-stone-500 font-medium">All caught up! No new alerts.</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
}
