import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Hexagon, Boxes, Aperture, Phone, MapPin, Award } from 'lucide-react';
import { BadgeData, BadgeTheme, Language } from '../types';
import { NoiseTexture } from './NoiseTexture';

// Helper for adaptive font sizing
const getAdaptiveSize = (text: string, baseClass: string, longClass: string, veryLongClass: string, limit1: number = 8, limit2: number = 16) => {
  if (!text) return baseClass;
  const len = text.length;
  if (len > limit2) return veryLongClass;
  if (len > limit1) return longClass;
  return baseClass;
};

interface BadgeProps {
  data: BadgeData;
  theme: BadgeTheme;
  language: Language;
  uniqueId?: string;
}

const BADGE_TRANSLATIONS = {
  industrial: {
    address: { en: 'ADDRESS', zh: '地址' },
    contact: { en: 'CONTACT', zh: '联系方式' },
    identifier: { en: '@IDENTIFIER', zh: '@身份标识' },
    refId: { en: 'Reference ID', zh: '参考 ID' },
  },
  modern: {
    identityPass: { en: 'Identity Pass', zh: '身份通行证' },
    permanentCard: { en: 'Permanent Card', zh: '永久卡' },
    refId: { en: 'Reference ID', zh: '参考 ID' },
    organization: { en: 'Organization', zh: '所属组织' },
    contact: { en: 'Contact', zh: '联系方式' },
    location: { en: 'Location', zh: '地址' },
  },
  swiss: {
    work: { en: 'WORK', zh: '工作' },
    permit: { en: 'PERMIT', zh: '许可' },
    contact: { en: 'Contact', zh: '联系方式' },
    address: { en: 'Address', zh: '地址' },
    affiliation: { en: 'Affiliation', zh: '所属机构' },
  },
  creative: {
    contact: { en: 'Contact', zh: '联系方式' },
    address: { en: 'Address', zh: '地址' },
    verified: { en: 'VERIFIED', zh: '已验证' },
  },
  formalRed: {
    anniversary: { en: 'Anniversary Event', zh: '周年庆典' },
    contact: { en: 'Contact', zh: '联系方式' },
    address: { en: 'Address', zh: '地址' },
    designation: { en: 'Designation', zh: '职位' },
  },
  minimalism: {
    corporate: { en: 'CORPORATE ©', zh: '企业 ©' },
    location: { en: 'Location', zh: '地址' },
    contact: { en: 'Contact', zh: '联系方式' },
  },
};

// --- SUB-COMPONENTS FOR EACH STYLE ---

