'use client';

import React, { useState, useMemo } from 'react';
import { 
  BookOpen, 
  Terminal, 
  ArrowRight, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  Shield, 
  Zap, 
  RotateCw, 
  Users, 
  Image as ImageIcon, 
  FileText, 
  HelpCircle, 
  Settings,
  Flame,
  CheckCircle,
  Hash,
  Sparkles,
  Layers,
  Fingerprint
} from 'lucide-react';
import { DOCS_SECTIONS, DocSection } from '../lib/docs-data';
import { cn } from '../lib/utils';

interface DocsViewProps {
  onGoToSandbox: () => void;
}

export default function DocsView({ onGoToSandbox }: DocsViewProps) {
  const [activeSectionId, setActiveSectionId] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [copiedText, setCopiedText] = useState<string | null>(null);

  // Group sections by category for the sidebar
  const categories = useMemo(() => {
    const groups: { [key: string]: DocSection[] } = {};
    DOCS_SECTIONS.forEach((section) => {
      const cat = section.category;
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(section);
    });
    return groups;
  }, []);

  // Filter sections based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    
    const query = searchQuery.toLowerCase();
    const groups: { [key: string]: DocSection[] } = {};
    
    DOCS_SECTIONS.forEach((section) => {
      const matchTitle = section.title.toLowerCase().includes(query);
      const matchContent = section.content.toLowerCase().includes(query);
      const matchDesc = section.description.toLowerCase().includes(query);
      const matchSnippet = section.codeSnippet?.toLowerCase().includes(query) || false;
      
      if (matchTitle || matchContent || matchDesc || matchSnippet) {
        const cat = section.category;
        if (!groups[cat]) {
          groups[cat] = [];
        }
        groups[cat].push(section);
      }
    });
    
    return groups;
  }, [searchQuery, categories]);

  // Find currently active section object
  const activeSection = useMemo(() => {
    return DOCS_SECTIONS.find(s => s.id === activeSectionId) || DOCS_SECTIONS[0];
  }, [activeSectionId]);

  const handleCopyCode = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopiedText(id);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  // Helper to render icons for each section category
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Introduction':
        return <BookOpen className="w-4 h-4 text-indigo-500" />;
      case 'Installation':
        return <Terminal className="w-4 h-4 text-emerald-500" />;
      case 'Core Routing':
        return <Layers className="w-4 h-4 text-amber-500" />;
      case 'Response Actions':
        return <Sparkles className="w-4 h-4 text-pink-500" />;
      case 'Placeholders':
        return <Hash className="w-4 h-4 text-blue-500" />;
      case 'Security & Guards':
        return <Shield className="w-4 h-4 text-red-500" />;
      case 'Development Flow':
        return <RotateCw className="w-4 h-4 text-purple-500" />;
      default:
        return <FileText className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* LEFT SIDEBAR - Navigation & Filter */}
      <div className="lg:col-span-1 space-y-6">
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search docs (e.g., Ban, Route)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-slate-800"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-2 text-xs text-slate-400 hover:text-slate-600 font-medium"
            >
              Clear
            </button>
          )}
        </div>

        {/* Sidebar Nav Tree */}
        <nav className="space-y-6 max-h-[75vh] overflow-y-auto pr-2 custom-scrollbar">
          {Object.entries(filteredCategories).map(([category, sections]) => (
            <div key={category} className="space-y-1.5" id={`category-${category.toLowerCase().replace(/\s+/g, '-')}`}>
              <div className="flex items-center gap-2 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
                {getCategoryIcon(category)}
                <span>{category}</span>
              </div>
              
              <div className="space-y-0.5 border-l border-slate-100 ml-5 pl-1.5">
                {sections.map((section) => {
                  const isActive = section.id === activeSectionId;
                  return (
                    <button
                      key={section.id}
                      onClick={() => {
                        setActiveSectionId(section.id);
                        // Scroll to top of content area on mobile
                        const contentEl = document.getElementById('docs-content-area');
                        if (contentEl) {
                          contentEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }}
                      className={cn(
                        "w-full text-left px-3 py-1.5 text-sm rounded-md transition-all font-medium block",
                        isActive 
                          ? "bg-indigo-50 text-indigo-700 font-semibold" 
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                      )}
                      id={`sidebar-link-${section.id}`}
                    >
                      {section.title}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {Object.keys(filteredCategories).length === 0 && (
            <div className="text-center py-8 px-4 border border-dashed border-slate-200 rounded-lg">
              <HelpCircle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-medium">No documentation found for your search query.</p>
            </div>
          )}

          {/* Quick Sandbox Trigger Card */}
          <div className="bg-slate-900 text-white p-4 rounded-xl space-y-3 shadow-sm border border-slate-800" id="sidebar-playground-promo">
            <div className="flex items-center gap-2 text-indigo-400">
              <Flame className="w-4 h-4 fill-indigo-400 animate-pulse" />
              <span className="text-xs font-bold uppercase tracking-wider">Try it instantly</span>
            </div>
            <h4 className="text-xs font-semibold text-slate-100">Interactive WhatsApp Bot Simulator</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Test W2B routes, placeholders, and action guards live in a simulated iOS/Android WhatsApp chat client.
            </p>
            <button
              onClick={onGoToSandbox}
              className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs py-2 px-3 rounded-lg transition-colors group"
            >
              <span>Open Bot Playground</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </nav>
      </div>

      {/* CENTER & RIGHT COLUMNS - Content & TOC */}
      <div className="lg:col-span-3 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 shadow-sm flex flex-col min-h-[70vh]" id="docs-content-area">
        {/* Breadcrumb path */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium mb-3" id="docs-breadcrumbs">
          <span>Documentation</span>
          <span>/</span>
          <span>{activeSection.category}</span>
          <span>/</span>
          <span className="text-slate-700">{activeSection.title}</span>
        </div>

        {/* Header Title */}
        <div className="space-y-2 border-b border-slate-100 pb-5 mb-6" id="docs-header">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">{activeSection.title}</h1>
          <p className="text-sm md:text-base text-slate-500">{activeSection.description}</p>
        </div>

        {/* Section Content (Custom Rendered MDX elements) */}
        <div className="prose prose-slate max-w-none flex-grow space-y-6 text-sm md:text-base text-slate-700 leading-relaxed" id="docs-body">
          {activeSection.content.split('\n\n').map((paragraph, index) => {
            const trimmed = paragraph.trim();
            if (!trimmed) return null;

            // Render Markdown Headers
            if (trimmed.startsWith('### ')) {
              const text = trimmed.substring(4);
              const headerId = text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
              return (
                <h3 key={index} id={headerId} className="text-lg font-bold text-slate-900 tracking-tight mt-6 mb-3 flex items-center gap-2">
                  <span className="text-indigo-500">#</span>
                  {text}
                </h3>
              );
            }

            // Render Markdown Lists
            if (trimmed.startsWith('*   ') || trimmed.startsWith('-   ')) {
              const items = trimmed.split('\n').map((item) => {
                const cleanItem = item.replace(/^[\s*-]+\s*/, '');
                // Handle bold keywords in bullet points
                const boldMatch = cleanItem.match(/^\*\*(.*?)\*\*:(.*)$/);
                if (boldMatch) {
                  return (
                    <li key={item} className="mb-2">
                      <strong className="text-slate-900 font-semibold">{boldMatch[1]}:</strong>
                      <span>{boldMatch[2]}</span>
                    </li>
                  );
                }
                return <li key={item} className="mb-1">{cleanItem}</li>;
              });
              return <ul key={index} className="list-disc pl-5 my-3 text-slate-600 space-y-1">{items}</ul>;
            }

            // Render Ordered lists
            if (/^\d+\.\s+/.test(trimmed)) {
              const items = trimmed.split('\n').map((item) => {
                const cleanItem = item.replace(/^\d+\.\s+/, '');
                return <li key={item} className="mb-1">{cleanItem}</li>;
              });
              return <ol key={index} className="list-decimal pl-5 my-3 text-slate-600 space-y-1">{items}</ol>;
            }

            // Render Code block inside markdown
            if (trimmed.startsWith('```')) {
              const lines = trimmed.split('\n');
              const language = lines[0].replace('```', '') || 'javascript';
              const code = lines.slice(1, -1).join('\n');
              const blockId = `md-code-${index}`;
              return (
                <div key={index} className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 font-mono text-xs my-4 shadow-sm">
                  <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
                    <span className="text-[10px] font-bold uppercase tracking-wider">{language}</span>
                    <button
                      onClick={() => handleCopyCode(code, blockId)}
                      className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                    >
                      {copiedText === blockId ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                  <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">
                    <code>{code}</code>
                  </pre>
                </div>
              );
            }

            // Inline code highlighting replacement helper
            const inlineFormatter = (text: string) => {
              const parts = text.split(/(`[^`]+`)/g);
              return parts.map((part, pIdx) => {
                if (part.startsWith('`') && part.endsWith('`')) {
                  return (
                    <code key={pIdx} className="px-1.5 py-0.5 bg-slate-100 text-indigo-600 rounded font-mono text-xs font-semibold border border-slate-200/50">
                      {part.substring(1, part.length - 1)}
                    </code>
                  );
                }
                // Check for dynamic inline bold formatting
                const boldParts = part.split(/(\*\*[^*]+\*\*)/g);
                return boldParts.map((bPart, bIdx) => {
                  if (bPart.startsWith('**') && bPart.endsWith('**')) {
                    return <strong key={bIdx} className="font-bold text-slate-900">{bPart.substring(2, bPart.length - 2)}</strong>;
                  }
                  return bPart;
                });
              });
            };

            return (
              <p key={index} className="text-slate-600 leading-relaxed mb-4">
                {inlineFormatter(trimmed)}
              </p>
            );
          })}
        </div>

        {/* PARAMETERS SECTION (Only if page has parameter table) */}
        {activeSection.parameters && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4" id="docs-parameters-table">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-500" />
              <span>Actions Parameter Guide</span>
            </h3>
            <div className="overflow-x-auto border border-slate-100 rounded-xl">
              <table className="w-full text-left text-xs md:text-sm border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">
                    <th className="p-3">Action Signature</th>
                    <th className="p-3">Return Type</th>
                    <th className="p-3">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-slate-600">
                  {activeSection.parameters.map((param) => (
                    <tr key={param.name} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-3 font-mono text-indigo-600 font-semibold">{param.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 text-[10px] font-bold rounded-full uppercase">
                          {param.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-500 leading-relaxed">{param.description}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* DECORATORS SECTION (Only if page has decorators listed) */}
        {activeSection.decorators && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-4" id="docs-decorators-list">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Shield className="w-4 h-4 text-red-500" />
              <span>Guards Reference List</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activeSection.decorators.map((dec) => (
                <div key={dec.name} className="p-4 border border-slate-100 rounded-xl bg-slate-50/50 hover:border-slate-200 transition-colors space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-red-600 px-2 py-0.5 bg-red-50 rounded-md">
                      {dec.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wide">Decorator</span>
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{dec.description}</p>
                  <div className="bg-slate-950 p-2 rounded-lg font-mono text-[10px] text-slate-300 overflow-x-auto">
                    {dec.example}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CODE SNIPPET (If section provides a focused code example) */}
        {activeSection.codeSnippet && (
          <div className="mt-8 pt-6 border-t border-slate-100 space-y-3" id="docs-code-snippet">
            <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider text-[11px] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-500" />
              <span>Full Code Example</span>
            </h3>
            <div className="relative group rounded-xl overflow-hidden border border-slate-200 bg-slate-950 font-mono text-xs shadow-sm">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-slate-400">
                <span className="text-[10px] font-bold uppercase tracking-wider">Example Implementation</span>
                <button
                  onClick={() => handleCopyCode(activeSection.codeSnippet || '', 'section-snippet')}
                  className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 text-[11px] font-semibold"
                >
                  {copiedText === 'section-snippet' ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Code</span>
                    </>
                  )}
                </button>
              </div>
              <pre className="p-4 overflow-x-auto text-slate-300 leading-relaxed font-mono">
                <code>{activeSection.codeSnippet}</code>
              </pre>
            </div>
          </div>
        )}

        {/* FOOTER NAVIGATION */}
        <div className="mt-12 pt-6 border-t border-slate-100 flex items-center justify-between" id="docs-footer-nav">
          {/* Previous section */}
          {(() => {
            const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === activeSectionId);
            const prevSection = currentIndex > 0 ? DOCS_SECTIONS[currentIndex - 1] : null;
            return prevSection ? (
              <button
                onClick={() => setActiveSectionId(prevSection.id)}
                className="group text-left space-y-1 hover:text-indigo-600 transition-colors"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Previous</div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 flex items-center gap-1">
                  <span>←</span>
                  <span>{prevSection.title}</span>
                </div>
              </button>
            ) : <div />;}
          )()}

          {/* Next section */}
          {(() => {
            const currentIndex = DOCS_SECTIONS.findIndex(s => s.id === activeSectionId);
            const nextSection = currentIndex < DOCS_SECTIONS.length - 1 ? DOCS_SECTIONS[currentIndex + 1] : null;
            return nextSection ? (
              <button
                onClick={() => setActiveSectionId(nextSection.id)}
                className="group text-right space-y-1 hover:text-indigo-600 transition-colors"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Next</div>
                <div className="text-sm font-semibold text-slate-700 group-hover:text-indigo-600 flex items-center gap-1 justify-end">
                  <span>{nextSection.title}</span>
                  <span>→</span>
                </div>
              </button>
            ) : (
              <button
                onClick={onGoToSandbox}
                className="group text-right space-y-1 hover:text-indigo-600 transition-colors"
              >
                <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Next Step</div>
                <div className="text-sm font-semibold text-indigo-600 flex items-center gap-1 justify-end">
                  <span>Interactive Playground</span>
                  <span>🚀</span>
                </div>
              </button>
            );
          })()}
        </div>
      </div>
    </div>
  );
}
