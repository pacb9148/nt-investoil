import { NextResponse, type NextRequest } from 'next/server';
import { companyRatingSchema } from '@/lib/validators';
import { getCompanyRatings, saveCompanyRating } from '@/lib/db/db-service';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const ratings = await getCompanyRatings();
    return NextResponse.json(ratings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Error al leer las valoraciones' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const result = companyRatingSchema.safeParse(json);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Valoración inválida', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { what_we_do, how_we_do_it, results, comment, name, email } = result.data;

    const rating = await saveCompanyRating({
      what_we_do,
      how_we_do_it,
      results,
      comment: comment || null,
      name: name || null,
      email: email || null,
    });

    return NextResponse.json({ success: true, rating });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Error en el servidor al guardar la valoración' },
      { status: 500 }
    );
  }
}
