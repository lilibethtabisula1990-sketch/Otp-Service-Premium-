import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Terminal, 
  Smartphone,
  Hash,
  Zap,
  Loader2,
  Settings,
  Bomb,
  Menu,
  X,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  Lock,
  MessageCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LogEntry {
  id: string;
  service: string;
  status: 'SUCCESS' | 'FAILED';
  code?: number;
  error?: string;
  timestamp: string;
}

interface ProgressData {
  completed: number;
  successful: number;
  failed: number;
  total: number;
}

type View = 'bomber' | 'garena' | 'settings';

export default function App() {
  const [number, setNumber] = useState('');
  const [totalRequests, setTotalRequests] = useState(10);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState<View>('bomber');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const stopRef = useRef(false);

  // Garena State
  const [garenaAccount, setGarenaAccount] = useState('');
  const [garenaPassword, setGarenaPassword] = useState('');
  const [isCheckingGarena, setIsCheckingGarena] = useState(false);
  const [garenaResult, setGarenaResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate app initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    fetch('/api/services')
      .then(res => res.json())
      .then(data => setAvailableServices(data))
      .catch(err => console.error('Failed to fetch services:', err));

    return () => clearTimeout(timer);
  }, []);

  const handleStart = async () => {
    if (!number || isTesting || availableServices.length === 0) return;
    
    setLogs([]);
    setProgress({ completed: 0, successful: 0, failed: 0, total: totalRequests });
    setIsTesting(true);
    stopRef.current = false;

    let completed = 0;
    let successful = 0;
    let failed = 0;

    for (let i = 0; i < totalRequests; i++) {
      if (stopRef.current) break;

      const serviceIndex = Math.floor(Math.random() * availableServices.length);
      
      try {
        const response = await fetch('/api/api', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ number, serviceIndex }),
        });
        
        const result = await response.json();
        
        if (result.status === 'SUCCESS') {
          successful++;
          setLogs(prev => [{
            id: Math.random().toString(36),
            service: result.name,
            status: 'SUCCESS',
            code: result.code,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 100));
        } else {
          failed++;
          setLogs(prev => [{
            id: Math.random().toString(36),
            service: 'Service Integration',
            status: 'FAILED',
            error: result.error,
            timestamp: new Date().toLocaleTimeString()
          }, ...prev].slice(0, 100));
        }
      } catch (err: any) {
        failed++;
        setLogs(prev => [{
          id: Math.random().toString(36),
          service: 'Network',
          status: 'FAILED',
          error: err.message,
          timestamp: new Date().toLocaleTimeString()
        }, ...prev].slice(0, 100));
      }

      completed++;
      setProgress({ completed, successful, failed, total: totalRequests });
      
      await new Promise(r => setTimeout(r, 800));
    }

    setIsTesting(false);
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsTesting(false);
  };

  const handleGarenaCheck = async () => {
    if (!garenaAccount || !garenaPassword || isCheckingGarena) return;
    
    setIsCheckingGarena(true);
    setGarenaResult(null);

    try {
      const response = await fetch('/api/garena/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ account: garenaAccount, password: garenaPassword }),
      });
      
      const result = await response.json();
      setGarenaResult(result);
    } catch (err: any) {
      setGarenaResult({ status: 'FAILED', error: err.message });
    } finally {
      setIsCheckingGarena(false);
    }
  };

  const successRate = progress ? (progress.successful / progress.completed || 0) * 100 : 0;

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-[#2D3436] font-sans overflow-hidden">
      <AnimatePresence>
        {isLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-[100] bg-[#141414] flex flex-col items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col items-center"
            >
              <div className="bg-white p-4 rounded-2xl mb-6 shadow-2xl shadow-white/10">
                <Zap className="w-12 h-12 text-[#141414]" />
              </div>
              <h1 className="text-white text-3xl font-bold tracking-tighter mb-2">OmniToolbox</h1>
              <div className="flex items-center gap-2 text-[#6C757D] text-sm font-medium">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Initializing secure environment...</span>
              </div>
            </motion.div>
            
            <div className="absolute bottom-12 left-0 right-0 flex flex-col items-center gap-2">
              <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 2, ease: "easeInOut" }}
                  className="h-full bg-white"
                />
              </div>
              <p className="text-[10px] font-bold text-white/30 uppercase tracking-[0.2em]">v2.4.0 Stable Build</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 0, opacity: isSidebarOpen ? 1 : 0 }}
        className="bg-white border-r border-[#E9ECEF] flex flex-col relative z-20"
      >
        <div className="p-6 border-b border-[#E9ECEF] flex items-center gap-3">
          <div className="bg-[#141414] p-2 rounded-lg">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold tracking-tight text-lg">OmniToolbox</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <div className="px-3 py-2 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">
            Main Feature
          </div>
          <button 
            onClick={() => setCurrentView('bomber')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'bomber' 
                ? 'bg-[#141414] text-white shadow-lg shadow-[#141414]/10' 
                : 'text-[#6C757D] hover:bg-[#F1F3F5] hover:text-[#141414]'
            }`}
          >
            <Bomb className="w-5 h-5" />
            <span className="font-medium">SMS Bomber</span>
            {currentView === 'bomber' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>

          <button 
            onClick={() => setCurrentView('garena')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'garena' 
                ? 'bg-[#141414] text-white shadow-lg shadow-[#141414]/10' 
                : 'text-[#6C757D] hover:bg-[#F1F3F5] hover:text-[#141414]'
            }`}
          >
            <UserCheck className="w-5 h-5" />
            <span className="font-medium">Garena Checker</span>
            {currentView === 'garena' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>

          <div className="px-3 py-2 mt-6 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest">
            System
          </div>
          <button 
            onClick={() => setCurrentView('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              currentView === 'settings' 
                ? 'bg-[#141414] text-white shadow-lg shadow-[#141414]/10' 
                : 'text-[#6C757D] hover:bg-[#F1F3F5] hover:text-[#141414]'
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
            {currentView === 'settings' && <ChevronRight className="w-4 h-4 ml-auto opacity-50" />}
          </button>

          <a 
            href="https://t.me/ItsMeJeff"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-[#6C757D] hover:bg-[#F1F3F5] hover:text-[#141414]"
          >
            <MessageCircle className="w-5 h-5" />
            <span className="font-medium">Contact Support</span>
            <ChevronRight className="w-4 h-4 ml-auto opacity-50" />
          </a>
        </nav>

        <div className="p-4 border-t border-[#E9ECEF]">
          <div className="bg-[#F8F9FA] p-4 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#DEE2E6] flex items-center justify-center font-bold text-xs">
              JL
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold truncate">joshleetabisula79</p>
              <p className="text-[10px] text-[#ADB5BD] truncate">Administrator</p>
            </div>
          </div>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 relative">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#E9ECEF] flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-[#F1F3F5] rounded-lg transition-colors"
            >
              {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <h2 className="font-bold text-lg capitalize">
              {currentView === 'bomber' ? 'SMS Bomber' : currentView === 'garena' ? 'Garena Checker' : 'Settings'}
            </h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3 h-3" />
              Anti-DDoS Active
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 text-green-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              System Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {currentView === 'bomber' ? (
              <motion.div 
                key="bomber"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                {/* ... existing bomber content ... */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Configuration Card */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 shadow-sm">
                      <h3 className="text-sm font-bold uppercase tracking-widest text-[#ADB5BD] mb-6">Configuration</h3>
                      
                      <div className="space-y-6">
                        <div>
                          <label className="block text-xs font-bold mb-2 text-[#495057]">Target Phone Number</label>
                          <div className="relative group">
                            <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ADB5BD] group-focus-within:text-[#141414] transition-colors" />
                            <input 
                              type="text" 
                              placeholder="09123456789"
                              value={number}
                              onChange={(e) => setNumber(e.target.value)}
                              disabled={isTesting}
                              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#141414] focus:bg-white transition-all font-mono text-lg"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-xs font-bold mb-2 text-[#495057]">Request Volume</label>
                          <div className="relative group">
                            <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#ADB5BD] group-focus-within:text-[#141414] transition-colors" />
                            <input 
                              type="number" 
                              value={totalRequests}
                              onChange={(e) => setTotalRequests(parseInt(e.target.value))}
                              disabled={isTesting}
                              className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:border-[#141414] focus:bg-white transition-all font-mono text-lg"
                            />
                          </div>
                        </div>

                        {isTesting ? (
                          <button 
                            onClick={handleStop}
                            className="w-full py-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-bold transition-all shadow-lg shadow-red-500/20 flex items-center justify-center gap-3"
                          >
                            <Loader2 className="w-5 h-5 animate-spin" />
                            Stop Operation
                          </button>
                        ) : (
                          <button 
                            onClick={handleStart}
                            disabled={!number}
                            className="w-full py-4 bg-[#141414] hover:bg-[#2D3436] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#141414]/20 flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Play className="w-5 h-5" />
                            Initiate Stress Test
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-sm">
                        <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Success Rate</p>
                        <p className="text-2xl font-bold font-mono">{successRate.toFixed(1)}%</p>
                      </div>
                      <div className="bg-white rounded-2xl border border-[#E9ECEF] p-6 shadow-sm">
                        <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-1">Processed</p>
                        <p className="text-2xl font-bold font-mono">{progress?.completed || 0}</p>
                      </div>
                    </div>
                  </div>

                  {/* Logs Card */}
                  <div className="lg:col-span-7 flex flex-col min-h-[500px]">
                    <div className="bg-white rounded-2xl border border-[#E9ECEF] shadow-sm flex flex-col h-full overflow-hidden">
                      <div className="p-6 border-b border-[#E9ECEF] flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Terminal className="w-4 h-4 text-[#ADB5BD]" />
                          <h3 className="text-xs font-bold uppercase tracking-widest">Live Telemetry</h3>
                        </div>
                        {isTesting && (
                          <div className="flex items-center gap-2 text-[10px] font-bold text-[#141414]">
                            <span className="w-1.5 h-1.5 bg-[#141414] rounded-full animate-ping" />
                            STREAMING
                          </div>
                        )}
                      </div>
                      
                      <div className="flex-1 overflow-y-auto font-mono text-[11px] p-2">
                        <div className="space-y-1">
                          {logs.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center py-20 opacity-20">
                              <Terminal className="w-12 h-12 mb-4" />
                              <p className="font-bold">Awaiting sequence initiation...</p>
                            </div>
                          )}
                          <AnimatePresence initial={false}>
                            {logs.map((log) => (
                              <motion.div 
                                key={log.id}
                                initial={{ opacity: 0, x: -4 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="flex items-center gap-4 px-4 py-2 hover:bg-[#F8F9FA] rounded-lg group transition-colors"
                              >
                                <span className="text-[#ADB5BD] shrink-0">{log.timestamp}</span>
                                <span className="font-bold w-24 truncate">{log.service}</span>
                                <span className={`font-bold shrink-0 ${log.status === 'SUCCESS' ? 'text-green-500' : 'text-red-500'}`}>
                                  {log.status === 'SUCCESS' ? 'OK' : 'ERR'}
                                </span>
                                <span className="text-[#6C757D] truncate">
                                  {log.status === 'SUCCESS' ? `HTTP ${log.code}` : log.error}
                                </span>
                              </motion.div>
                            ))}
                          </AnimatePresence>
                        </div>
                      </div>

                      {/* Progress bar at bottom of logs */}
                      {isTesting && progress && (
                        <div className="h-1 bg-[#F1F3F5] w-full">
                          <motion.div 
                            className="h-full bg-[#141414]"
                            initial={{ width: 0 }}
                            animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            ) : currentView === 'garena' ? (
              <motion.div 
                key="garena"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto space-y-8"
              >
                <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 shadow-sm">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="bg-[#141414] p-3 rounded-xl">
                      <UserCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold">Garena Account Checker</h3>
                      <p className="text-sm text-[#6C757D]">Verify Garena accounts and check security status.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-xs font-bold mb-2 text-[#495057]">Account (Email/Username/Phone)</label>
                      <input 
                        type="text" 
                        value={garenaAccount}
                        onChange={(e) => setGarenaAccount(e.target.value)}
                        placeholder="example@gmail.com"
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl py-4 px-4 focus:outline-none focus:border-[#141414] focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-2 text-[#495057]">Password</label>
                      <input 
                        type="password" 
                        value={garenaPassword}
                        onChange={(e) => setGarenaPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full bg-[#F8F9FA] border border-[#E9ECEF] rounded-xl py-4 px-4 focus:outline-none focus:border-[#141414] focus:bg-white transition-all font-mono"
                      />
                    </div>

                    <button 
                      onClick={handleGarenaCheck}
                      disabled={!garenaAccount || !garenaPassword || isCheckingGarena}
                      className="w-full py-4 bg-[#141414] hover:bg-[#2D3436] text-white rounded-xl font-bold transition-all shadow-lg shadow-[#141414]/20 flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isCheckingGarena ? <Loader2 className="w-5 h-5 animate-spin" /> : <Play className="w-5 h-5" />}
                      Check Account
                    </button>
                  </div>

                  {garenaResult && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className={`mt-8 p-6 rounded-2xl border ${
                        garenaResult.status === 'SUCCESS' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'
                      }`}
                    >
                      {garenaResult.status === 'SUCCESS' ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-3 text-green-700">
                            <CheckCircle2 className="w-5 h-5" />
                            <span className="font-bold">Account Verified Successfully</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="bg-white/50 p-3 rounded-lg">
                              <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">Nickname</p>
                              <p className="font-bold">{garenaResult.data.nickname}</p>
                            </div>
                            <div className="bg-white/50 p-3 rounded-lg">
                              <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">UID</p>
                              <p className="font-bold">{garenaResult.data.uid}</p>
                            </div>
                            <div className="bg-white/50 p-3 rounded-lg">
                              <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">Email Status</p>
                              <p className="font-bold">{garenaResult.data.email_status === 1 ? 'Verified' : 'Unverified'}</p>
                            </div>
                            <div className="bg-white/50 p-3 rounded-lg">
                              <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">Mobile Status</p>
                              <p className="font-bold">{garenaResult.data.mobile_status === 1 ? 'Verified' : 'Unverified'}</p>
                            </div>
                          </div>

                          {garenaResult.data.codm && (
                            <div className="mt-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                              <div className="flex items-center gap-2 mb-3 text-blue-600">
                                <Zap className="w-4 h-4" />
                                <span className="text-xs font-bold uppercase tracking-wider">CODM Profile Detected</span>
                              </div>
                              <div className="grid grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">Nickname</p>
                                  <p className="font-bold">{garenaResult.data.codm.nickname}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">Level</p>
                                  <p className="font-bold">{garenaResult.data.codm.level}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] font-bold text-[#ADB5BD] uppercase">EXP</p>
                                  <p className="font-bold">{garenaResult.data.codm.exp}</p>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 text-red-700">
                          <XCircle className="w-5 h-5" />
                          <span className="font-bold">Check Failed: {garenaResult.error}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto"
              >
                <div className="bg-white rounded-2xl border border-[#E9ECEF] p-8 shadow-sm space-y-8">
                  <div>
                    <h3 className="text-lg font-bold mb-1">System Settings</h3>
                    <p className="text-sm text-[#6C757D]">Configure the stress testing engine parameters.</p>
                  </div>

                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                      <div className="flex items-center gap-3">
                        <div className="bg-blue-500/10 p-2 rounded-lg">
                          <ShieldCheck className="w-5 h-5 text-blue-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Anti-DDoS Protection</p>
                          <p className="text-xs text-[#ADB5BD]">Rate limiting and traffic analysis active.</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-blue-500 text-white rounded-full text-[10px] font-bold">
                        ACTIVE
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl border border-[#E9ECEF]">
                      <div className="flex items-center gap-3">
                        <div className="bg-green-500/10 p-2 rounded-lg">
                          <Lock className="w-5 h-5 text-green-500" />
                        </div>
                        <div>
                          <p className="font-bold text-sm">Secure Headers (Helmet)</p>
                          <p className="text-xs text-[#ADB5BD]">XSS and Clickjacking protection enabled.</p>
                        </div>
                      </div>
                      <div className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-bold">
                        ENABLED
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
                      <div>
                        <p className="font-bold text-sm">Rate Limiting Protection</p>
                        <p className="text-xs text-[#ADB5BD]">Automatically delay requests to avoid detection.</p>
                      </div>
                      <div className="w-12 h-6 bg-[#141414] rounded-full relative p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-[#F8F9FA] rounded-xl">
                      <div>
                        <p className="font-bold text-sm">Service Randomization</p>
                        <p className="text-xs text-[#ADB5BD]">Rotate through available API providers.</p>
                      </div>
                      <div className="w-12 h-6 bg-[#141414] rounded-full relative p-1 cursor-pointer">
                        <div className="w-4 h-4 bg-white rounded-full absolute right-1" />
                      </div>
                    </div>

                    <div className="pt-6 border-t border-[#E9ECEF]">
                      <p className="text-[10px] font-bold text-[#ADB5BD] uppercase tracking-widest mb-4">Available Services ({availableServices.length})</p>
                      <div className="flex flex-wrap gap-2">
                        {availableServices.map((s, i) => (
                          <span key={i} className="px-3 py-1.5 bg-[#F1F3F5] text-[#495057] rounded-lg text-[11px] font-medium border border-[#E9ECEF]">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <footer className="h-10 bg-white border-t border-[#E9ECEF] flex items-center justify-between px-6 shrink-0 text-[10px] font-bold text-[#ADB5BD] uppercase tracking-wider">
          <div className="flex gap-6">
            <span>Build: 2026.03.23</span>
            <span>Environment: Production</span>
            <span className="text-[#141414]">Support: @ItsMeJeff</span>
          </div>
          <div className="flex gap-6">
            <span>Render Cloud</span>
            <span>API v2.4.0</span>
          </div>
        </footer>
      </main>
    </div>
  );
}