const IndustrialBadge = ({ data, lang, uniqueId }: { data: BadgeData, lang: Language, uniqueId: string }) => {
  const t = BADGE_TRANSLATIONS.industrial;
  const exportMode = uniqueId.includes('export');
  return (
    <div className="relative w-full h-full bg-[#0a0a0a] text-gray-200 font-mono flex flex-col justify-between p-8">
        <NoiseTexture id={`noise-${uniqueId}`} />
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/60 pointer-events-none z-20 mix-blend-overlay"></div>
        
        <div className="relative z-10 flex flex-col h-full">
          <div className="mt-8 mb-6">
            {/* Logo Removed */}
          </div>
          <div className="flex-1 min-h-0">
          <div className="space-y-2 mb-4">
            <h2 className={`${getAdaptiveSize(data.role, 'text-4xl', 'text-2xl', 'text-xl', 10, 20)} font-bold ${exportMode ? 'tracking-wide' : 'tracking-[0.2em]'} text-gray-100 uppercase drop-shadow-md break-words line-clamp-2`}>{data.role}</h2>
            <div className="w-full h-px bg-gradient-to-r from-transparent via-white/30 to-transparent my-4"></div>
          </div>
  
          <div className="grid grid-cols-2 gap-4 text-xs tracking-widest text-gray-400 font-bold uppercase mb-4">
            <div>
              <span className="block mb-1 text-[11px] text-gray-600">{t.address[lang]}</span>
              <p className="whitespace-pre-line leading-relaxed text-gray-300 text-xs line-clamp-3">{data.address}</p>
            </div>
            <div>
              <span className="block mb-1 text-[11px] text-gray-600">{t.contact[lang]}</span>
              <p className="whitespace-pre-line leading-relaxed text-gray-300 text-cyan-500/80 text-xs line-clamp-3">{data.contact}</p>
            </div>
          </div>
  
          <div className="w-full h-px bg-white/10 mb-4"></div>
  
          <div className="mb-auto">
            <span className="text-[11px] text-gray-500 block mb-1">
              {data.customFields['industrial_identifier'] || t.identifier[lang]}
            </span>
            <h1 className={`${getAdaptiveSize(data.name, 'text-4xl', 'text-3xl', 'text-2xl', 6, 12)} font-mono text-white ${exportMode ? 'tracking-wide' : 'tracking-widest'} uppercase break-words line-clamp-2`}>{data.name}</h1>
          </div>
          </div>
  
          <div className="flex items-end justify-between mt-4 mb-2">
            <div className="p-1.5 rounded-sm">
               <QRCodeSVG value={data.qrValue} size={72} level="M" bgColor="transparent" fgColor="#FFFFFF" />
            </div>
            <div className="flex flex-col items-end text-right">
              <div className="mb-4">
                <span className="block text-[11px] text-gray-600 uppercase tracking-wider mb-1">{t.refId[lang]}</span>
                <span className="text-xs font-mono text-gray-300 tracking-wider max-w-[120px] truncate">{data.id}</span>
              </div>
              <div className="flex flex-col items-end group cursor-help">
                  <span className="text-[11px] text-gray-500 uppercase tracking-tight max-w-[110px] leading-tight text-right line-clamp-2">
                      {data.company}
                  </span>
                   <Boxes className="w-4 h-4 text-gray-600 mt-1" />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

const ModernBadge = ({ data, lang }: { data: BadgeData, lang: Language }) => {
  const t = BADGE_TRANSLATIONS.modern;
  return (
    <div className="relative w-full h-full bg-gradient-to-br from-blue-950 via-blue-900 to-slate-900 text-white font-sans overflow-hidden flex flex-col">
       <div className="absolute inset-0 opacity-40 mix-blend-color-dodge">
          <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.5),transparent_70%)] blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-full h-full bg-[linear-gradient(45deg,transparent_40%,rgba(147,197,253,0.1)_45%,transparent_50%)]"></div>
       </div>
       
       <div className="relative z-10 flex flex-col h-full p-8 pt-12">
          <div className="flex justify-between items-start border-b border-white/20 pb-4 mb-8">
             <span className="text-xs tracking-widest uppercase opacity-70">
                {data.customFields['modern_top_left'] || t.identityPass[lang]}
             </span>
             <span className="text-xs tracking-widest uppercase opacity-70">
                {data.customFields['modern_top_right'] || t.permanentCard[lang]}
             </span>
          </div>
  
          <div className="flex-grow flex flex-col justify-center mb-8">
             <h1 className={`${getAdaptiveSize(data.name, 'text-[3.5rem]', 'text-5xl', 'text-4xl', 8, 15)} font-bold leading-[0.9] tracking-tight mb-4 drop-shadow-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-blue-200 break-words line-clamp-2`}>
               {data.name.split(' ').map((n,i) => <span key={i} className="inline-block mr-2">{n}</span>)}
             </h1>
             <p className={`${getAdaptiveSize(data.role, 'text-xl', 'text-lg', 'text-base', 20, 30)} font-medium text-blue-200 tracking-wide uppercase break-words line-clamp-2`}>{data.role}</p>
          </div>

          <div className="flex items-end gap-4 mt-auto border-t border-white/10 pt-8">
             <div className="grid grid-cols-2 gap-x-4 gap-y-4 flex-grow">
                <div>
                   <span className="block text-[11px] uppercase tracking-wider text-blue-300 mb-0.5">{t.refId[lang]}</span>
                   <span className="font-mono text-xs opacity-90 block truncate">#{data.id}</span>
                </div>
                <div>
                   <span className="block text-[11px] uppercase tracking-wider text-blue-300 mb-0.5">{t.organization[lang]}</span>
                   <span className="font-sans text-xs opacity-90 block truncate">{data.company}</span>
                </div>
                <div>
                   <span className="block text-[11px] uppercase tracking-wider text-blue-300 mb-0.5">{t.contact[lang]}</span>
                   <span className="font-sans text-xs opacity-90 leading-tight block whitespace-pre-line line-clamp-2">{data.contact}</span>
                </div>
                <div>
                   <span className="block text-[11px] uppercase tracking-wider text-blue-300 mb-0.5">{t.location[lang]}</span>
                   <span className="font-sans text-xs opacity-90 leading-tight block whitespace-pre-line line-clamp-2">{data.address}</span>
                </div>
             </div>
  
             <div className="bg-white/10 p-2 rounded-lg backdrop-blur-md border border-white/20 shadow-lg shrink-0">
                 <QRCodeSVG value={data.qrValue} size={64} fgColor="#FFFFFF" bgColor="transparent" />
             </div>
          </div>
  
       </div>
    </div>
  );
};

