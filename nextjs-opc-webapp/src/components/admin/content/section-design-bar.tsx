'use client';

import React, { useState, useEffect } from 'react';
import { Palette, Check, RefreshCw, Loader2 } from 'lucide-react';

const PRESET_COLORS = [
  { name: 'Obsidiana Base', hex: '#030508' },
  { name: 'Azul Marino Petrolero', hex: '#070d18' },
  { name: 'Grafito Carbón', hex: '#0a0f1d' },
  { name: 'Pizarra Siderúrgica', hex: '#0d1527' },
  { name: 'Negro Puro', hex: '#000000' },
  { name: 'Ámbar Oscuro', hex: '#1c1507' },
];

interface SectionDesignBarProps {
  sectionId: string;
  sectionName: string;
  defaultBgColor?: string;
  onColorChange?: (color: string) => void;
}

export function SectionDesignBar({
  sectionId,
  sectionName,
  defaultBgColor,
  onColorChange,
}: SectionDesignBarProps) {
  const [color, setColor] = useState<string>(defaultBgColor || '#07090e');
  const [saving, setSaving] = useState<boolean>(false);
  const [saved, setSaved] = useState<boolean>(false);

  useEffect(() => {
    // Cargar el color actual de la sección desde la API
    fetch('/api/content/appearance')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.section_bg_colors?.[sectionId]) {
          setColor(data.section_bg_colors[sectionId]);
        }
      })
      .catch(() => {});
  }, [sectionId]);

  const handleColorUpdate = (newColor: string) => {
    setColor(newColor);
    if (onColorChange) {
      onColorChange(newColor);
    }
  };

  const handleSaveColor = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/content/appearance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId,
          bgColor: color,
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (e) {
      console.error('Error al guardar color de sección:', e);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-card/90 via-surf/90 to-card/90 p-4 shadow-md backdrop-blur-md space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-accent/15 border border-accent/30 text-accent">
            <Palette className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-text font-heading flex items-center gap-2">
              <span>Diseño & Color de Fondo de la Sección ({sectionName})</span>
              <span className="text-[10px] font-mono text-accent bg-accent/10 px-2 py-0.5 rounded border border-accent/20">
                ColorPicker Integrado
              </span>
            </h4>
            <p className="text-[11px] text-text-muted">
              Personaliza el fondo de esta sección con previsualización y guardado inmediato.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            onClick={handleSaveColor}
            disabled={saving}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all duration-200 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : saved ? (
              <>
                <Check className="w-3.5 h-3.5 text-bg" />
                <span>¡Color Guardado!</span>
              </>
            ) : (
              <>
                <span>Guardar Color</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color.startsWith('#') ? color : '#07090e'}
            onChange={(e) => handleColorUpdate(e.target.value)}
            className="w-8 h-8 rounded-lg border border-border bg-transparent cursor-pointer p-0.5"
            title="Seleccionar color con cuentagotas/paleta"
          />
          <input
            type="text"
            value={color}
            onChange={(e) => handleColorUpdate(e.target.value)}
            placeholder="#07090e"
            className="w-28 rounded-lg bg-card/80 border border-border px-2.5 py-1.5 text-xs font-mono text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div className="h-4 w-px bg-border/60 hidden sm:block" />

        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-mono text-text-subtle uppercase mr-1">Paletas:</span>
          {PRESET_COLORS.map((preset) => (
            <button
              key={preset.hex}
              type="button"
              onClick={() => handleColorUpdate(preset.hex)}
              className={`px-2 py-1 rounded text-[10px] font-mono border transition-all flex items-center gap-1 ${
                color.toLowerCase() === preset.hex.toLowerCase()
                  ? 'border-accent bg-accent/20 text-accent font-bold scale-105'
                  : 'border-border/60 bg-card/60 text-text-muted hover:text-text hover:border-accent/40'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full border border-white/20 shrink-0"
                style={{ backgroundColor: preset.hex }}
              />
              <span>{preset.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
