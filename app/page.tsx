'use client';

import React, { useState } from 'react';
import { 
  Terminal, 
  BookOpen, 
  Play, 
  Copy, 
  Check, 
  ExternalLink, 
  Sparkles,
  GitBranch,
  ShieldCheck,
  Zap,
  Coffee,
  Heart
} from 'lucide-react';
import DocsView from '../components/DocsView';
import PlaygroundView from '../components/PlaygroundView';
import { cn } from '../lib/utils';

export default function Page() {
  const [activeTab, setActiveTab] = useState<'docs' | 'playground'>('docs');
  const [copiedInstall, setCopiedInstall] = useState<boolean>(false);

  const handleCopyInstall = () => {
    navigator.clipboard.writeText('npm install w2b @whiskeysockets/baileys');
    setCopiedInstall(true);
    setTimeout(() => {
      setCopiedInstall(false);
    }, 2000);
  };

  return (
    <main className="min-h-screen bg-slate-50 text-slate-800 antialiased selection:bg-indigo-100 selection:text-indigo-900 pb-16" id="app-root">
      
      {/* BRAND & HEADER SECTION */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 backdrop-blur-md bg-white/90" id="global-header">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center font-bold text-lg select-none shadow-md">
              W2
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-slate-900">W2B Docs</span>
                <span className="px-1.5 py-0.5 bg-indigo-50 text-indigo-700 text-[10px] font-bold rounded-full uppercase tracking-wider scale-90">
                  v1.2.4
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-semibold select-none hidden sm:block">
                Declarative WhatsApp Bot Framework
              </p>
            </div>
          </div>

          {/* Quick Stats Badges */}
          <div className="hidden md:flex items-center gap-2 select-none" id="header-badges">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200 flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
              <span>Baileys Base v5.x</span>
            </span>
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-lg border border-slate-200">
              License: MIT
            </span>
            <a 
              href="https://github.com/whiskeysockets/baileys" 
              target="_blank" 
              rel="noreferrer" 
              className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg border border-slate-800 flex items-center gap-1.5 transition-colors"
            >
              <GitBranch className="w-3 h-3" />
              <span>Baileys Core</span>
              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
            </a>
          </div>
        </div>
      </header>

      {/* HERO HERO SECTION */}
      <section className="bg-white border-b border-slate-200/60 py-12 px-4 sm:px-6 lg:px-8" id="hero-banner">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider animate-fade-in select-none">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Introducing declarative Whatsapp framework</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 leading-tight">
            Write WhatsApp Bots with <br />
            <span className="text-indigo-600">Pure Declarative Harmony</span>
          </h1>

          <p className="text-sm sm:text-base text-slate-500 leading-relaxed max-w-2xl mx-auto">
            W2B is a professional developer-centric wrapper over Baileys. Build bots using 
            intuitive <strong>Routes</strong>, fluent executable <strong>Actions</strong>, and context-aware 
            <strong> Placeholders</strong>. Complete with built-in hot reloading and chained permission guards.
          </p>

          {/* Copyable NPM installation tag */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2" id="npm-installer-section">
            <div className="flex items-center justify-between gap-4 pl-4 pr-2.5 py-1.5 bg-slate-900 border border-slate-800 text-white font-mono text-xs rounded-xl shadow-md max-w-md w-full select-all">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="text-slate-500 select-none">$</span>
                <span>npm i w2b @whiskeysockets/baileys</span>
              </div>
              <button
                onClick={handleCopyInstall}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-600 rounded-lg text-slate-300 hover:text-white transition-all"
                title="Copy installation command"
                id="copy-install-btn"
              >
                {copiedInstall ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
            
            <button
              onClick={() => setActiveTab('playground')}
              className="flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-bold text-xs py-3 px-6 rounded-xl transition-all shadow-md group"
              id="try-sandbox-hero-btn"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>Launch Live Playground</span>
            </button>
          </div>
        </div>
      </section>

      {/* CORE WORKSPACE - NAVIGATION TABS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-10" id="main-content">
        <div className="flex items-center justify-center gap-3 border-b border-slate-200 pb-4 mb-8 select-none" id="workspace-tabs">
          <button
            onClick={() => setActiveTab('docs')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all border",
              activeTab === 'docs'
                ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
            id="tab-btn-docs"
          >
            <BookOpen className={cn("w-4 h-4", activeTab === 'docs' ? "text-indigo-600" : "text-slate-400")} />
            <span>📚 Documentation Reference</span>
          </button>

          <button
            onClick={() => setActiveTab('playground')}
            className={cn(
              "flex items-center gap-2 px-5 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all border",
              activeTab === 'playground'
                ? "bg-white text-slate-900 border-slate-200 shadow-sm"
                : "border-transparent text-slate-400 hover:text-slate-600"
            )}
            id="tab-btn-playground"
          >
            <Terminal className={cn("w-4 h-4", activeTab === 'playground' ? "text-indigo-600" : "text-slate-400")} />
            <span>🧪 Interactive Sandbox Simulator</span>
          </button>
        </div>

        {/* Tab content rendering */}
        <div id="tab-view-container" className="animate-fade-in">
          {activeTab === 'docs' ? (
            <DocsView onGoToSandbox={() => setActiveTab('playground')} />
          ) : (
            <PlaygroundView />
          )}
        </div>
      </div>

      {/* FOOTER SECTION */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-20 border-t border-slate-200 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400 font-medium" id="global-footer">
        <div className="flex items-center gap-2 select-none">
          <span className="font-bold text-slate-800">W2B</span>
          <span>© 2026. Open-Source under MIT License.</span>
        </div>
        
        <div className="flex items-center gap-1.5 select-none text-slate-400">
          <span>Crafted with</span>
          <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500 animate-pulse" />
          <span>by esalintangpermadi@gmail.com</span>
        </div>

        <div className="flex items-center gap-4">
          <a href="https://github.com/whiskeysockets/baileys" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
            Baileys Library
          </a>
          <span>•</span>
          <a href="https://npmjs.com" target="_blank" rel="noreferrer" className="hover:text-slate-600 transition-colors">
            NPM Package Registry
          </a>
        </div>
      </footer>
    </main>
  );
}