const SwissBadge = ({ data, lang, uniqueId }: { data: BadgeData, lang: Language, uniqueId: string }) => {
  const t = BADGE_TRANSLATIONS.swiss;
  return (
    <div className="relative w-full h-full bg-[#3b82f6] text-white font-sans flex flex-col items-center justify-center p-6 pb-0 overflow-hidden">
       <div className="absolute inset-0 opacity-10 mix-blend-multiply pointer-events-none">
         <NoiseTexture id={`noise-${uniqueId}`} />
       </div>
  
       <div className="absolute top-6 left-6 w-3 h-3 bg-white"></div>
       <div className="absolute top-6 right-6 font-mono text-sm font-bold tracking-widest opacity-80">
          #{data.id}
       </div>
       
       <div className="absolute top-4 left-1/2 -translate-x-1/2 w-12 h-1 bg-white/20 rounded-full"></div>
  
       <div className="w-full h-full flex flex-col items-center justify-between pt-12 text-center relative z-10">
          
          <div className="space-y-1 mt-4">
             <h3 className="text-3xl font-bold tracking-tighter leading-none uppercase">
               {data.customFields['swiss_main'] || t.work[lang]}
             </h3>
             <h3 className="text-3xl font-bold tracking-tighter leading-none opacity-80 uppercase">
               {data.customFields['swiss_sub'] || t.permit[lang]}
             </h3>
             <div className="w-4 h-0.5 bg-white mx-auto mt-4"></div>
          </div>
  
          <div className="space-y-2">
             <h1 className={`${getAdaptiveSize(data.name, 'text-6xl', 'text-5xl', 'text-3xl', 4, 10)} font-black tracking-tighter leading-[0.85] uppercase break-words line-clamp-2`}>
               {data.name.split(' ').map((n,i) => <div key={i} className="inline-block mr-4">{n}</div>)}
             </h1>
             <div className="w-4 h-0.5 bg-white mx-auto my-4"></div>
             <p className={`${getAdaptiveSize(data.role, 'text-2xl', 'text-xl', 'text-lg', 15, 25)} font-bold uppercase tracking-tight opacity-90 break-words line-clamp-2`}>{data.role}</p>
          </div>
  
          <div className="w-full space-y-6 mt-4">
               <div className="flex justify-between px-4 text-left">
                  <div className="w-1/2 pr-2">
                     <p className="text-[11px] font-bold uppercase opacity-60 mb-0.5">{t.contact[lang]}</p>
                     <p className="text-sm font-mono leading-tight whitespace-pre-line line-clamp-3">{data.contact}</p>
                  </div>
                  <div className="w-1/2 pl-2 border-l border-white/20">
                     <p className="text-[11px] font-bold uppercase opacity-60 mb-0.5">{t.address[lang]}</p>
                     <p className="text-sm font-mono leading-tight whitespace-pre-line line-clamp-3">{data.address}</p>
                  </div>
               </div>
  
              <div className="w-full bg-white text-blue-600 py-4 px-6 mt-auto flex items-center justify-between shadow-lg">
                 <div className="text-left">
                    <span className="block text-[11px] font-bold uppercase tracking-wider text-blue-400 mb-1">
                      {data.customFields['swiss_affiliation'] || t.affiliation[lang]}
                    </span>
                    <span className="text-2xl font-black tracking-tight uppercase leading-none block">{data.company}</span>
                 </div>
                 <div className="shrink-0">
                    <QRCodeSVG value={data.qrValue} size={48} fgColor="#2563eb" bgColor="transparent" />
                 </div>
              </div>
          </div>
       </div>
    </div>
  );
};

