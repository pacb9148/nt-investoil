'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  UserPlus,
  ShieldCheck,
  ShieldAlert,
  Key,
  Trash2,
  Edit2,
  CheckCircle2,
  AlertCircle,
  Search,
  Lock,
  Mail,
  User,
  Phone,
  Building,
  RefreshCw,
  Loader2,
  X,
  Check,
  BadgeCheck,
} from 'lucide-react';
import type { UserRole } from '@/types';

interface SafeUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  status: 'active' | 'suspended';
  department: string;
  phone: string;
  hasPassword: boolean;
  createdAt: string;
  lastLogin?: string | null;
}

const ROLE_LABELS: Record<string, { label: string; color: string; desc: string }> = {
  superadmin: {
    label: 'Superadministrador',
    color: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
    desc: 'Acceso total sin restricciones',
  },
  admin: {
    label: 'Administrador',
    color: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
    desc: 'Gestión editorial y de plataforma',
  },
  compliance_kyc: {
    label: 'Cumplimiento & KYC',
    color: 'bg-purple-500/15 text-purple-400 border-purple-500/30',
    desc: 'Verificación de contrapartes y contratos',
  },
  operator: {
    label: 'Operador Comercial',
    color: 'bg-blue-500/15 text-blue-400 border-blue-500/30',
    desc: 'Operaciones comerciales y despachos',
  },
  editor: {
    label: 'Editor de Contenido',
    color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
    desc: 'Edición de artículos y medios',
  },
  viewer: {
    label: 'Visualizador',
    color: 'bg-slate-500/15 text-slate-400 border-slate-500/30',
    desc: 'Solo lectura de reportes',
  },
};

const INPUT_CLASS =
  'w-full rounded-lg bg-card/80 border border-border px-3.5 py-2 text-xs text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/40 transition-colors';
const LABEL_CLASS = 'block text-[11px] font-mono uppercase tracking-wider text-text-muted mb-1';

