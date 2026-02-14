
import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Repeat, 
  Store, 
  Settings, 
  Bell, 
  Search, 
  Plus, 
  Activity,
  Calendar,
  ShieldAlert,
  ArrowRightLeft,
  Hospital as HospitalIcon,
  Trash2,
  ChevronRight,
  TrendingUp,
  Brain
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { MOCK_INVENTORY, MOCK_HOSPITALS, MY_HOSPITAL_ID, CATEGORIES } from './constants';
import { InventoryItem, Category, SwapRequest, AnalysisResult } from './types';
import { analyzeInventoryEfficiency } from './services/geminiService';

// --- Components ---

const Sidebar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (t: string) => void }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'My Inventory', icon: Package },
    { id: 'marketplace', label: 'Marketplace', icon: Store },
    { id: 'swaps', label: 'Swap Requests', icon: Repeat },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Activity className="text-white w-6 h-6" />
        </div>
        <span className="text-xl font-bold text-slate-900 tracking-tight">MedSwap Pro</span>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              activeTab === item.id 
                ? 'bg-blue-50 text-blue-700 font-semibold' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 hover:bg-slate-50 rounded-xl transition-all">
          <Settings size={20} />
          Settings
        </button>
      </div>
    </aside>
  );
};

const Header = ({ title }: { title: string }) => (
  <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10">
    <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
    <div className="flex items-center gap-4">
      <div className="relative group">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input 
          type="text" 
          placeholder="Search items, hospitals..."
          className="pl-10 pr-4 py-2 bg-slate-100 rounded-full border-none focus:ring-2 focus:ring-blue-500 w-64 transition-all"
        />
      </div>
      <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full relative">
        <Bell size={22} />
        <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
      </button>
      <div className="h-10 w-10 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
        <img src="https://picsum.photos/seed/doctor/100" alt="Avatar" />
      </div>
    </div>
  </header>
);