const CreativeBadge = ({ data, lang }: { data: BadgeData, lang: Language }) => {
  const t = BADGE_TRANSLATIONS.creative;
  return (
    <div className="relative w-full h-full bg-white text-gray-900 font-sans flex flex-col p-8 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[60%] -rotate-12 opacity-90 pointer-events-none mix-blend-multiply blur-xl">
           <div className="absolute inset-0 bg-gradient-to-r from-purple-400 via-yellow-300 to-pink-400 rounded-full opacity-80"></div>
        </div>
        
        <div className="relative z-10 flex flex-col h-full">
           
           <div className="mt-12 mb-8">
              <h1 className={`${getAdaptiveSize(data.name, 'text-[4rem]', 'text-5xl', 'text-4xl', 6, 12)} font-semibold tracking-tight leading-[0.9] text-gray-900 break-words line-clamp-2`}>
            {data.name.split(' ').map((n,i) => <span key={i} className="inline-block mr-3">{n}</span>)}
          </h1>
       </div>

       <div className="w-full h-px bg-gray-900 mb-8"></div>

       <div className="space-y-6">
          <div>
             <p className={`${getAdaptiveSize(data.role, 'text-xl', 'text-lg', 'text-base', 15, 25)} font-medium leading-tight uppercase tracking-wide break-words line-clamp-2`}>{data.role}</p>
          </div>
          
          <div className="space-y-4 pt-4">
             <div className="flex items-start gap-3">
                <Phone className="w-5 h-5 mt-0.5 text-gray-400" />
                <div>
                    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">{t.contact[lang]}</p>
                    <p className="text-sm font-mono text-gray-600 whitespace-pre-line leading-tight line-clamp-3">{data.contact}</p>
                </div>
             </div>
             
             <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 mt-0.5 text-gray-400" />
                <div>
                    <p className="text-[11px] font-bold uppercase text-gray-400 tracking-wider mb-0.5">{t.address[lang]}</p>
                    <p className="text-sm font-mono text-gray-600 whitespace-pre-line leading-tight line-clamp-3">{data.address}</p>
                </div>
             </div>
          </div>
       </div>

       <div className="mt-auto bg-indigo-50 rounded-xl p-4 flex items-center justify-between shadow-sm border border-indigo-100">
          <div className="flex items-center gap-3">
             <QRCodeSVG value={data.qrValue} size={40} fgColor="#312e81" bgColor="transparent" />
             <div className="flex flex-col text-xs leading-tight font-mono text-gray-500">
                <span className="block uppercase">ID: {data.id}</span>
                <span className="block">
                  {data.customFields['creative_verified'] || t.verified[lang]}
                </span>
             </div>
          </div>
          <div className="text-right max-w-[120px]">
             <h3 className="font-bold text-xl leading-none tracking-tight text-indigo-900 uppercase break-words line-clamp-2">{data.company}</h3>
          </div>
       </div>
        </div>
    </div>
  );
};

