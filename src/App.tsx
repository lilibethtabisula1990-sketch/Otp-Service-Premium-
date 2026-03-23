/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Terminal, 
  Smartphone,
  Hash,
  Zap,
  Loader2
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

export default function App() {
  const [number, setNumber] = useState('');
  const [totalRequests, setTotalRequests] = useState(10);
  const [isTesting, setIsTesting] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [availableServices, setAvailableServices] = useState<string[]>([]);
  const stopRef = useRef(false);

  useEffect(() => {
    fetch('/api/services')
      .then(res => res.json())
      .then(data => setAvailableServices(data))
      .catch(err => console.error('Failed to fetch services:', err));
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
      
      // Small delay to prevent rate limiting
      await new Promise(r => setTimeout(r, 800));
    }

    setIsTesting(false);
  };

  const handleStop = () => {
    stopRef.current = true;
    setIsTesting(false);
  };

  const successRate = progress ? (progress.successful / progress.completed || 0) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#E4E3E0] text-[#141414] font-sans selection:bg-[#141414] selection:text-[#E4E3E0]">
      {/* Header */}
      <header className="border-b border-[#141414] p-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Activity className="w-8 h-8" />
          <div>
            <h1 className="text-2xl font-bold tracking-tighter uppercase italic font-serif">SMS Service Stress Tester</h1>
            <p className="text-[11px] opacity-50 uppercase tracking-widest font-mono">Netlify Serverless Edition v2.1</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-[10px] uppercase font-mono opacity-50">Deployment</span>
            <span className="flex items-center gap-2 text-xs font-bold">
              <span className="w-2 h-2 bg-blue-500 rounded-full" />
              NETLIFY READY
            </span>
          </div>
        </div>
      </header>

      <main className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Control Panel */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white border border-[#141414] p-6 rounded-none shadow-[4px_4px_0px_0px_#141414]">
            <h2 className="font-serif italic text-lg mb-4 flex items-center gap-2">
              <ShieldAlert className="w-5 h-5" />
              Configuration
            </h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] uppercase font-mono opacity-50 mb-1">Target Number</label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input 
                    type="text" 
                    placeholder="09123456789"
                    value={number}
                    onChange={(e) => setNumber(e.target.value)}
                    disabled={isTesting}
                    className="w-full bg-[#F5F5F5] border border-[#141414] py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#141414]/10 disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase font-mono opacity-50 mb-1">Request Volume</label>
                <div className="relative">
                  <Hash className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-30" />
                  <input 
                    type="number" 
                    value={totalRequests}
                    onChange={(e) => setTotalRequests(parseInt(e.target.value))}
                    disabled={isTesting}
                    className="w-full bg-[#F5F5F5] border border-[#141414] py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-[#141414]/10 disabled:opacity-50 font-mono"
                  />
                </div>
              </div>

              {isTesting ? (
                <button 
                  onClick={handleStop}
                  className="w-full py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest bg-red-600 text-white border border-[#141414] shadow-[4px_4px_0px_0px_#141414]"
                >
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Stop Attack
                </button>
              ) : (
                <button 
                  onClick={handleStart}
                  disabled={!number}
                  className="w-full py-4 flex items-center justify-center gap-2 font-bold uppercase tracking-widest bg-[#141414] text-[#E4E3E0] hover:bg-white hover:text-[#141414] border border-[#141414] active:translate-y-1 active:shadow-none shadow-[4px_4px_0px_0px_#141414] disabled:opacity-50"
                >
                  <Play className="w-5 h-5" />
                  Initiate Test
                </button>
              )}
            </div>
          </section>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
              <span className="text-[10px] uppercase font-mono opacity-50 block mb-1">Success Rate</span>
              <div className="text-2xl font-bold font-mono">{successRate.toFixed(1)}%</div>
            </div>
            <div className="bg-white border border-[#141414] p-4 shadow-[4px_4px_0px_0px_#141414]">
              <span className="text-[10px] uppercase font-mono opacity-50 block mb-1">Total Sent</span>
              <div className="text-2xl font-bold font-mono">{progress?.completed || 0}</div>
            </div>
          </div>
        </div>

        {/* Real-time Log */}
        <div className="lg:col-span-8 flex flex-col h-[calc(100vh-180px)]">
          <div className="bg-[#141414] text-[#E4E3E0] p-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4" />
              <span className="text-xs font-mono uppercase tracking-widest">Serverless Telemetry Stream</span>
            </div>
            <div className="text-[10px] font-mono opacity-50">
              {progress ? `${progress.completed}/${progress.total} REQS` : 'IDLE'}
            </div>
          </div>
          
          <div className="flex-1 bg-white border-x border-b border-[#141414] overflow-y-auto font-mono text-xs">
            <div className="divide-y divide-[#141414]/10">
              <AnimatePresence initial={false}>
                {logs.length === 0 && (
                  <div className="p-12 text-center opacity-30 italic">
                    Waiting for initialization...
                  </div>
                )}
                {logs.map((log) => (
                  <motion.div 
                    key={log.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="grid grid-cols-12 p-3 hover:bg-[#141414] hover:text-[#E4E3E0] transition-colors group"
                  >
                    <div className="col-span-2 opacity-50">{log.timestamp}</div>
                    <div className="col-span-3 font-bold italic">{log.service}</div>
                    <div className="col-span-2">
                      {log.status === 'SUCCESS' ? (
                        <span className="text-green-600 group-hover:text-green-400 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          OK
                        </span>
                      ) : (
                        <span className="text-red-600 group-hover:text-red-400 font-bold flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          ERR
                        </span>
                      )}
                    </div>
                    <div className="col-span-5 truncate opacity-70">
                      {log.status === 'SUCCESS' ? `HTTP ${log.code}` : log.error}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Progress Bar */}
          {isTesting && progress && (
            <div className="mt-4 bg-white border border-[#141414] p-1 h-4 relative overflow-hidden">
              <motion.div 
                className="absolute inset-y-0 left-0 bg-[#141414]"
                initial={{ width: 0 }}
                animate={{ width: `${(progress.completed / progress.total) * 100}%` }}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer Meta */}
      <footer className="fixed bottom-0 left-0 right-0 bg-[#E4E3E0] border-t border-[#141414] px-6 py-2 flex justify-between items-center text-[10px] font-mono uppercase opacity-50">
        <div>Session ID: {Math.random().toString(36).substring(7).toUpperCase()}</div>
        <div className="flex gap-4">
          <span>Platform: Netlify</span>
          <span>Arch: Serverless</span>
          <span>Region: Global Edge</span>
        </div>
      </footer>
    </div>
  );
}
