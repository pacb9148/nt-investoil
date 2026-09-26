'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { MapPin, User } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TEAM_MEMBERS } from '@/lib/constants/investoil';
import type { TeamMember } from '@/types';

export function TeamSection({
  customBg,
  initialMembers,
}: {
  customBg?: string;
  initialMembers?: TeamMember[];
}) {
  const [team, setTeam] = useState<TeamMember[]>(
    initialMembers && initialMembers.length > 0 ? initialMembers : TEAM_MEMBERS
  );
  const [imgErrors, setImgErrors] = useState<Record<string, boolean>>({});

  useEffect(() => {
    // Si no vinieron initialMembers del servidor, cargar desde API
    if (!initialMembers || initialMembers.length === 0) {
      fetch('/api/content/team')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setTeam(data);
          }
        })
        .catch(() => {});
    }

    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<TeamMember[]>;
      if (Array.isArray(customEvent.detail)) {
        setTeam(customEvent.detail);
      }
    };

    window.addEventListener('investoil_team_updated', handleUpdate);
    return () => window.removeEventListener('investoil_team_updated', handleUpdate);
  }, [initialMembers]);

  return (
    <section
      id="team"
      className="py-24 border-t border-border/80 relative transition-colors duration-300"
      style={{ backgroundColor: customBg || undefined }}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent">LIDERAZGO & EXPERIENCIA</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Nuestro Equipo
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Un equipo multidisciplinar con amplia trayectoria en trading energético, mitigación de riesgos, logística marítima y cumplimiento normativo internacional.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {team.map((member) => (
            <Card
              key={member.id}
              className="group overflow-hidden transition-all duration-300 hover:border-accent/50 hover:shadow-glow-accent/20"
            >
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-accent px-2 py-0.5 rounded bg-accent/10 border border-accent/20">
                    {member.number}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-text-muted font-mono">
                    <MapPin className="w-3.5 h-3.5 text-warm" />
                    <span>{member.location}</span>
                  </span>
                </div>

                <div className="flex items-center gap-4 pt-1">
                  <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border group-hover:border-accent transition-colors shrink-0 bg-card flex items-center justify-center">
                    {member.image && !imgErrors[member.id] ? (
                      <Image
                        src={member.image}
                        alt={member.name}
                        fill
                        className="object-cover"
                        sizes="64px"
                        unoptimized
                        onError={() => setImgErrors((prev) => ({ ...prev, [member.id]: true }))}
                      />
                    ) : (
                      <User className="w-8 h-8 text-text-subtle" />
                    )}
                  </div>
                  <div>
                    <h3 className="font-heading font-bold text-base text-text group-hover:text-accent transition-colors">
                      {member.name}
                    </h3>
                    <p className="text-xs text-text-muted font-medium mt-0.5">
                      {member.role}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