const FormalRedBadge = ({ data, lang }: { data: BadgeData, lang: Language }) => {
  const t = BADGE_TRANSLATIONS.formalRed;
  return (
    <div className="relative w-full h-full bg-[#fcfcfc] text-gray-800 font-sans overflow-hidden flex flex-col shadow-[inset_0_0_20px_rgba(0,0,0,0.05)]">
       <div className="absolute top-0 left-0 w-full h-[32%] overflow-hidden z-0 bg-[#cbb084]">
          <div className="absolute top-0 right-0 w-[80%] h-[120%] bg-[#b93632] rounded-bl-[100%] z-10 shadow-lg"></div>
          <div className="absolute top-[-10%] left-[10%] w-[120%] h-[120%] border border-[#a6302c] rounded-full z-20 opacity-30 pointer-events-none"></div>
           <div className="absolute top-[10%] right-[30%] w-[100%] h-[100%] border border-[#b98e48] rounded-full z-20 opacity-40 pointer-events-none"></div>
           
           <div className="absolute top-6 right-6 z-30 text-white/90 border-2 border-white/50 rounded-full p-1.5 backdrop-blur-sm">
              <Award className="w-5 h-5 text-white" />
           </div>
       </div>
  
       <div className="relative z-10 flex flex-col h-full mt-[32%] px-8 pt-8 pb-6 bg-[#fcfcfc]">
          
          <div className="mb-6 border-b border-gray-200 pb-4">
             <div className="flex items-center gap-3 mb-2">
                 <div className="w-10 h-10 bg-gradient-to-br from-[#b93632] to-[#922b27] rounded shadow-md flex items-center justify-center text-white font-serif font-bold text-xl">
                    {data.company.charAt(0)}
                 </div>
                 <div className="flex flex-col">
                    <h3 className="text-base font-bold text-gray-800 tracking-wide uppercase leading-tight max-w-[180px] line-clamp-2">{data.company}</h3>
                    <p className="text-[10px] text-[#b93632] uppercase tracking-widest font-bold mt-0.5">
                      {data.customFields['formal_anniversary'] || t.anniversary[lang]}
                    </p>
                 </div>
             </div>
          </div>
  
          <div className="mb-auto">
              <h1 className={`${getAdaptiveSize(data.name, 'text-4xl', 'text-3xl', 'text-2xl', 8, 15)} font-serif font-bold text-[#b93632] leading-none mb-3 drop-shadow-sm break-words line-clamp-2`}>
                  {data.name}
              </h1>
               <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#cbb084]/20 rounded text-[#8f7a55] border border-[#cbb084]/30">
                  <span className="text-xs font-bold uppercase tracking-wider">ID: {data.id}</span>
              </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs text-gray-500 mb-6">
               <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block font-bold text-[11px] text-gray-700 mb-0.5 uppercase tracking-wide">{t.contact[lang]}</span>
                  <span className="whitespace-pre-line leading-relaxed text-xs line-clamp-3">{data.contact}</span>
               </div>
               <div className="bg-gray-50 p-2 rounded border border-gray-100">
                  <span className="block font-bold text-[11px] text-gray-700 mb-0.5 uppercase tracking-wide">{t.address[lang]}</span>
                  <span className="whitespace-pre-line leading-relaxed text-xs line-clamp-3">{data.address}</span>
               </div>
          </div>

          <div className="flex items-end justify-between mt-auto">
             <div>
                 <span className="block text-[11px] text-gray-400 uppercase tracking-[0.2em] mb-1 pl-0.5">{t.designation[lang]}</span>
                 <h2 className={`${getAdaptiveSize(data.role, 'text-4xl', 'text-2xl', 'text-xl', 10, 20)} font-black text-[#cbb084] uppercase tracking-tighter leading-none break-words line-clamp-2`}>{data.role}</h2>
             </div>
             <div className="bg-white p-1 rounded border border-gray-100 shadow-sm shrink-0">
                 <QRCodeSVG value={data.qrValue} size={52} fgColor="#b93632" bgColor="#ffffff" />
             </div>
          </div>
  
       </div>
    </div>
  );
};