// Fix: Use React.FC to properly handle intrinsic attributes like 'key'
const InventoryCard: React.FC<{ item: InventoryItem, onRemove: (id: string) => void }> = ({ item, onRemove }) => {
  const isExpired = new Date(item.expirationDate) < new Date();
  const isClose = new Date(item.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all group">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wider ${
          item.category === 'Medicine' ? 'bg-blue-100 text-blue-700' :
          item.category === 'PPE' ? 'bg-green-100 text-green-700' :
          'bg-slate-100 text-slate-700'
        }`}>
          {item.category}
        </span>
        <button onClick={() => onRemove(item.id)} className="text-slate-300 hover:text-red-500 transition-colors">
          <Trash2 size={18} />
        </button>
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{item.name}</h3>
      <p className="text-slate-500 text-sm mb-4 line-clamp-2 min-h-[40px]">{item.description}</p>
      
      <div className="flex items-center justify-between text-sm text-slate-600 mb-4 bg-slate-50 p-3 rounded-xl">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Qty</span>
          <span className="font-bold text-slate-900">{item.quantity} {item.unit}</span>
        </div>
        <div className="flex flex-col text-right">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-tighter">Expiry</span>
          <span className={`font-bold ${isExpired ? 'text-red-600' : isClose ? 'text-amber-600' : 'text-slate-900'}`}>
            {new Date(item.expirationDate).toLocaleDateString()}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl text-sm transition-all shadow-sm">
          Mark as Swapped
        </button>
      </div>
    </div>
  );
};

// Fix: Use React.FC to properly handle intrinsic attributes like 'key'
const MarketplaceCard: React.FC<{ item: InventoryItem, onSwap: (item: InventoryItem) => void }> = ({ item, onSwap }) => {
  const hospital = MOCK_HOSPITALS.find(h => h.id === item.hospitalId);
  
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-xl transition-all">
      <div className="h-32 bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center relative">
        <Package size={48} className="text-blue-200" />
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/50 flex items-center gap-1">
          <HospitalIcon size={14} className="text-slate-600" />
          <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">{hospital?.name}</span>
        </div>
      </div>
      <div className="p-5">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-slate-900 line-clamp-1">{item.name}</h3>
          <span className="text-blue-600 font-bold text-sm">{hospital?.distance}</span>
        </div>
        <p className="text-slate-500 text-sm mb-4 line-clamp-1">{item.description}</p>
        <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold mb-6">
          <div className="flex items-center gap-1">
            <Package size={14} />
            {item.quantity} {item.unit}
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />
            Exp: {new Date(item.expirationDate).toLocaleDateString()}
          </div>
        </div>
        <button 
          onClick={() => onSwap(item)}
          className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 group"
        >
          Request Swap
          <ArrowRightLeft size={16} className="group-hover:rotate-180 transition-transform duration-500" />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [inventory, setInventory] = useState<InventoryItem[]>(MOCK_INVENTORY.filter(i => i.hospitalId === MY_HOSPITAL_ID));
  const [marketplaceItems] = useState<InventoryItem[]>(MOCK_INVENTORY.filter(i => i.hospitalId !== MY_HOSPITAL_ID));
  const [aiAnalysis, setAiAnalysis] = useState<AnalysisResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InventoryItem>>({
    name: '',
    category: 'Medicine',
    quantity: 0,
    unit: 'Units',
    expirationDate: '',
    description: ''
  });

  const runAnalysis = async () => {
    setLoadingAi(true);
    const result = await analyzeInventoryEfficiency(inventory);
    setAiAnalysis(result);
    setLoadingAi(false);
  };

  useEffect(() => {
    runAnalysis();
  }, [inventory]);

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    const item: InventoryItem = {
      ...newItem as InventoryItem,
      id: `item-${Date.now()}`,
      hospitalId: MY_HOSPITAL_ID,
      condition: 'New',
      status: 'Available'
    };
    setInventory([item, ...inventory]);
    setShowAddModal(false);
    setNewItem({ name: '', category: 'Medicine', quantity: 0, unit: 'Units', expirationDate: '', description: '' });
  };

  const removeItem = (id: string) => {
    setInventory(inventory.filter(i => i.id !== id));
  };

  // Stats
  const totalItems = inventory.length;
  const expiringSoon = inventory.filter(i => new Date(i.expirationDate) < new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)).length;
  const chartData = CATEGORIES.map(cat => ({
    name: cat,
    value: inventory.filter(i => i.category === cat).length
  }));

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <div className="space-y-8 animate-in fade-in duration-500">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Inventory Items', value: totalItems, icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
                { label: 'Active Swaps', value: '12', icon: ArrowRightLeft, color: 'text-emerald-600', bg: 'bg-emerald-50' },
                { label: 'Expiring Soon', value: expiringSoon, icon: ShieldAlert, color: 'text-amber-600', bg: 'bg-amber-50' },
                { label: 'Total Value Saved', value: '$4.2k', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-50' },
              ].map((stat, i) => (
                <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 flex items-center gap-5">
                  <div className={`${stat.bg} ${stat.color} p-4 rounded-xl`}>
                    <stat.icon size={24} />
                  </div>
                  <div>
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-wider">{stat.label}</p>
                    <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Charts */}
              <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">Inventory Distribution</h2>
                    <p className="text-slate-500 text-sm">Overview by medical category</p>
                  </div>
                  <button className="text-blue-600 font-bold text-sm hover:underline">View Detailed Report</button>
                </div>
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        cursor={{fill: '#f8fafc'}}
                      />
                      <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'][index % 5]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights Sidebar */}
              <div className="bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden flex flex-col">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Brain size={120} />
                </div>
                <div className="flex items-center gap-2 mb-6 text-blue-400 font-bold uppercase tracking-widest text-xs">
                  <Brain size={16} />
                  Gemini Smart Insights
                </div>
                
                {loadingAi ? (
                  <div className="flex-1 flex flex-col items-center justify-center space-y-4">
                    <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-slate-400 text-center animate-pulse">Analyzing inventory patterns...</p>
                  </div>
                ) : aiAnalysis ? (
                  <div className="space-y-6 z-10">
                    <div>
                      <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                        aiAnalysis.riskLevel === 'High' ? 'bg-red-500 text-white' : 
                        aiAnalysis.riskLevel === 'Medium' ? 'bg-amber-500 text-white' : 'bg-emerald-500 text-white'
                      }`}>
                        Waste Risk: {aiAnalysis.riskLevel}
                      </span>
                      <h3 className="text-2xl font-bold mt-2">Potential Savings: {aiAnalysis.potentialSavings}</h3>
                    </div>
                    
                    <div className="space-y-4">
                      {aiAnalysis.recommendations.map((rec, i) => (
                        <div key={i} className="flex gap-3 bg-white/10 p-4 rounded-2xl border border-white/5">
                          <div className="bg-blue-500/20 text-blue-400 h-6 w-6 rounded-full flex items-center justify-center shrink-0 mt-1">
                            <ChevronRight size={14} />
                          </div>
                          <p className="text-sm text-slate-300 leading-relaxed">{rec}</p>
                        </div>
                      ))}
                    </div>
                    <button 
                      onClick={runAnalysis}
                      className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-900/40"
                    >
                      Refresh Analysis
                    </button>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center">
                    <p className="text-slate-400 mb-6">No analysis data available yet.</p>
                    <button 
                      onClick={runAnalysis}
                      className="bg-blue-600 px-6 py-3 rounded-xl font-bold"
                    >
                      Start Analysis
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'inventory':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center bg-white p-6 rounded-3xl border border-slate-200">
              <div>
                <h2 className="text-xl font-bold text-slate-900">Manage Stock</h2>
                <p className="text-slate-500 text-sm">Add or edit your hospital's surplus items.</p>
              </div>
              <button 
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-xl flex items-center gap-2 transition-all shadow-md shadow-blue-100"
              >
                <Plus size={20} />
                Add Item
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {inventory.map(item => (
                <InventoryCard key={item.id} item={item} onRemove={removeItem} />
              ))}
            </div>

            {inventory.length === 0 && (
              <div className="bg-white rounded-3xl border-2 border-dashed border-slate-200 p-20 text-center">
                <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Package size={32} className="text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">No items listed</h3>
                <p className="text-slate-500 max-w-sm mx-auto mb-8">Your inventory is empty. Start adding items that your hospital has in excess.</p>
                <button 
                  onClick={() => setShowAddModal(true)}
                  className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-slate-800 transition-all"
                >
                  Create First Listing
                </button>
              </div>
            )}
          </div>
        );

      case 'marketplace':
        return (
          <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
             <div className="bg-white p-6 rounded-3xl border border-slate-200 flex flex-wrap gap-4 items-center justify-between">
                <div className="flex gap-2">
                  {['All', ...CATEGORIES].map(cat => (
                    <button key={cat} className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-all">
                      {cat}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
                  Sort by: 
                  <select className="bg-transparent font-bold text-slate-900 border-none focus:ring-0">
                    <option>Proximity</option>
                    <option>Expiry Date</option>
                    <option>Quantity</option>
                  </select>
                </div>
             </div>

             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
               {marketplaceItems.map(item => (
                 <MarketplaceCard key={item.id} item={item} onSwap={(requestedItem) => alert(`Swap request for ${requestedItem.name} initiated! In a real app, this would open a negotiation modal.`)} />
               ))}
             </div>
          </div>
        );

      case 'swaps':
        return (
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 text-xs font-bold uppercase tracking-wider">
                  <th className="px-8 py-4">Requesting Hospital</th>
                  <th className="px-8 py-4">Swap Details</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { hospital: 'Green Valley Medical', offered: 'Disposable Scalpels', requested: 'Amoxicillin', status: 'Pending' },
                  { hospital: 'Riverfront Children\'s', offered: 'Antigen Test Kits', requested: 'N95 Masks', status: 'In Transit' }
                ].map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50 transition-all group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                          <HospitalIcon size={20} />
                        </div>
                        <span className="font-bold text-slate-900">{row.hospital}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-slate-600 font-medium">{row.offered}</span>
                        <ArrowRightLeft size={14} className="text-slate-400" />
                        <span className="text-blue-600 font-bold">{row.requested}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${
                        row.status === 'Pending' ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {row.status}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-md shadow-blue-100">Approve</button>
                        <button className="bg-white border border-slate-200 text-slate-600 px-4 py-2 rounded-lg text-xs font-bold">Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="p-20 text-center">
              <p className="text-slate-400 text-sm">End of recent requests</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="flex-1 flex flex-col">
        <Header title={
          activeTab === 'dashboard' ? 'Overview' : 
          activeTab === 'inventory' ? 'Inventory' : 
          activeTab === 'marketplace' ? 'Swap Marketplace' : 'Swaps'
        } />
        
        <div className="p-8 max-w-[1400px] w-full mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-8 border-b border-slate-100 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-900">Add Inventory</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-900 transition-colors">
                <Trash2 size={24} className="rotate-45" />
              </button>
            </div>
            <form onSubmit={handleAddItem} className="p-8 space-y-5">
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Item Name</label>
                <input 
                  required
                  type="text" 
                  value={newItem.name}
                  onChange={e => setNewItem({...newItem, name: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="e.g. Surgical Gowns (Box 50)"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Category</label>
                  <select 
                    value={newItem.category}
                    onChange={e => setNewItem({...newItem, category: e.target.value as Category})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  >
                    {CATEGORIES.map(cat => <option key={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Quantity</label>
                  <input 
                    required
                    type="number" 
                    value={newItem.quantity}
                    onChange={e => setNewItem({...newItem, quantity: parseInt(e.target.value)})}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Expiration Date</label>
                <input 
                  required
                  type="date" 
                  value={newItem.expirationDate}
                  onChange={e => setNewItem({...newItem, expirationDate: e.target.value})}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700">Description</label>
                <textarea 
                  value={newItem.description}
                  onChange={e => setNewItem({...newItem, description: e.target.value})}
                  rows={3}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Reason for surplus or item details..."
                />
              </div>
              <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-blue-100 mt-4">
                List Item for Swap
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