export default function UsersAdminPage() {
  const [users, setUsers] = useState<SafeUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modales
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<SafeUser | null>(null);
  const [passwordModalUser, setPasswordModalUser] = useState<SafeUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Formulario nuevo usuario
  const [formEmail, setFormEmail] = useState('');
  const [formName, setFormName] = useState('');
  const [formRole, setFormRole] = useState<UserRole>('operator');
  const [formDepartment, setFormDepartment] = useState('Operaciones & Trading');
  const [formPhone, setFormPhone] = useState('');
  const [formPassword, setFormPassword] = useState('InvestOil2026!*');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (data.users) {
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
      notify('error', 'Error al cargar la lista de usuarios');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const notify = (type: 'success' | 'error', message: string) => {
    setFeedback({ type, message });
    setTimeout(() => setFeedback(null), 4500);
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formEmail,
          name: formName,
          role: formRole,
          department: formDepartment,
          phone: formPhone,
          password: formPassword,
          status: 'active',
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al crear usuario');
      }

      notify('success', `✓ Usuario ${formEmail} creado y autorizado exitosamente.`);
      setIsCreateOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message || 'Error al crear usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingUser.id,
          name: editingUser.name,
          email: editingUser.email,
          role: editingUser.role,
          department: editingUser.department,
          phone: editingUser.phone,
          status: editingUser.status,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al actualizar usuario');
      }

      notify('success', `✓ Usuario ${editingUser.email} actualizado con éxito.`);
      setEditingUser(null);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message || 'Error al actualizar usuario');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (user: SafeUser) => {
    const nextStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user.id,
          status: nextStatus,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'No se pudo cambiar el estado');
      }

      notify(
        'success',
        `✓ Acceso de ${user.email} ${nextStatus === 'active' ? 'activado' : 'suspendido preventivamente'}.`
      );
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passwordModalUser || !newPassword) return;
    setSubmitting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: passwordModalUser.id,
          password: newPassword.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al actualizar contraseña');
      }

      notify('success', `✓ Contraseña actualizada correctamente para ${passwordModalUser.email}.`);
      setPasswordModalUser(null);
      setNewPassword('');
    } catch (err: any) {
      notify('error', err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (!confirm(`¿Confirmas la eliminación definitiva del usuario ${email}?`)) {
      return;
    }

    try {
      const res = await fetch(`/api/users?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || 'Error al eliminar usuario');
      }

      notify('success', `✓ Usuario ${email} eliminado.`);
      fetchUsers();
    } catch (err: any) {
      notify('error', err.message);
    }
  };

  const resetForm = () => {
    setFormEmail('');
    setFormName('');
    setFormRole('operator');
    setFormDepartment('Operaciones & Trading');
    setFormPhone('');
    setFormPassword('InvestOil2026!*');
  };

  // Filtrado
  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.department?.toLowerCase().includes(search.toLowerCase());

    const matchesRole = roleFilter === 'all' || u.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const activeCount = users.filter((u) => u.status === 'active').length;
  const kycCount = users.filter((u) => u.role === 'compliance_kyc').length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-32 animate-fade-in">
      {/* Encabezado Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-5 border-b border-border">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase tracking-wider bg-accent/15 text-accent border border-accent/30">
              Seguridad & Identidad
            </span>
            <span className="text-xs text-text-subtle font-mono">Control de Roles RBAC</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-text">
            Usuarios & Control de Accesos
          </h1>
          <p className="mt-1 text-xs text-text-muted">
            Gestiona los operadores autorizados, crea credenciales, asigna roles de cumplimiento KYC y controla el acceso al backoffice.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={fetchUsers}
            disabled={loading}
            className="inline-flex items-center justify-center p-2 rounded-lg bg-card border border-border text-text-muted hover:text-text hover:border-accent/40 transition-colors"
            title="Refrescar listado"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            onClick={() => setIsCreateOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-bg text-xs font-bold shadow-glow-accent hover:shadow-glow-neon transition-all"
          >
            <UserPlus className="w-4 h-4" />
            <span>Crear Nuevo Usuario</span>
          </button>
        </div>
      </div>

      {/* Alerta de notificación flotante */}
      {feedback && (
        <div
          className={`flex items-center gap-2.5 p-3.5 rounded-xl border text-xs font-semibold animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Tarjetas KPI de Estado de Usuarios */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-text-subtle">
            <span className="text-[11px] font-mono uppercase tracking-wider">Total Usuarios</span>
            <Users className="w-4 h-4 text-accent" />
          </div>
          <div className="text-2xl font-bold font-mono text-text">{users.length}</div>
          <p className="text-[10px] text-text-muted font-mono">Registrados en la plataforma</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-text-subtle">
            <span className="text-[11px] font-mono uppercase tracking-wider">Accesos Activos</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{activeCount}</div>
          <p className="text-[10px] text-text-muted font-mono">Con credenciales operativas</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-text-subtle">
            <span className="text-[11px] font-mono uppercase tracking-wider">KYC & Cumplimiento</span>
            <BadgeCheck className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-purple-400">{kycCount}</div>
          <p className="text-[10px] text-text-muted font-mono">Oficiales de validación</p>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card/70 backdrop-blur-sm space-y-1">
          <div className="flex items-center justify-between text-text-subtle">
            <span className="text-[11px] font-mono uppercase tracking-wider">Superadministradores</span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {users.filter((u) => u.role === 'superadmin').length}
          </div>
          <p className="text-[10px] text-text-muted font-mono">Control total del sistema</p>
        </div>
      </div>

      {/* Filtros y Buscador */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3 rounded-xl border border-border bg-surf/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-text-subtle absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, email o departamento..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-card/80 border border-border text-xs text-text focus:outline-none focus:border-accent"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-mono text-text-subtle shrink-0">Rol:</span>
          {['all', 'superadmin', 'compliance_kyc', 'operator', 'admin', 'editor'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setRoleFilter(r)}
              className={`px-2.5 py-1 rounded text-xs font-mono transition-colors shrink-0 ${
                roleFilter === r
                  ? 'bg-accent text-bg font-bold'
                  : 'bg-card text-text-muted hover:text-text border border-border/60'
              }`}
            >
              {r === 'all' ? 'Todos' : ROLE_LABELS[r]?.label || r}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de Usuarios */}
      <div className="rounded-xl border border-border bg-card/90 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surf/80 border-b border-border text-[11px] font-mono uppercase tracking-wider text-text-subtle">
              <tr>
                <th className="py-3 px-4">Operador / Usuario</th>
                <th className="py-3 px-4">Departamento</th>
                <th className="py-3 px-4">Rol & Nivel</th>
                <th className="py-3 px-4">Estado</th>
                <th className="py-3 px-4">Último Acceso</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-accent" />
                    <span>Cargando usuarios autorizados...</span>
                  </td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-text-muted font-mono">
                    No se encontraron usuarios con los filtros aplicados.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const roleMeta = ROLE_LABELS[user.role] || {
                    label: user.role,
                    color: 'bg-card text-text-muted border-border',
                  };

                  return (
                    <tr key={user.id} className="hover:bg-surf/40 transition-colors">
                      {/* Usuario */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-accent/20 border border-accent/40 text-accent font-bold font-mono flex items-center justify-center text-xs shrink-0">
                            {user.name ? user.name.slice(0, 2).toUpperCase() : 'US'}
                          </div>
                          <div>
                            <div className="font-semibold text-text flex items-center gap-1.5">
                              <span>{user.name}</span>
                              {user.role === 'superadmin' && (
                                <span title="Superadmin">
                                  <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-text-subtle flex items-center gap-1">
                              <Mail className="w-3 h-3 text-text-subtle" />
                              <span>{user.email}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Departamento */}
                      <td className="py-3.5 px-4 text-text-muted font-mono text-[11px]">
                        <div>{user.department || 'Operaciones'}</div>
                        {user.phone && <div className="text-[10px] text-text-subtle">{user.phone}</div>}
                      </td>

                      {/* Rol */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border ${roleMeta.color}`}
                        >
                          {roleMeta.label}
                        </span>
                      </td>

                      {/* Estado */}
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(user)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
                            user.status === 'active'
                              ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                              : 'bg-rose-500/15 text-rose-400 border-rose-500/30 hover:bg-rose-500/25'
                          }`}
                          title="Hacer clic para conmutar estado"
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              user.status === 'active' ? 'bg-emerald-400' : 'bg-rose-400'
                            }`}
                          />
                          <span>{user.status === 'active' ? 'Activo' : 'Suspendido'}</span>
                        </button>
                      </td>

                      {/* Último Acceso */}
                      <td className="py-3.5 px-4 text-text-subtle font-mono text-[11px]">
                        {user.lastLogin
                          ? new Date(user.lastLogin).toLocaleString('es-ES', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })
                          : 'Nunca registrado'}
                      </td>

                      {/* Acciones */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setPasswordModalUser(user)}
                            className="p-1.5 rounded-md hover:bg-surf text-text-subtle hover:text-amber-400 transition-colors"
                            title="Restablecer o cambiar contraseña"
                          >
                            <Key className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setEditingUser(user)}
                            className="p-1.5 rounded-md hover:bg-surf text-text-subtle hover:text-accent transition-colors"
                            title="Editar usuario"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {user.email !== 'admin@investoil.es' && (
                            <button
                              type="button"
                              onClick={() => handleDelete(user.id, user.email)}
                              className="p-1.5 rounded-md hover:bg-surf text-text-subtle hover:text-rose-400 transition-colors"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: CREAR NUEVO USUARIO */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surf/95 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-base text-text">
                  Registrar Nuevo Usuario / Operador
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsCreateOpen(false)}
                className="p-1 text-text-muted hover:text-text rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Nombre y Apellidos</label>
                <input
                  type="text"
                  required
                  placeholder="ej. Carlos Medina"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Correo Electrónico Institucional</label>
                  <input
                    type="email"
                    required
                    placeholder="usuario@investoil.es"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Contraseña de Acceso</label>
                  <input
                    type="text"
                    required
                    value={formPassword}
                    onChange={(e) => setFormPassword(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Rol y Permisos</label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value as UserRole)}
                    className={INPUT_CLASS}
                  >
                    <option value="operator">Operador de Trading</option>
                    <option value="compliance_kyc">Oficial de Cumplimiento & KYC</option>
                    <option value="admin">Administrador</option>
                    <option value="editor">Editor de Contenidos</option>
                    <option value="superadmin">Superadministrador</option>
                    <option value="viewer">Visualizador (Lectura)</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Departamento</label>
                  <input
                    type="text"
                    placeholder="ej. Operaciones Comerciales, Legal, Logística"
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div>
                <label className={LABEL_CLASS}>Teléfono de Contacto (Opcional)</label>
                <input
                  type="text"
                  placeholder="+34 910 000 000"
                  value={formPhone}
                  onChange={(e) => setFormPhone(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-xs text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Crear y Autorizar</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: EDITAR USUARIO */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-surf/95 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Edit2 className="w-5 h-5 text-accent" />
                <h3 className="font-heading font-bold text-base text-text">
                  Editar Usuario: {editingUser.email}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setEditingUser(null)}
                className="p-1 text-text-muted hover:text-text rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Nombre Completo</label>
                <input
                  type="text"
                  required
                  value={editingUser.name}
                  onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Rol en Plataforma</label>
                  <select
                    value={editingUser.role}
                    onChange={(e) =>
                      setEditingUser({ ...editingUser, role: e.target.value as UserRole })
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="superadmin">Superadministrador</option>
                    <option value="admin">Administrador</option>
                    <option value="compliance_kyc">Cumplimiento & KYC</option>
                    <option value="operator">Operador de Trading</option>
                    <option value="editor">Editor de Contenidos</option>
                    <option value="viewer">Visualizador</option>
                  </select>
                </div>

                <div>
                  <label className={LABEL_CLASS}>Estado de Cuenta</label>
                  <select
                    value={editingUser.status}
                    onChange={(e) =>
                      setEditingUser({
                        ...editingUser,
                        status: e.target.value as 'active' | 'suspended',
                      })
                    }
                    className={INPUT_CLASS}
                  >
                    <option value="active">Activo (Permitido)</option>
                    <option value="suspended">Suspendido (Bloqueado)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className={LABEL_CLASS}>Departamento</label>
                  <input
                    type="text"
                    value={editingUser.department}
                    onChange={(e) => setEditingUser({ ...editingUser, department: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>

                <div>
                  <label className={LABEL_CLASS}>Teléfono</label>
                  <input
                    type="text"
                    value={editingUser.phone}
                    onChange={(e) => setEditingUser({ ...editingUser, phone: e.target.value })}
                    className={INPUT_CLASS}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-xs text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-accent text-bg text-xs font-bold hover:shadow-glow-accent transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CAMBIAR O RESTABLECER CONTRASEÑA */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md rounded-2xl border border-border bg-surf/95 p-6 shadow-2xl space-y-5 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-border/80 pb-3">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-amber-400" />
                <h3 className="font-heading font-bold text-base text-text">
                  Restablecer Contraseña
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setPasswordModalUser(null)}
                className="p-1 text-text-muted hover:text-text rounded-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-muted">
              Asigna una nueva clave para el operador{' '}
              <strong className="text-text">{passwordModalUser.email}</strong>. El cambio entrará en vigor de inmediato en el login.
            </p>

            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className={LABEL_CLASS}>Nueva Contraseña</label>
                <input
                  type="text"
                  required
                  placeholder="ej. InvestOil2026!*"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={INPUT_CLASS}
                />
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-lg bg-card border border-border text-xs text-text-muted hover:text-text transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting || !newPassword}
                  className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-amber-500 text-bg text-xs font-bold hover:bg-amber-400 transition-all disabled:opacity-50"
                >
                  {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Actualizar Contraseña</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
