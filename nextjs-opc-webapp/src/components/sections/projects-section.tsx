import React from 'react';
import { CheckCircle, Award, Calendar, Building2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { FEATURED_OPERATIONS } from '@/lib/constants/investoil';

export function ProjectsSection() {
  return (
    <section id="projects" className="py-24 border-t border-border bg-bg relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <Badge variant="accent">HISTORIAL COMPROBADO</Badge>
          <h2 className="font-heading font-extrabold text-3xl sm:text-4xl text-text">
            Operaciones Destacadas
          </h2>
          <p className="text-base text-text-muted leading-relaxed">
            Una muestra de transacciones recientes que demuestran nuestra capacidad de ejecución logística, solidez financiera y cumplimiento estricto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {FEATURED_OPERATIONS.map((op, idx) => (
            <Card
              key={idx}
              className="relative overflow-hidden group hover:border-accent/50 transition-all duration-300"
            >
              <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-accent to-warm opacity-70 group-hover:opacity-100 transition-opacity" />

              <CardHeader className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-accent" />
                    <span>Año {op.year}</span>
                  </span>
                  <span className="font-mono text-xs text-text-muted flex items-center gap-1.5">
                    <Building2 className="w-3.5 h-3.5 text-warm" />
                    <span>{op.client}</span>
                  </span>
                </div>
                <CardTitle className="text-xl group-hover:text-accent transition-colors">
                  {op.title}
                </CardTitle>
              </CardHeader>

              <CardContent className="space-y-4">
                <p className="text-sm text-text-muted leading-relaxed">
                  {op.description}
                </p>

                <div className="p-3 rounded-lg bg-surf/80 border border-border/80 flex items-center gap-3">
                  <Award className="w-5 h-5 text-accent shrink-0" />
                  <div>
                    <div className="text-[11px] uppercase tracking-wider text-text-subtle font-mono">
                      Resultado verificado
                    </div>
                    <div className="text-sm font-semibold text-text">
                      {op.result}
                    </div>
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
