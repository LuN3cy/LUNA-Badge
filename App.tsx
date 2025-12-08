import React, { useState, useEffect, useRef } from 'react';
import { Badge, BadgePreview, LogoRenderer } from './components/Badge';
import { CircularColorPicker } from './components/CircularColorPicker';
import { BadgeData, BadgeTheme, Language, INITIAL_BADGE_DATA } from './types';
import { generatePersona } from './services/geminiService';
import { Sparkles, RefreshCw, Box, Palette, Languages, Settings2, Image, PanelLeftClose, PanelLeftOpen, Copy, Check, MessageCircle, X, Upload, Trash2, ChevronDown, ChevronUp, ChevronRight, Tv, ExternalLink, Heart, MessageSquare, QrCode } from 'lucide-react';
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
    exportPng: { en: 'Export Info Card', zh: '导出展示图卡片' },
    exportCardPng: { en: 'Export Badge Only (PNG)', zh: '仅导出工牌' },
    copyClipboard: { en: 'Copy to Clipboard', zh: '复制到剪切板' },
    copied: { en: 'Copied!', zh: '已复制!' },
    contactAuthor: { en: 'Contact Author', zh: '联系作者' },
    uploadLogo: { en: 'Upload Logo', zh: '上传 LOGO' },
    removeLogo: { en: 'Remove Logo', zh: '移除 LOGO' },
  },
  styleCustomization: { en: 'Style Customization', zh: '样式自定义' },
  qrControl: {
    label: { en: 'QR Code', zh: '二维码显示' },
    info: { en: 'Generates from card info', zh: '根据卡片信息自动生成' },
    customContent: { en: 'Custom Content', zh: '自定义内容' },
    useCustom: { en: 'Use Custom Content', zh: '使用自定义内容' },
    showQr: { en: 'Show QR Code', zh: '显示二维码' },
    placeholder: { en: 'Enter custom QR content...', zh: '输入自定义二维码内容...' },
  },
  logoSection: { en: 'Logo Customization', zh: 'Logo 设置' },
  logoControls: {
      title: { en: 'Logo Editor', zh: 'Logo 编辑器' },
      scale: { en: 'Scale', zh: '缩放' },
      opacity: { en: 'Opacity', zh: '不透明度' },
      contrast: { en: 'Contrast', zh: '对比度' },
      grayscale: { en: 'B&W', zh: '黑白' },
      invert: { en: 'Invert', zh: '反色' },
      simplify: { en: 'Simplify (Flat Style)', zh: '一键简化 (扁平风)' },
      overlay: { en: 'Color Overlay', zh: '颜色叠加' },
      blendMode: { en: 'Color Blend', zh: '色彩模式' },
      selectColor: { en: 'Select Color', zh: '选择颜色' }
  },
  shapeControls: {
      title: { en: 'Shape Customization', zh: '外形设置' },
      cornerRadius: { en: 'Corner Radius', zh: '圆角程度' },
  },
  themes: {
    industrial: { en: 'Industrial', zh: '工业风' },
    modern: { en: 'Modern', zh: '现代' },
    swiss: { en: 'Swiss', zh: '瑞士风格' },
    creative: { en: 'Creative', zh: '创意' },
    'formal-red': { en: 'Formal Red', zh: '商务红' },
    minimalism: { en: 'Minimalism', zh: '极简' },
    matrix: { en: 'The Matrix', zh: '黑客帝国' },
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
  matrix: [
    { key: 'matrix_system', label: { en: 'System Label', zh: '系统标签' } },
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
  const [isLogoSettingsOpen, setIsLogoSettingsOpen] = useState(false);
  const [isColorPickerOpen, setIsColorPickerOpen] = useState(false);
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const [pickerPosition, setPickerPosition] = useState({ top: 0, left: 0 });
  
  const animationTimeoutRef = useRef<number | null>(null);
  const exportPosterRef = useRef<HTMLDivElement>(null); // For PNG export (Full Poster)
  const exportCardRef = useRef<HTMLDivElement>(null); // For Card Only export
  const badgeWrapperRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const qrTextareaRef = useRef<HTMLTextAreaElement>(null);

  const [sectionOpen, setSectionOpen] = useState({
    theme: true,
    basic: true,
    qr: true,
    logo: true,
    shape: true,
    style: true
  });

  const toggleSection = (section: keyof typeof sectionOpen) => {
    setSectionOpen(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  // Auto-resize QR textarea
  useEffect(() => {
    if (qrTextareaRef.current && sectionOpen.qr && data.isCustomQr) {
        qrTextareaRef.current.style.height = 'auto';
        qrTextareaRef.current.style.height = (qrTextareaRef.current.scrollHeight + 2) + 'px';
    }
  }, [data.qrValue, data.isCustomQr, sectionOpen.qr]);

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
      // Only update qrValue if not using custom QR
      if (!prev.isCustomQr) {
          updatedData.qrValue = generateQRString(updatedData);
      }
      return updatedData;
    });
  };

  const handleCustomQrChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setData(prev => ({
      ...prev,
      qrValue: value,
      isCustomQr: true
    }));
  };

  const toggleCustomQr = (useCustom: boolean) => {
    setData(prev => {
       const newQrValue = useCustom ? prev.qrValue : generateQRString(prev);
       return {
           ...prev,
           isCustomQr: useCustom,
           qrValue: newQrValue
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

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setData(prev => ({
          ...prev,
          logo: event.target?.result as string
        }));
        setIsLogoSettingsOpen(true); // Auto-open settings on upload
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setData(prev => ({
      ...prev,
      logo: undefined
    }));
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  const handleLogoSettingChange = (key: keyof typeof data.logoSettings, value: any) => {
    setData(prev => ({
      ...prev,
      logoSettings: {
        ...prev.logoSettings,
        [key]: value
      }
    }));
  };

  const handleMagicFill = async () => {
    setIsGenerating(true);
    const newData = await generatePersona(language);
    if (newData) {
      // Preserve existing custom fields and logo when generating new persona
      setData(prev => ({
        ...newData,
        customFields: prev.customFields,
        logo: prev.logo
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

  const handleExportCardPng = async () => {
    if (exportCardRef.current) {
        try {
            const dataUrl = await toPng(exportCardRef.current, { pixelRatio: 4 });
            download(dataUrl, `luna-badge-card-${data.name.replace(/\s+/g, '-').toLowerCase()}.png`);
        } catch (err) {
            console.error('Card PNG export failed', err);
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
    { id: 'matrix', label: t.themes.matrix[language] },
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
                     <img 
                        src="sidebar-logo.svg" 
                        alt="Logo" 
                        className="w-10 h-10 rounded-lg shadow-lg object-contain bg-white/10"
                        onError={(e) => {
                            // Fallback if image fails (e.g. not found) - show placeholder box
                            e.currentTarget.style.display = 'none';
                            e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                     />
                     <div className="hidden w-10 h-10 bg-gradient-to-br from-white to-gray-400 rounded-lg flex items-center justify-center shadow-lg">
                        <Box className="w-6 h-6 text-black" strokeWidth={2.5} />
                     </div>
                     <h1 className="text-l font-black text-white tracking-tighter whitespace-nowrap">{t.title[language]}</h1>
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
             <div className="flex-grow overflow-y-auto px-8 py-2 custom-scrollbar space-y-2">
                
                {/* Theme Selector with Previews */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                   <button 
                     onClick={() => toggleSection('theme')}
                     className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                   >
                      <div className="flex items-center gap-2">
                         <Palette className="w-4 h-4 text-purple-400" />
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{t.badgeStyle[language]}</span>
                      </div>
                      {sectionOpen.theme ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                   </button>

                   {sectionOpen.theme && (
                     <div className="p-4 pt-0 animate-in slide-in-from-top-2 duration-200">
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
                   )}
                </div>

                {/* Section 1: Basic Info */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                   <button 
                     onClick={() => toggleSection('basic')}
                     className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                   >
                      <div className="flex items-center gap-2">
                         <MessageSquare className="w-4 h-4 text-purple-400" />
                         <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Identity Data</span>
                      </div>
                      {sectionOpen.basic ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                   </button>
                   
                   {sectionOpen.basic && (
                     <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
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
                     </div>
                   )}
                </div>

                {/* Section 2: QR Code */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                    <button 
                        onClick={() => toggleSection('qr')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <QrCode className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{t.qrControl.label[language]}</span>
                        </div>
                        {sectionOpen.qr ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>

                    {sectionOpen.qr && (
                        <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                            {/* Enable/Disable Toggle */}
                            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t.qrControl.showQr[language]}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={data.qrEnabled}
                                        onChange={(e) => setData(prev => ({ ...prev, qrEnabled: e.target.checked }))}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Custom Content Toggle */}
                            <div className="flex items-center justify-between p-2 bg-black/20 rounded-lg">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-wider ml-1">{t.qrControl.useCustom[language]}</span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input 
                                        type="checkbox" 
                                        className="sr-only peer" 
                                        checked={data.isCustomQr}
                                        onChange={(e) => toggleCustomQr(e.target.checked)}
                                    />
                                    <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-purple-600"></div>
                                </label>
                            </div>

                            {/* Custom Content Input or Read-only Display */}
                            <div className="space-y-2 pt-1">
                                <label className="block text-[10px] font-bold uppercase tracking-widest text-gray-500 ml-1">
                                    {data.isCustomQr ? t.qrControl.customContent[language] : 'Auto-Generated Content'}
                                </label>
                                {data.isCustomQr ? (
                                    <textarea
                                        ref={qrTextareaRef}
                                        value={data.qrValue}
                                        onChange={handleCustomQrChange}
                                        rows={1}
                                        className="w-full bg-black/20 border border-white/5 rounded-lg px-3 py-2 text-xs font-mono text-white placeholder-gray-700 focus:outline-none focus:bg-black/40 focus:border-purple-500/50 transition-all resize-none overflow-hidden"
                                        placeholder={t.qrControl.placeholder[language]}
                                        style={{ minHeight: '60px' }}
                                    />
                                ) : (
                                    <div className="w-full bg-black/40 border border-white/5 rounded-lg px-3 py-2 text-[10px] font-mono text-gray-500 break-all whitespace-pre-wrap h-auto max-h-24 overflow-y-auto custom-scrollbar">
                                        {data.qrValue}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Section 3: Logo */}
                <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                   <button 
                        onClick={() => toggleSection('logo')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Image className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{t.logoSection[language]}</span>
                        </div>
                        {sectionOpen.logo ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {sectionOpen.logo && (
                        <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                           <div className="flex items-center gap-4">
                                <div 
                                    onClick={() => fileInputRef.current?.click()}
                                    className="flex-1 h-12 bg-black/20 border border-white/10 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-black/40 hover:border-purple-500/50 transition-all group"
                                >
                                    <input 
                                        type="file" 
                                        ref={fileInputRef} 
                                        onChange={handleLogoUpload} 
                                        accept="image/png, image/jpeg, image/svg+xml" 
                                        className="hidden" 
                                    />
                                    <div className="flex items-center gap-2 text-gray-500 group-hover:text-purple-400">
                                        <Upload className="w-4 h-4" />
                                        <span className="text-xs font-bold uppercase tracking-wider">{t.buttons.uploadLogo[language]}</span>
                                    </div>
                                </div>
                                {data.logo && (
                                    <button 
                                        onClick={handleRemoveLogo}
                                        className="h-12 w-12 flex items-center justify-center bg-red-500/10 border border-red-500/20 rounded-lg hover:bg-red-500/20 text-red-400 transition-all"
                                        title={t.buttons.removeLogo[language]}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            
                            {/* Logo Settings - Merged into this section */}
                            {data.logo && (
                                <div className="w-full bg-black/20 rounded-lg border border-white/5 overflow-hidden">
                                    <div className="p-3 border-b border-white/5">
                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
                                            <Settings2 className="w-3.5 h-3.5" />
                                            {t.logoControls.title[language]}
                                        </span>
                                    </div>
                                    
                                    <div className="p-4 space-y-4">
                                        <div className="flex justify-center p-2 bg-black/40 rounded border border-white/5 mb-2">
                                            <div className="relative">
                                                <LogoRenderer
                                                    src={data.logo}
                                                    settings={data.logoSettings}
                                                    className="max-h-16 object-contain transition-all"
                                                />
                                            </div>
                                        </div>

                                        {/* Logo Editor Controls */}
                                        <div className="space-y-3">
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">{t.logoControls.scale[language]}</label>
                                                    <span className="text-[10px] font-mono text-gray-400">{data.logoSettings.scale}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="50" max="150" 
                                                    value={data.logoSettings.scale} 
                                                    onChange={(e) => handleLogoSettingChange('scale', Number(e.target.value))}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>
                                            
                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">{t.logoControls.opacity[language]}</label>
                                                    <span className="text-[10px] font-mono text-gray-400">{data.logoSettings.opacity}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="100" 
                                                    value={data.logoSettings.opacity} 
                                                    onChange={(e) => handleLogoSettingChange('opacity', Number(e.target.value))}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>

                                            <div>
                                                <div className="flex justify-between mb-1">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">{t.logoControls.contrast[language]}</label>
                                                    <span className="text-[10px] font-mono text-gray-400">{data.logoSettings.contrast}%</span>
                                                </div>
                                                <input 
                                                    type="range" min="0" max="200" 
                                                    value={data.logoSettings.contrast} 
                                                    onChange={(e) => handleLogoSettingChange('contrast', Number(e.target.value))}
                                                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                                                />
                                            </div>

                                            <div className="flex gap-2 pt-2">
                                                <button 
                                                    onClick={() => handleLogoSettingChange('grayscale', !data.logoSettings.grayscale)}
                                                    className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border transition-all ${data.logoSettings.grayscale ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                                                >
                                                    {t.logoControls.grayscale[language]}
                                                </button>
                                                <button 
                                                    onClick={() => handleLogoSettingChange('invert', !data.logoSettings.invert)}
                                                    className={`flex-1 py-2 rounded text-[10px] font-bold uppercase border transition-all ${data.logoSettings.invert ? 'bg-white text-black border-white' : 'bg-transparent text-gray-500 border-white/10 hover:border-white/30'}`}
                                                >
                                                    {t.logoControls.invert[language]}
                                                </button>
                                            </div>

                                            {/* Color Overlay Control */}
                                            <div className="pt-2">
                                                <div className="flex items-center justify-between mb-2">
                                                    <label className="text-[10px] font-bold uppercase text-gray-500">{t.logoControls.overlay[language]}</label>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input 
                                                            type="checkbox" 
                                                            className="sr-only peer" 
                                                            checked={data.logoSettings.overlayEnabled}
                                                            onChange={(e) => handleLogoSettingChange('overlayEnabled', e.target.checked)}
                                                        />
                                                        <div className="w-8 h-4 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-purple-600"></div>
                                                    </label>
                                                </div>
                                                {data.logoSettings.overlayEnabled && (
                                                    <div className="relative">
                                                        <button
                                                            ref={colorButtonRef}
                                                            onClick={() => {
                                                                if (colorButtonRef.current) {
                                                                    const rect = colorButtonRef.current.getBoundingClientRect();
                                                                    setPickerPosition({ top: rect.top, left: rect.right + 16 });
                                                                }
                                                                setIsColorPickerOpen(!isColorPickerOpen);
                                                            }}
                                                            className="w-full h-10 rounded-lg border border-white/10 flex items-center justify-between px-3 hover:border-white/30 transition-all group"
                                                            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
                                                        >
                                                            <div className="flex items-center gap-3">
                                                                 <div 
                                                                    className="w-6 h-6 rounded-full border border-white/20 shadow-sm"
                                                                    style={{ backgroundColor: data.logoSettings.overlayColor }}
                                                                 ></div>
                                                                 <span className="text-xs font-mono text-gray-300 group-hover:text-white uppercase">
                                                                    {data.logoSettings.overlayColor}
                                                                 </span>
                                                            </div>
                                                            <Palette className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                onClick={() => {
                                                    // Simplify preset: High contrast, B&W
                                                    handleLogoSettingChange('grayscale', true);
                                                    handleLogoSettingChange('contrast', 150);
                                                    handleLogoSettingChange('brightness', 110);
                                                    handleLogoSettingChange('invert', false);
                                                }}
                                                className="w-full py-2 rounded text-[10px] font-bold uppercase border border-purple-500/30 text-purple-300 hover:bg-purple-500/10 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Sparkles className="w-3 h-3" />
                                                {t.logoControls.simplify[language]}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
                
                {/* Section 4: Shape */}
                 <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                   <button 
                        onClick={() => toggleSection('shape')}
                        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <Settings2 className="w-4 h-4 text-purple-400" />
                            <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{t.shapeControls.title[language]}</span>
                        </div>
                        {sectionOpen.shape ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                    </button>
                    {sectionOpen.shape && (
                        <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
                           <div className="group">
                              <div className="flex justify-between mb-2">
                                  <label className="text-xs font-bold uppercase tracking-[0.2em] text-gray-500 group-focus-within:text-purple-400 transition-colors">
                                      {t.shapeControls.cornerRadius[language]}
                                  </label>
                                  <span className="text-xs font-mono text-gray-400">{data.cornerRadius}px</span>
                              </div>
                              <input 
                                  type="range" min="0" max="60" 
                                  value={data.cornerRadius} 
                                  onChange={(e) => setData(prev => ({ ...prev, cornerRadius: Number(e.target.value) }))}
                                  className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-purple-500"
                              />
                          </div>
                        </div>
                    )}
                </div>

                {/* Section 5: Style */}
                {currentThemeFields.length > 0 && (
                    <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                        <button 
                            onClick={() => toggleSection('style')}
                            className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
                        >
                            <div className="flex items-center gap-2">
                                <Settings2 className="w-4 h-4 text-purple-400" />
                                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">{t.styleCustomization[language]}</span>
                            </div>
                            {sectionOpen.style ? <ChevronUp className="w-4 h-4 text-gray-500" /> : <ChevronDown className="w-4 h-4 text-gray-500" />}
                        </button>
                        {sectionOpen.style && (
                            <div className="p-4 pt-0 space-y-4 animate-in slide-in-from-top-2 duration-200">
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
                        )}
                    </div>
                )}
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

                <div className="grid grid-cols-2 gap-3">
                    <button 
                      onClick={handleExportCardPng}
                      className="col-span-2 w-full py-3 bg-green-600/20 text-green-200 border border-green-500/30 rounded-lg font-bold text-[10px] uppercase tracking-wider hover:bg-green-600/40 transition-all flex items-center justify-center gap-2"
                    >
                      <Image className="w-3.5 h-3.5" />
                      {t.buttons.exportCardPng[language]}
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
                <div className="flex flex-col gap-3">
                  <a href="https://mp.weixin.qq.com/s/MD5T-BsAgUi9yUo6ISY1CA" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-[#07c160]/20 hover:border-[#07c160]/50 hover:scale-[1.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#07c160]/20 flex items-center justify-center group-hover:bg-[#07c160] transition-colors">
                      <MessageSquare className="w-5 h-5 text-[#07c160] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200 group-hover:text-white">公众号：@LuN3cy的实验房</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-300">点击查看最新文章</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white/50 ml-auto" />
                  </a>

                  <a href="https://www.xiaohongshu.com/user/profile/61bbb882000000001000e80d" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-[#ff2442]/20 hover:border-[#ff2442]/50 hover:scale-[1.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#ff2442]/20 flex items-center justify-center group-hover:bg-[#ff2442] transition-colors">
                      <Heart className="w-5 h-5 text-[#ff2442] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200 group-hover:text-white">小红书：@LuN3cy</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-300">关注我的设计日常</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white/50 ml-auto" />
                  </a>

                  <a href="https://b23.tv/XNNX02Q" target="_blank" rel="noopener noreferrer" 
                    className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-[#00aeec]/20 hover:border-[#00aeec]/50 hover:scale-[1.02] transition-all group"
                  >
                    <div className="w-10 h-10 rounded-full bg-[#00aeec]/20 flex items-center justify-center group-hover:bg-[#00aeec] transition-colors">
                      <Tv className="w-5 h-5 text-[#00aeec] group-hover:text-white transition-colors" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-gray-200 group-hover:text-white">Bilibili：@LuN3cy</span>
                      <span className="text-xs text-gray-500 group-hover:text-gray-300">观看更多视频和作品</span>
                    </div>
                    <ExternalLink className="w-4 h-4 text-gray-600 group-hover:text-white/50 ml-auto" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {isColorPickerOpen && (
        <div className="fixed inset-0 z-[100] pointer-events-none">
          <div className="absolute inset-0 bg-transparent pointer-events-auto" onClick={() => setIsColorPickerOpen(false)}></div>
          
          <div 
             className="absolute pointer-events-auto p-4 bg-gray-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] flex flex-col items-center animate-in fade-in zoom-in-95 duration-200"
             style={{ 
                 top: pickerPosition.top, 
                 left: pickerPosition.left,
                 transform: 'translateY(-25%)' // Center vertically relative to button or adjust slightly up
             }}
          >
                <div className="flex items-center justify-between w-full mb-3">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                        <Palette className="w-3 h-3" />
                        {t.logoControls.selectColor[language]}
                    </div>
                </div>
                <CircularColorPicker 
                    color={data.logoSettings.overlayColor} 
                    onChange={(color) => handleLogoSettingChange('overlayColor', color)}
                />
                <div className="mt-3 flex items-center gap-2 w-full">
                    <div className="w-6 h-6 rounded-full border border-white/20 shadow-inner shrink-0" style={{ backgroundColor: data.logoSettings.overlayColor }}></div>
                    <input 
                        type="text" 
                        value={data.logoSettings.overlayColor}
                        onChange={(e) => handleLogoSettingChange('overlayColor', e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded px-2 py-1 text-[10px] font-mono text-gray-300 focus:outline-none focus:border-white/30 text-center uppercase"
                    />
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
                 className="relative mt-[40vh] h-[540px] transition-transform duration-200 ease-out will-change-transform" 
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

          {/* Card Only Export: Standard Res container, Scaled up via pixelRatio */}
          <div ref={exportCardRef} className="w-[340px] h-[540px] bg-transparent relative flex items-center justify-center">
              <Badge data={data} theme={theme} language={language} uniqueId="card-export" />
          </div>
      </div>

    </div>
  );
};

export default App;
