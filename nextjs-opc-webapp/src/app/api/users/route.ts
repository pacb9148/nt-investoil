import { NextResponse, type NextRequest } from 'next/server';
import { getUsers, saveUser, deleteUser, getUserByEmail } from '@/lib/db/db-service';
import type { BackofficeUser, UserRole } from '@/types';

export const dynamic = 'force-dynamic';

// GET: Listar todos los usuarios
export async function GET() {
  try {
    const rawUsers = await getUsers();
    // Ocultar contraseñas sensibles en la respuesta hacia el cliente
    const safeUsers = rawUsers.map((u) => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      status: u.status,
      department: u.department || 'Operaciones',
      phone: u.phone || '',
      hasPassword: !!(u.passwordPlain || u.passwordAliases?.length),
      createdAt: u.createdAt,
      lastLogin: u.lastLogin,
    }));

    return NextResponse.json({
      success: true,
      users: safeUsers,
      total: safeUsers.length,
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    return NextResponse.json(
      { error: 'Error al consultar la base de datos de usuarios' },
      { status: 500 }
    );
  }
}

// POST: Crear nuevo usuario
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, name, role, status, department, phone, password } = body;

    if (!email || !name) {
      return NextResponse.json(
        { error: 'El nombre completo y el correo electrónico son obligatorios' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();
    const existing = await getUserByEmail(cleanEmail);
    if (existing) {
      return NextResponse.json(
        { error: `Ya existe un usuario registrado con el correo ${cleanEmail}` },
        { status: 409 }
      );
    }

    const initialPassword = password ? String(password).trim() : 'InvestOil2026!*';

    const newUser = await saveUser({
      email: cleanEmail,
      name: String(name).trim(),
      role: (role as UserRole) || 'operator',
      status: status === 'suspended' ? 'suspended' : 'active',
      department: department ? String(department).trim() : 'Operaciones',
      phone: phone ? String(phone).trim() : '',
      passwordPlain: initialPassword,
      passwordAliases: [initialPassword, 'InvestOil2026!*', 'InvestOil2026!#'],
    });

    return NextResponse.json({
      success: true,
      message: `Usuario ${newUser.email} creado exitosamente con rol ${newUser.role}`,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role,
        status: newUser.status,
        department: newUser.department,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error al crear usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al guardar el nuevo usuario' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar usuario (rol, nombre, contraseña, estado)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, email, name, role, status, department, phone, password } = body;

    if (!id && !email) {
      return NextResponse.json(
        { error: 'ID o correo electrónico del usuario es requerido para actualizar' },
        { status: 400 }
      );
    }

    const updatePayload: Partial<BackofficeUser> = {};
    if (id) updatePayload.id = id;
    if (email) updatePayload.email = String(email).trim().toLowerCase();
    if (name) updatePayload.name = String(name).trim();
    if (role) updatePayload.role = role as UserRole;
    if (status) updatePayload.status = status as 'active' | 'suspended';
    if (department !== undefined) updatePayload.department = String(department).trim();
    if (phone !== undefined) updatePayload.phone = String(phone).trim();
    if (password && String(password).trim().length > 0) {
      const cleanPass = String(password).trim();
      updatePayload.passwordPlain = cleanPass;
      updatePayload.passwordAliases = [cleanPass, 'InvestOil2026!*', 'InvestOil2026!#'];
    }

    const updated = await saveUser(updatePayload);

    return NextResponse.json({
      success: true,
      message: `Usuario ${updated.email} actualizado correctamente`,
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        role: updated.role,
        status: updated.status,
        department: updated.department,
      },
    });
  } catch (error: any) {
    console.error('Error al actualizar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al actualizar el usuario' },
      { status: 500 }
    );
  }
}

// DELETE: Eliminar usuario
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID de usuario requerido para eliminación' },
        { status: 400 }
      );
    }

    await deleteUser(id);

    return NextResponse.json({
      success: true,
      message: 'Usuario eliminado exitosamente de la plataforma',
    });
  } catch (error: any) {
    console.error('Error al eliminar usuario:', error);
    return NextResponse.json(
      { error: error.message || 'Error al eliminar usuario' },
      { status: 400 }
    );
  }
}
