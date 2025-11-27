import React from 'react';

interface NoiseTextureProps {
  id?: string;
}

export const NoiseTexture = ({ id = 'noiseFilter' }: NoiseTextureProps) => (
  <div className="absolute inset-0 pointer-events-none z-0 opacity-20 mix-blend-overlay overflow-hidden rounded-xl">
    <div className="w-[200%] h-[200%] bg-repeat animate-grain" 
         style={{
           backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='${id}'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23${id})' opacity='1'/%3E%3C/svg%3E")`,
           backgroundSize: '128px 128px'
         }} 
    />
  </div>
);