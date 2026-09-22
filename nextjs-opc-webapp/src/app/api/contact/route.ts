import { NextResponse, type NextRequest } from 'next/server';
import { contactFormSchema } from '@/lib/validators';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = contactFormSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Datos de formulario inválidos', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { name, email, subject, message, honeypot } = result.data;

    // Check honeypot for anti-bot protection
    if (honeypot && honeypot.length > 0) {
      return NextResponse.json({ success: true, message: 'Recibido' });
    }

    // Insert into Supabase database
    try {
      const supabase = createAdminClient();
      await supabase.from('contact_leads').insert({
        name,
        email,
        subject: subject || 'Consulta general',
        message,
        status: 'new',
        source: 'landing_contact_form',
      });
    } catch (dbError) {
      // In local demo mode without live DB, we gracefully acknowledge
      console.warn('Advertencia DB (modo local):', dbError);
    }

    return NextResponse.json({
      success: true,
      message: 'Mensaje recibido con éxito. Nos pondremos en contacto pronto.',
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error en el servidor al enviar el mensaje' },
      { status: 500 }
    );
  }
}