const MinimalismBadge = ({ data, lang }: { data: BadgeData, lang: Language }) => {
  const t = BADGE_TRANSLATIONS.minimalism;
  return (
    <div className="relative w-full h-full bg-white text-black font-sans flex flex-col p-8 pt-6 overflow-hidden">
       
       <div className="flex justify-between items-start mt-4 mb-auto z-20">
          <p className="font-mono text-xs uppercase tracking-widest text-gray-500 pt-1">
            {data.customFields['minimal_corporate'] || t.corporate[lang]}
          </p>
          
          <div className="bg-white p-1">
               <QRCodeSVG value={data.qrValue} size={48} fgColor="#000" bgColor="transparent" />
          </div>
       </div>
  
       <div className="mb-16 z-10 relative">
          <div className="inline-block bg-gray-100 rounded-full px-3 py-1 mb-6">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">ID: {data.id}</p>
          </div>
          <h1 className={`${getAdaptiveSize(data.name, 'text-[4.5rem]', 'text-5xl', 'text-4xl', 6, 12)} font-bold tracking-tighter leading-[0.85] text-black mb-3 break-words line-clamp-2`}>
              {data.name.split(' ').map((n, i) => <span key={i} className="inline-block mr-4">{n}</span>)}
          </h1>
          <p className={`${getAdaptiveSize(data.role, 'text-base', 'text-sm', 'text-xs', 25, 35)} font-medium uppercase tracking-[0.2em] text-gray-400 mt-2 break-words line-clamp-2`}>{data.role}</p>
       </div>

       <div className="w-full border-t-2 border-gray-100 pt-6 pb-2 relative z-10 bg-white">
          <div className="flex justify-between items-end">
              <div className="max-w-[50%]">
                   <p className="text-[11px] font-bold uppercase tracking-wider text-gray-400 mb-1">{t.location[lang]}</p>
                   <p className="text-sm font-medium uppercase leading-tight text-gray-800 line-clamp-2">{data.address}</p>
              </div>
              <div className="text-right max-w-[50%]">
                   <p className="text-[11px] font-bold uppercase tracking-wider text-[#ea580c] mb-1">{t.contact[lang]}</p>
                   <p className="text-sm font-medium uppercase leading-tight text-gray-800 break-words line-clamp-2">{data.contact.split('\n')[0]}</p>
              </div>
          </div>
       </div>
    </div>
  );
};

