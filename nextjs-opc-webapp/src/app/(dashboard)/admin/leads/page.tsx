'use client';

import React, { useState, useEffect } from 'react';
import { Mail, Clock, CheckCircle2, Inbox, MessageSquare, AlertCircle } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { createClient } from '@/lib/supabase/client';
import { formatDateTime } from '@/lib/utils';
import { type ContactLead } from '@/types';

export default function AdminLeadsPage() {
  const [leads, setLeads] = useState<ContactLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLead, setSelectedLead] = useState<ContactLead | null>(null);

  const fetchLeads = async () => {
    setLoading(true);
    try {
      const supabase = createClient();
      const { data } = await supabase
        .from('contact_leads')
        .select('*')
        .order('created_at', { ascending: false });

      if (data && data.length > 0) {
        setLeads(data);
      } else {
        // Fallback demo leads
        setLeads([
          {
            id: 'l-1',
            name: 'Li Wei Trading Corp',
            email: 'procurement@liweitrading.cn',
            subject: 'Cotización Pet Coke cargamento 50.000 MT',
            message: 'Solicitamos cotización CIF puerto de Qingdao para 50.000 MT de coque de petróleo verde (especificación PC-4500) con entrega estimada en noviembre.',
            status: 'new',
            source: 'web_contact_form',
            created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
            updated_at: new Date().toISOString(),
          },
          {
            id: 'l-2',
            name: 'Mediterranean Bunkering Ltd',
            email: 'trading@medbunker.gr',
            subject: 'Suministro Fuel Oil HSFO 380 CST',
            message: 'Interesados en programar entregas mensuales de HSFO 380 CST en terminales de Gibraltar / Algeciras. Rogamos remitir ficha de especificaciones y procedimiento KYC.',
            status: 'contacted',
            source: 'web_contact_form',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            updated_at: new Date().toISOString(),
          },
        ]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, []);

  const handleUpdateStatus = async (id: string, newStatus: any) => {
    try {
      const supabase = createClient();
      await supabase.from('contact_leads').update({ status: newStatus }).eq('id', id);
    } catch (e) {}
    setLeads((prev) =>
      prev.map((l) => (l.id === id ? { ...l, status: newStatus } : l))
    );
    if (selectedLead && selectedLead.id === id) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="pb-6 border-b border-border">
        <Badge variant="accent">COMUNICACIONES ENTRANTES</Badge>
        <h1 className="font-heading font-extrabold text-2xl text-text mt-1">
          Bandeja de Contactos & Leads
        </h1>
        <p className="text-xs text-text-muted">
          Consultas comerciales y solicitudes de cotización remitidas desde la landing.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left: Leads List */}
        <div className="lg:col-span-6 space-y-3">
          {loading ? (
            <div className="p-12 text-center text-xs text-text-muted">
              Cargando mensajes...
            </div>
          ) : leads.length === 0 ? (
            <div className="p-12 text-center space-y-2 border border-border rounded-xl bg-card">
              <Inbox className="w-10 h-10 text-border mx-auto" />
              <p className="text-sm font-semibold text-text">No hay mensajes aún</p>
              <p className="text-xs text-text-muted">Las solicitudes de la landing aparecerán aquí automáticamente.</p>
            </div>
          ) : (
            leads.map((lead) => {
              const isSelected = selectedLead?.id === lead.id;

              return (
                <Card
                  key={lead.id}
                  onClick={() => setSelectedLead(lead)}
                  className={`p-4 cursor-pointer transition-all duration-200 hover:border-accent/60 ${
                    isSelected ? 'border-accent bg-surf/90 shadow-glow-accent/10' : 'bg-card'
                  }`}
                >
                  <div className="flex items-center justify-between pb-2">
                    <span className="font-heading font-semibold text-sm text-text">
                      {lead.name}
                    </span>
                    <Badge
                      variant={
                        lead.status === 'new'
                          ? 'neon'
                          : lead.status === 'contacted'
                          ? 'warm'
                          : 'default'
                      }
                    >
                      {lead.status === 'new' ? 'Nuevo' : lead.status === 'contacted' ? 'Contactado' : lead.status}
                    </Badge>
                  </div>

                  <p className="text-xs text-accent font-medium truncate">
                    {lead.subject || 'Sin asunto'}
                  </p>

                  <p className="text-xs text-text-muted line-clamp-2 mt-1">
                    {lead.message}
                  </p>

                  <div className="pt-3 mt-2 border-t border-border/50 flex items-center justify-between text-[11px] font-mono text-text-subtle">
                    <span>{lead.email}</span>
                    <span>{formatDateTime(lead.created_at)}</span>
                  </div>
                </Card>
              );
            })
          )}
        </div>

        {/* Right: Lead Details */}
        <div className="lg:col-span-6">
          {selectedLead ? (
            <Card className="p-6 bg-card space-y-6">
              <div className="flex items-start justify-between border-b border-border pb-4">
                <div>
                  <h3 className="font-heading font-bold text-lg text-text">
                    {selectedLead.name}
                  </h3>
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="text-xs text-accent hover:underline flex items-center gap-1.5 mt-0.5"
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedLead.email}</span>
                  </a>
                </div>

                <div>
                  <select
                    value={selectedLead.status}
                    onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                    className="bg-surf border border-border text-text rounded px-2.5 py-1 text-xs font-mono focus:border-accent focus:outline-none"
                  >
                    <option value="new">Nuevo</option>
                    <option value="contacted">Contactado</option>
                    <option value="qualified">Calificado</option>
                    <option value="closed">Cerrado</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider font-mono text-text-subtle">
                  Asunto
                </div>
                <div className="text-sm font-semibold text-text">
                  {selectedLead.subject || 'Consulta comercial general'}
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-[11px] uppercase tracking-wider font-mono text-text-subtle">
                  Mensaje Completo
                </div>
                <div className="p-4 rounded-xl bg-surf border border-border text-sm text-text leading-relaxed whitespace-pre-wrap">
                  {selectedLead.message}
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between text-xs text-text-muted font-mono">
                <span>Recibido: {formatDateTime(selectedLead.created_at)}</span>
                <a
                  href={`mailto:${selectedLead.email}?subject=Re: ${encodeURIComponent(
                    selectedLead.subject || 'Invest Oil LLC'
                  )}`}
                >
                  <Button variant="accent" size="sm">
                    Responder por Email
                  </Button>
                </a>
              </div>
            </Card>
          ) : (
            <div className="p-16 text-center border border-border rounded-xl bg-card space-y-2 text-text-muted">
              <MessageSquare className="w-10 h-10 text-border mx-auto" />
              <p className="text-sm font-medium">Selecciona un mensaje para ver los detalles</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
