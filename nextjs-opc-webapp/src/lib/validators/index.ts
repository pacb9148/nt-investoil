import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(120, 'Máximo 120 caracteres'),
  email: z.string().email('Por favor ingresa un correo electrónico válido').max(150),
  subject: z.string().max(150, 'Máximo 150 caracteres').optional().or(z.literal('')),
  message: z.string().min(10, 'El mensaje debe tener al menos 10 caracteres').max(2000, 'Máximo 2000 caracteres'),
  honeypot: z.string().max(0, 'Bot detectado').optional().or(z.literal('')),
});

export type ContactFormData = z.infer<typeof contactFormSchema>;

export const postFormSchema = z.object({
  title: z.string().min(5, 'El título debe tener al menos 5 caracteres').max(200),
  slug: z.string().min(3, 'El slug debe tener al menos 3 caracteres').max(120),
  excerpt: z.string().max(500, 'Máximo 500 caracteres').optional().or(z.literal('')),
  content: z.any(),
  status: z.enum(['draft', 'published', 'archived']).default('draft'),
  featured_image_url: z.string().url('URL inválida').optional().or(z.literal('')),
  tags: z.array(z.string()).default([]),
  meta_title: z.string().max(70).optional().or(z.literal('')),
  meta_description: z.string().max(160).optional().or(z.literal('')),
  is_republished: z.boolean().default(false),
  original_source_url: z.string().url('URL inválida').optional().or(z.literal('')),
  original_source_name: z.string().optional().or(z.literal('')),
  categories: z.array(z.string()).optional(),
});

export type PostFormData = z.infer<typeof postFormSchema>;

export const newsRepublishSchema = z.object({
  url: z.string().url('Ingresa una URL válida de la noticia'),
});

export type NewsRepublishData = z.infer<typeof newsRepublishSchema>;

export const loginSchema = z.object({
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export const registerSchema = z.object({
  fullName: z.string().min(2, 'Ingresa tu nombre completo'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
