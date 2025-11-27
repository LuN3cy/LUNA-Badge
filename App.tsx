import React, { useState, useEffect, useRef } from 'react';
import { Badge, BadgePreview } from './components/Badge';
import { BadgeData, BadgeTheme, Language, INITIAL_BADGE_DATA } from './types';
import { generatePersona } from './services/geminiService';
import { Sparkles, RefreshCw, Box, Palette, Languages, Settings2, Image, PanelLeftClose, PanelLeftOpen, Copy, Check, MessageCircle, X } from 'lucide-react';
import { Lanyard } from './components/Lanyard';
import { toPng } from 'html-to-image';
import download from 'downloadjs';

const UI_TRANSLATIONS = {
  title: { en: 'LUNA-BADGE', zh: 'LUNA-BADGE' },
  subtitle: { en: 'Generate your designer badge in one click', zh: '一键生成你的设计感名牌' },
  badgeStyle: { en: 'Badge Style', zh: '工牌风格' },
  labels: {
    name: { en: 'Operative Name', zh: '姓名' },
    role: { en: 'Clearance Role', zh: '职位 / 等级' },
    id: { en: 'Ref ID', zh: '工号 ID' },
    company: { en: 'Company / Faction', zh: '公司 / 组织' },
    contact: { en: 'Contact Details', zh: '联系方式' },
    address: { en: 'Address', zh: '地址' },
  },
  placeholders: {
    name: { en: 'ENTER NAME', zh: '输入姓名' },
    role: { en: 'ROLE TITLE', zh: '输入职位' },
    contact: { en: 'PHONE / EMAIL / HANDLE', zh: '电话 / 邮箱' },
    address: { en: 'LOCATION DATA', zh: '输入地址' },
  },
  buttons: {
    generate: { en: 'Generate Identity', zh: '生成身份' },
    generating: { en: 'Fabricating Identity...', zh: '正在伪造身份...' },
    reroll: { en: 'Reroll Physics', zh: '重置物理动画' },
    exportPng: { en: 'Export PNG Card', zh: '导出 PNG 卡片' },
    copyClipboard: { en: 'Copy to Clipboard', zh: '复制到剪切板' },
    copied: { en: 'Copied!', zh: '已复制!' },
    contactAuthor: { en: 'Contact Author', zh: '联系作者' },
  },
  styleCustomization: { en: 'Style Customization', zh: '样式自定义' },
  themes: {
    industrial: { en: 'Industrial', zh: '工业风' },
    modern: { en: 'Modern', zh: '现代' },
    swiss: { en: 'Swiss', zh: '瑞士风格' },
    creative: { en: 'Creative', zh: '创意' },
    'formal-red': { en: 'Formal Red', zh: '商务红' },
    minimalism: { en: 'Minimalism', zh: '极简' },
  },
};

// Configuration for editable text fields per theme
const THEME_CUSTOM_FIELDS: Record<BadgeTheme, { key: string; label: { en: string; zh: string } }[]> = {
  modern: [
    { key: 'modern_top_left', label: { en: 'Header Left', zh: '左上标题' } },
    { key: 'modern_top_right', label: { en: 'Header Right', zh: '右上标题' } },
  ],
  swiss: [
    { key: 'swiss_main', label: { en: 'Main Heading', zh: '主标题' } },
    { key: 'swiss_sub', label: { en: 'Sub Heading', zh: '副标题' } },
    { key: 'swiss_affiliation', label: { en: 'Footer Label', zh: '底部标签' } },
  ],
  industrial: [
    { key: 'industrial_identifier', label: { en: 'Identifier Label', zh: '标识标签' } },
  ],
  creative: [
    { key: 'creative_verified', label: { en: 'Status Label', zh: '状态标签' } },
  ],
  'formal-red': [
    { key: 'formal_anniversary', label: { en: 'Event Label', zh: '活动标签' } },
  ],
  minimalism: [
    { key: 'minimal_corporate', label: { en: 'Top Label', zh: '顶部标签' } },
  ],
};

