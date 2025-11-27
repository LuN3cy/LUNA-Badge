import React from 'react';

// The Lanyard is now a purely visual component. 
// It relies on the parent "Rig" in App.tsx for the swing animation.
// This ensures it moves in perfect synchronization with the Badge.
export const Lanyard = () => {
  return (
    <div className="w-full h-[40vh] flex justify-center">
        {/* 
          Inner Wrapper for Strap & Hook.
          The parent controls the movement.
        */}
        <div className="relative w-16 h-full">
            {/* The Strap */}
            <div className="w-full h-full bg-[#1a1a1a] shadow-2xl relative overflow-hidden border-x border-white/5 mx-auto">
                {/* Fabric Texture Pattern */}
                <div className="absolute inset-0 opacity-20" 
                    style={{
                        backgroundImage: `repeating-linear-gradient(45deg, transparent, transparent 2px, #000 2px, #000 4px)`
                    }}>
                </div>
                {/* Stitching effect */}
                <div className="absolute top-0 bottom-0 left-1 w-0.5 border-r border-dashed border-white/20"></div>
                <div className="absolute top-0 bottom-0 right-1 w-0.5 border-l border-dashed border-white/20"></div>
                
                {/* Branding/Text on Strap */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap">
                    <span className="text-[10px] font-black tracking-[0.5em] text-white/10 select-none">
                        INTERNET DEVELOPMENT STUDIO // ACCESS GRANTED // 2024
                    </span>
                </div>
            </div>
            
            {/* The Metal Clasp / Loop Mechanism */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full flex flex-col items-center w-full">
                {/* Metal housing crimp */}
                <div className="w-full h-8 bg-gradient-to-b from-neutral-700 to-neutral-900 rounded-sm border border-white/10 shadow-lg relative z-20">
                    <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-black/50"></div>
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-black/50"></div>
                </div>

                {/* Simple Hook/Clip */}
                <div className="w-8 h-10 -mt-2 border-4 border-neutral-400 rounded-b-full rounded-t-none border-t-0 z-0"></div>
            </div>
        </div>
    </div>
  );
};