export const BadgePreview = ({ theme, isActive }: { theme: BadgeTheme; isActive: boolean }) => {
  return (
    <div className={`w-full h-24 rounded-lg overflow-hidden relative shadow-sm transition-all duration-300 ${isActive ? 'ring-2 ring-white scale-[1.02]' : 'opacity-70 grayscale hover:grayscale-0 hover:opacity-100'}`}>
       {theme === 'industrial' && (
         <div className="w-full h-full bg-[#0a0a0a] flex flex-col p-3 relative">
            <div className="absolute inset-0 bg-white/5 noise-bg"></div>
            <div className="w-6 h-6 rounded-full bg-white/10 mb-2 flex items-center justify-center border border-white/20">
               <Aperture className="w-3 h-3 text-white/50" />
            </div>
            <div className="h-1 w-1/2 bg-white/20 rounded mb-1"></div>
            <div className="h-1 w-1/3 bg-white/10 rounded"></div>
         </div>
       )}
       {theme === 'modern' && (
         <div className="w-full h-full bg-gradient-to-br from-blue-950 to-slate-900 flex flex-col p-3 border-t-2 border-blue-400">
            <div className="flex justify-between mb-2 opacity-50">
              <div className="h-0.5 w-4 bg-white"></div>
              <div className="h-0.5 w-4 bg-white"></div>
            </div>
            <div className="mt-auto">
              <div className="h-3 w-3/4 bg-gradient-to-r from-white to-blue-400/50 rounded-sm mb-1"></div>
              <div className="h-1.5 w-1/2 bg-blue-500/30 rounded-sm"></div>
            </div>
         </div>
       )}
       {theme === 'swiss' && (
         <div className="w-full h-full bg-[#3b82f6] flex flex-col items-center justify-center p-2 relative">
            <div className="absolute top-1 left-1 w-1 h-1 bg-white"></div>
            <div className="absolute top-1 right-1 w-1 h-1 bg-white"></div>
            <div className="absolute bottom-1 left-1 w-1 h-1 bg-white"></div>
            <div className="absolute bottom-1 right-1 w-1 h-1 bg-white"></div>
            <div className="text-[8px] font-black text-white leading-none tracking-tighter text-center">
               WORK<br/>PERMIT
            </div>
         </div>
       )}
       {theme === 'creative' && (
         <div className="w-full h-full bg-white flex flex-col p-3 relative overflow-hidden">
             <div className="absolute -right-4 -top-4 w-16 h-16 bg-gradient-to-r from-purple-300 to-pink-300 blur-xl opacity-60 rounded-full"></div>
             <div className="mt-auto z-10">
               <div className="h-2 w-2/3 bg-gray-900 rounded-sm mb-1"></div>
               <div className="h-2 w-1/2 bg-gray-900 rounded-sm"></div>
             </div>
         </div>
       )}
       {theme === 'formal-red' && (
         <div className="w-full h-full bg-[#fcfcfc] flex flex-col relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-[40%] bg-[#cbb084]">
                <div className="absolute top-0 right-0 w-[80%] h-[150%] bg-[#b93632] rounded-bl-[100%]"></div>
             </div>
             <div className="mt-auto p-3 z-10">
               <div className="h-2 w-1/2 bg-[#b93632] rounded-sm mb-1"></div>
               <div className="h-1.5 w-1/3 bg-[#cbb084] rounded-sm"></div>
             </div>
         </div>
       )}
       {theme === 'minimalism' && (
         <div className="w-full h-full bg-white flex flex-col p-3 relative border border-gray-200">
             <div className="flex justify-between items-start mb-auto">
                 <div className="text-[6px] uppercase font-mono text-gray-500">CORP ©</div>
                 <div className="w-4 h-4 bg-black/10"></div>
             </div>
             <div className="mt-auto mb-2">
                 <div className="w-8 h-1.5 bg-gray-100 rounded-full mb-1"></div>
                 <div className="h-3 w-3/4 bg-black rounded-sm mb-0.5"></div>
                 <div className="h-3 w-1/2 bg-black rounded-sm"></div>
             </div>
             <div className="w-full h-px bg-gray-100 mt-1"></div>
         </div>
       )}
    </div>
  );
}


// --- MAIN BADGE COMPONENT ---

export const Badge: React.FC<BadgeProps> = ({ data, theme, language, uniqueId = 'main' }) => {
  
  const renderBadgeContent = () => {
    switch(theme) {
      case 'modern': return <ModernBadge data={data} lang={language} />;
      case 'swiss': return <SwissBadge data={data} lang={language} uniqueId={uniqueId} />;
      case 'creative': return <CreativeBadge data={data} lang={language} />;
      case 'formal-red': return <FormalRedBadge data={data} lang={language} />;
      case 'minimalism': return <MinimalismBadge data={data} lang={language} />;
      case 'industrial':
      default: return <IndustrialBadge data={data} lang={language} uniqueId={uniqueId} />;
    }
  };

  const isLightTheme = ['creative', 'formal-red', 'minimalism'].includes(theme);
  const isExport = uniqueId.includes('export');
  
  // Use transparent/none border for light themes or exports to avoid black stroke artifact
  const containerStyle = (isLightTheme || isExport)
    ? "bg-white border-none" 
    : "bg-black border-white/5";

  return (
    <div className={`relative w-[340px] h-[580px] rounded-xl shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden transform-gpu border ${containerStyle}`}>
      {/* Shared physical slot hole - aligned with lanyard */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 w-16 h-2 rounded-full bg-[#111] shadow-[inset_0_1px_3px_rgba(0,0,0,0.8)] z-50 border border-white/10 flex items-center justify-center">
      </div>

      {renderBadgeContent()}
      
      {!isExport && (
        <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent pointer-events-none z-40 rounded-xl mix-blend-overlay"></div>
      )}
    </div>
  );
};