const App = () => {
  const [data, setData] = useState<BadgeData>(INITIAL_BADGE_DATA);
  const [theme, setTheme] = useState<BadgeTheme>('industrial');
  const [language, setLanguage] = useState<Language>('zh');
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copying' | 'success'>('idle');
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isContactOpen, setIsContactOpen] = useState(false);
  
  const animationTimeoutRef = useRef<number | null>(null);
  const exportPosterRef = useRef<HTMLDivElement>(null); // For PNG export (Full Poster)
  const badgeWrapperRef = useRef<HTMLDivElement>(null);

  const t = UI_TRANSLATIONS;

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!badgeWrapperRef.current) return;
    
    const rect = badgeWrapperRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // Calculate rotation based on cursor position (max 10 degrees)
    const rotateX = ((y - centerY) / centerY) * -10;
    const rotateY = ((x - centerX) / centerX) * 10;
    
    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  const triggerAnimation = () => {
    if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    
    setIsAnimating(false);
    const timeoutId = window.setTimeout(() => {
      setIsAnimating(true);
    }, 50);
    animationTimeoutRef.current = timeoutId;
  };

  useEffect(() => {
    triggerAnimation();
    return () => {
      if (animationTimeoutRef.current) clearTimeout(animationTimeoutRef.current);
    };
  }, []);

  const generateQRString = (badge: Omit<BadgeData, 'qrValue' | 'customFields'>) => {
    return JSON.stringify({
      NAME: badge.name,
      ROLE: badge.role,
      ID: badge.id,
      COMPANY: badge.company,
      CONTACT: badge.contact,
      ADDRESS: badge.address
    }, null, 2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setData(prev => {
      const updatedData = { ...prev, [name]: value };
      return {
        ...updatedData,
        qrValue: generateQRString(updatedData)
      };
    });
  };

  const handleCustomFieldChange = (key: string, value: string) => {
    setData(prev => ({
      ...prev,
      customFields: {
        ...prev.customFields,
        [key]: value
      }
    }));
  };

  const handleMagicFill = async () => {
    setIsGenerating(true);
    const newData = await generatePersona(language);
    if (newData) {
      // Preserve existing custom fields when generating new persona
      setData(prev => ({
        ...newData,
        customFields: prev.customFields
      }));
      triggerAnimation();
    }
    setIsGenerating(false);
  };

  const toggleLanguage = () => {
    setLanguage(prev => prev === 'en' ? 'zh' : 'en');
  };

  const handleExportPng = async () => {
    if (exportPosterRef.current) {
        try {
            const dataUrl = await toPng(exportPosterRef.current, { pixelRatio: Math.min(2, window.devicePixelRatio || 1) });
            download(dataUrl, `luna-badge-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`);
        } catch (err) {
            console.error('PNG export failed', err);
        }
    }
  };

  const handleCopyToClipboard = async () => {
    if (exportPosterRef.current) {
        setCopyStatus('copying');
        try {
            const dataUrl = await toPng(exportPosterRef.current, { pixelRatio: Math.min(2, window.devicePixelRatio || 1) });
            const response = await fetch(dataUrl);
            const blob = await response.blob();
            await navigator.clipboard.write([
                new ClipboardItem({
                    [blob.type]: blob
                })
            ]);
            setCopyStatus('success');
            setTimeout(() => setCopyStatus('idle'), 2000);
        } catch (err) {
            console.error('Copy to clipboard failed', err);
            setCopyStatus('idle');
        }
    }
  };

  const themes: { id: BadgeTheme; label: string }[] = [
    { id: 'industrial', label: t.themes.industrial[language] },
    { id: 'modern', label: t.themes.modern[language] },
    { id: 'swiss', label: t.themes.swiss[language] },
    { id: 'creative', label: t.themes.creative[language] },
    { id: 'formal-red', label: t.themes['formal-red'][language] },
    { id: 'minimalism', label: t.themes.minimalism[language] },
  ];

  const currentThemeFields = THEME_CUSTOM_FIELDS[theme] || [];

  return (
    <div className="relative w-full h-screen bg-[#050505] text-slate-200 font-sans selection:bg-purple-500/30 overflow-hidden">
      
      {/* --- Background Elements --- */}
      <div className="absolute inset-0 pointer-events-none">
         {/* Grid */}
         <div className="absolute inset-0 opacity-[0.03]" 
             style={{ 
               backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>
        
        {/* Ambient Glows */}
        <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-purple-900/20 rounded-full blur-[120px] mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[600px] h-[600px] bg-indigo-900/10 rounded-full blur-[100px] mix-blend-screen"></div>
      </div>

      {/* --- Toggle Sidebar Button (Visible when closed) --- */}
      <div className={`fixed left-6 top-6 z-40 transition-all duration-500 ease-in-out ${isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-full' : 'opacity-100 translate-x-0'}`}>
         <button 
           onClick={() => setIsSidebarOpen(true)}
           className="bg-white/5 backdrop-blur-md border border-white/10 p-3 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg"
           title="Open Sidebar"
         >
            <PanelLeftOpen className="w-5 h-5" />
         </button>
      </div>

      {/* --- Contact Author Button (Top-right) --- */}
      <div className="fixed right-6 top-6 z-40">
        <button
          onClick={() => setIsContactOpen(true)}
          className="bg-white/5 backdrop-blur-md border border-white/10 px-3 py-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all shadow-lg flex items-center gap-2"
          title={t.buttons.contactAuthor[language]}
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-sm font-bold">{t.buttons.contactAuthor[language]}</span>
        </button>
      </div>

      {/* --- Floating Glass Sidebar --- */}
      <div className={`fixed left-6 top-6 bottom-6 w-[360px] z-50 flex flex-col pointer-events-none transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-[calc(100%+24px)]'}`}>
        <div className="relative flex-grow flex flex-col pointer-events-auto overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] bg-gray-900/40 backdrop-blur-2xl transition-all duration-500 hover:border-white/20 hover:shadow-[0_0_60px_-10px_rgba(0,0,0,0.6)]">
          
          {/* Diffused Gradient Blobs inside Sidebar */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
          
          <div className="relative z-10 flex flex-col h-full overflow-hidden">
             {/* Header */}
             <div className="p-8 pb-4 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                     <div className="w-10 h-10 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center shadow-lg">
                        <Box className="w-6 h-6 text-black" strokeWidth={2.5} />
                     </div>
                     <h1 className="text-2xl font-black text-white tracking-tighter">{t.title[language]}</h1>
                  </div>
                  <p className="text-xs text-gray-400 font-mono tracking-wide leading-tight">{t.subtitle[language]}</p>
                </div>
                
                <div className="flex gap-2">
                  <button 
                    onClick={toggleLanguage}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group"
                    title="Toggle Language"
                  >
                    <div className="flex items-center gap-1.5 text-sm font-bold text-gray-400 group-hover:text-white">
                      <Languages className="w-5 h-5" />
                      <span>{language === 'en' ? 'EN' : '中'}</span>
                    </div>
                  </button>
                  <button 
                    onClick={() => setIsSidebarOpen(false)}
                    className="p-2 hover:bg-white/10 rounded-lg transition-colors group text-gray-400 hover:text-white"
                    title="Close Sidebar"
                  >
                     <PanelLeftClose className="w-5 h-5" />
                  </button>
                </div>
             </div>

             {/* Scrollable Form Area */}
             <div className="flex-grow overflow-y-auto px-8 py-2 custom-scrollbar space-y-6">
                
                {/* Theme Selector with Previews */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-3 flex items-center gap-2">
                    <Palette className="w-4 h-4" /> {t.badgeStyle[language]}
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {themes.map((t) => (
                      <button
                        key={t.id}
                        onClick={() => { setTheme(t.id); triggerAnimation(); }}
                        className="group flex flex-col items-center gap-2"
                      >
                         <BadgePreview theme={t.id} isActive={theme === t.id} />
                         <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${theme === t.id ? 'text-white' : 'text-gray-500 group-hover:text-gray-300'}`}>
                           {t.label}
                         </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="h-px bg-white/10 w-full"></div>

                {/* Form Fields */}
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.name[language]}</label>
                    <input 
                      name="name" 
                      value={data.name} 
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase shadow-inner"
                      placeholder={t.placeholders.name[language]}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.role[language]}</label>
                    <input 
                      name="role" 
                      value={data.role} 
                      onChange={handleInputChange}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase shadow-inner"
                      placeholder={t.placeholders.role[language]}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.id[language]}</label>
                        <input 
                          name="id" 
                          value={data.id} 
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase shadow-inner"
                        />
                    </div>
                    <div className="group">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.company[language]}</label>
                        <input 
                          name="company" 
                          value={data.company} 
                          onChange={handleInputChange}
                          className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase shadow-inner"
                        />
                    </div>
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.contact[language]}</label>
                    <textarea 
                      name="contact" 
                      value={data.contact} 
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase resize-none shadow-inner"
                      placeholder={t.placeholders.contact[language]}
                    />
                  </div>

                  <div className="group">
                    <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">{t.labels.address[language]}</label>
                    <textarea 
                      name="address" 
                      value={data.address} 
                      onChange={handleInputChange}
                      rows={2}
                      className="w-full bg-black/20 border border-white/5 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all uppercase resize-none shadow-inner"
                      placeholder={t.placeholders.address[language]}
                    />
                  </div>
                  
                  {/* Style Customization Section */}
                  {currentThemeFields.length > 0 && (
                    <>
                      <div className="h-px bg-white/10 w-full mt-4 mb-4"></div>
                      <div className="space-y-4">
                        <label className="block text-xs font-bold uppercase tracking-[0.2em] text-purple-400 mb-1 flex items-center gap-2">
                           <Settings2 className="w-3.5 h-3.5" />
                           {t.styleCustomization[language]}
                        </label>
                        {currentThemeFields.map((field) => (
                          <div className="group" key={field.key}>
                             <label className="block text-xs font-bold uppercase tracking-[0.2em] text-gray-500 mb-2 group-focus-within:text-purple-400 transition-colors">
                               {field.label[language]}
                             </label>
                             <input 
                                value={data.customFields[field.key] || ''}
                                onChange={(e) => handleCustomFieldChange(field.key, e.target.value)}
                                className="w-full bg-purple-900/10 border border-purple-500/20 rounded-lg px-4 py-3 text-base font-mono text-white placeholder-gray-600 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 focus:ring-1 focus:ring-purple-500/50 transition-all shadow-inner"
                                placeholder="DEFAULT"
                             />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>
             </div>

             {/* Footer Actions */}
             <div className="p-8 pt-6 border-t border-white/5 space-y-3">
                <button 
                  onClick={handleMagicFill}
                  disabled={isGenerating}
                  className="relative w-full py-4 bg-white text-black rounded-lg font-bold text-sm uppercase tracking-widest overflow-hidden group hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <div className="flex items-center justify-center gap-2 relative z-10">
                    {isGenerating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4 text-purple-600" />}
                    {isGenerating ? t.buttons.generating[language] : t.buttons.generate[language]}
                  </div>
                </button>

                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleExportPng}
                      className="w-full py-3 bg-blue-600/20 text-blue-200 border border-blue-500/30 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-blue-600/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Image className="w-3.5 h-3.5" />
                      {t.buttons.exportPng[language]}
                    </button>
                    <button 
                      onClick={handleCopyToClipboard}
                      disabled={copyStatus !== 'idle'}
                      className="w-full py-3 bg-purple-600/20 text-purple-200 border border-purple-500/30 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-purple-600/40 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {copyStatus === 'success' ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copyStatus === 'success' ? t.buttons.copied[language] : t.buttons.copyClipboard[language]}
                    </button>
                </div>

                <button 
                  onClick={triggerAnimation}
                  className="w-full py-3 bg-black/40 text-white border border-white/10 rounded-lg font-bold text-xs uppercase tracking-wider hover:bg-black/60 hover:border-white/20 transition-all flex items-center justify-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-gray-400" />
                  {t.buttons.reroll[language]}
                </button>
             </div>
             
             {/* Model Credit */}
             <div className="pb-4 text-center">
               <span className="text-xs font-mono text-white/20 tracking-widest">POWERED BY GEMINI 3 PRO</span>
             </div>
          </div>
        </div>
      </div>

      {isContactOpen && (
        <div className="fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsContactOpen(false)}></div>
          <div className="absolute inset-0 flex items-center justify-center p-6">
            <div className="relative w-[420px] pointer-events-auto overflow-hidden rounded-3xl border border-white/10 shadow-[0_0_40px_-10px_rgba(0,0,0,0.5)] bg-gray-900/40 backdrop-blur-2xl">
              <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
              <div className="absolute top-0 -right-4 w-72 h-72 bg-cyan-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
              <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-500 rounded-full mix-blend-screen filter blur-3xl opacity-10"></div>
              <div className="relative z-10 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Box className="w-5 h-5 text-white" />
                    <span className="text-sm font-bold uppercase tracking-[0.2em] text-white">{t.buttons.contactAuthor[language]}</span>
                  </div>
                  <button onClick={() => setIsContactOpen(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white">
                    <X className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-3 text-gray-300">
                  <p className="text-sm leading-relaxed">公众号&小红书：@LuN3cy的实验房</p>
                  <p className="text-sm leading-relaxed">B站：LuN3cy</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- Main Stage (Visuals) --- */}
      <div className="relative w-full h-full overflow-y-auto custom-scrollbar perspective-container">
         
         {/* Inner Scroll Wrapper: Added min-h and bottom padding for scrolling */}
         <div className={`w-full min-h-full flex justify-center pb-24 transition-[padding] duration-500 ease-in-out ${isSidebarOpen ? 'lg:pl-[380px]' : ''}`}>
            
            {/* 
               UNIFIED PHYSICS RIG 
            */}
            <div 
              className={`
                relative origin-top transform-style-3d w-[340px] scale-[0.85] md:scale-95 2xl:scale-100 transition-transform duration-500
                ${isAnimating ? 'animate-swing-drop' : 'opacity-0 translate-y-[-100%]'}
              `}
            >
               {/* LANYARD LAYER */}
               <div className="absolute top-0 left-0 w-full" style={{ transform: 'translateZ(-10px)' }}>
                  <Lanyard />
               </div>

               {/* BADGE LAYER */}
               <div 
                 ref={badgeWrapperRef}
                 className="relative mt-[40vh] transition-transform duration-200 ease-out will-change-transform" 
                 style={{ 
                    transform: `translateY(-24px) translateZ(10px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
                    transformStyle: 'preserve-3d'
                 }}
                 onMouseMove={handleMouseMove}
                 onMouseLeave={handleMouseLeave}
               >
                  <Badge data={data} theme={theme} language={language} uniqueId="main" />
               </div>
            </div>

         </div>
      </div>

      {/* --- HIDDEN EXPORT STAGES --- */}
      <div className="fixed -left-[9999px] top-0 pointer-events-none">
          
          {/* PNG Export: The "Poster" View (3:4 Ratio, Light Gradient Background) */}
          <div ref={exportPosterRef} className="w-[1200px] h-[1600px] bg-gray-50 relative overflow-hidden flex items-center justify-center">
             {/* Diffused Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-gray-200"></div>
            <div className="absolute bottom-[-20%] left-[10%] w-[900px] h-[900px] bg-blue-200/30 rounded-full blur-[150px]"></div>
             
             {/* Centered Badge - Scaled Up for Quality */}
             <div className="scale-[2] transform-gpu shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] rounded-xl">
                 <Badge data={data} theme={theme} language={language} uniqueId="png-export" />
             </div>

             {/* Watermark */}
             <div className="absolute bottom-16 left-16 flex items-center gap-4 opacity-50">
                <div className="w-12 h-12 bg-black text-white rounded-lg flex items-center justify-center">
                    <Box className="w-7 h-7" strokeWidth={2.5} />
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-gray-900 tracking-tighter">LUNA-BADGE</span>
                    <span className="text-sm font-mono text-gray-500 uppercase tracking-widest">Designed by You</span>
                </div>
             </div>
          </div>
      </div>

    </div>
  );
};

export default App;
