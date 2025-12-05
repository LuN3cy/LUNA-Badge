import React, { useRef, useEffect, useState, useCallback } from 'react';

interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

interface CircularColorPickerProps {
  color: string;
  onChange: (color: string) => void;
  className?: string;
}

// Helper: HEX to HSV
const hexToHsv = (hex: string): HSV => {
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt("0x" + hex[1] + hex[1]);
    g = parseInt("0x" + hex[2] + hex[2]);
    b = parseInt("0x" + hex[3] + hex[3]);
  } else if (hex.length === 7) {
    r = parseInt("0x" + hex[1] + hex[2]);
    g = parseInt("0x" + hex[3] + hex[4]);
    b = parseInt("0x" + hex[5] + hex[6]);
  }
  r /= 255;
  g /= 255;
  b /= 255;

  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0, v = max;
  const d = max - min;
  s = max === 0 ? 0 : d / max;

  if (max === min) {
    h = 0;
  } else {
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    h /= 6;
  }

  return { h: h * 360, s: s * 100, v: v * 100 };
};

// Helper: HSV to HEX
const hsvToHex = (h: number, s: number, v: number): string => {
  let r = 0, g = 0, b = 0;
  const i = Math.floor(h / 60);
  const f = h / 60 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  
  // s and v are 0-1 here for calculation, passed as 0-100
  const sDec = s / 100;
  const vDec = v / 100;
  
  const p2 = vDec * (1 - sDec);
  const q2 = vDec * (1 - f * sDec);
  const t2 = vDec * (1 - (1 - f) * sDec);
  
  switch (i % 6) {
    case 0: r = vDec; g = t2; b = p2; break;
    case 1: r = q2; g = vDec; b = p2; break;
    case 2: r = p2; g = vDec; b = t2; break;
    case 3: r = p2; g = q2; b = vDec; break;
    case 4: r = t2; g = p2; b = vDec; break;
    case 5: r = vDec; g = p2; b = q2; break;
  }

  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? "0" + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

export const CircularColorPicker: React.FC<CircularColorPickerProps> = ({ color, onChange, className }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDraggingRef = useRef(false);
  const size = 200;
  const center = size / 2;
  const radius = size / 2 - 10; // Padding

  // Draw the color wheel
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear
    ctx.clearRect(0, 0, size, size);

    // Draw Color Wheel
    for (let angle = 0; angle < 360; angle++) {
      const startAngle = (angle - 1) * Math.PI / 180;
      const endAngle = (angle + 1) * Math.PI / 180;
      
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      
      // Create gradient for this slice: White (Center) -> Color (Edge)
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }, []);

  // Handle Mouse/Touch interactions
  const handleInteraction = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left - center;
    const y = clientY - rect.top - center;
    
    // Calculate Angle (Hue)
    let angle = Math.atan2(y, x) * (180 / Math.PI);
    if (angle < 0) angle += 360;
    
    // Calculate Distance (Saturation)
    const dist = Math.sqrt(x * x + y * y);
    const maxDist = radius;
    let saturation = Math.min(dist / maxDist, 1) * 100;
    
    // Update Color
    // We assume V=100 for this picker as requested (Color Overlay usually implies full brightness)
    const newColor = hsvToHex(angle, saturation, 100);
    onChange(newColor);
  }, [onChange, radius, center]);

  const onMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    handleInteraction(e.clientX, e.clientY);
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (isDraggingRef.current) {
      handleInteraction(e.clientX, e.clientY);
    }
  };

  const onMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Global mouse up to catch drag release outside canvas
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      isDraggingRef.current = false;
    };
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => window.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // Draw Selection Marker
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Re-draw logic needed? 
    // The gradient doesn't change, but the marker does.
    // To avoid redrawing the expensive gradient every frame, maybe use two canvases?
    // Or just redraw. 360 slices is not THAT expensive.
    // Optimization: Draw wheel once to an offscreen canvas or use an image.
    // For simplicity in this turn, I'll redraw. It's 360 paths.
    
    // ... Copy draw code ...
    ctx.clearRect(0, 0, size, size);
    for (let angle = 0; angle < 360; angle+=1) { // step 2 for perf?
      const startAngle = (angle - 0.5) * Math.PI / 180;
      const endAngle = (angle + 1.5) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.arc(center, center, radius, startAngle, endAngle);
      ctx.closePath();
      const gradient = ctx.createRadialGradient(center, center, 0, center, center, radius);
      gradient.addColorStop(0, '#ffffff');
      gradient.addColorStop(1, `hsl(${angle}, 100%, 50%)`);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Draw Marker
    const hsv = hexToHsv(color);
    const angleRad = hsv.h * Math.PI / 180;
    const dist = (hsv.s / 100) * radius;
    const markerX = center + Math.cos(angleRad) * dist;
    const markerY = center + Math.sin(angleRad) * dist;

    ctx.beginPath();
    ctx.arc(markerX, markerY, 6, 0, 2 * Math.PI);
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.closePath();

    // Draw black outline for contrast if color is light
    ctx.beginPath();
    ctx.arc(markerX, markerY, 7, 0, 2 * Math.PI);
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.closePath();

  }, [color]); // Redraw when color changes

  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      <canvas 
        ref={canvasRef}
        width={size}
        height={size}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        className="cursor-crosshair rounded-full shadow-xl"
      />
    </div>
  );
};
