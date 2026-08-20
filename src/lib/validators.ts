import { z } from 'zod'

const urlRegex = /^https?:\/\/[^\s]+$/i
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export const youTubeUrlSchema = z
  .string()
  .regex(urlRegex, 'Ingresá una URL válida (http:// o https://)')
  .refine((url) => /youtube\.com|youtu\.be/i.test(url), 'Debe ser un enlace de YouTube')

export const loginSchema = z.object({
  email: z.string().regex(emailRegex, 'Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

export const registerSchema = z
  .object({
    name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
    email: z.string().regex(emailRegex, 'Email inválido'),
    password: z.string().min(6, 'Mínimo 6 caracteres'),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: 'Las contraseñas no coinciden',
    path: ['confirm'],
  })

export const exerciseFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(80, 'Máximo 80 caracteres'),
  primaryMuscle: z.string().min(1, 'Seleccioná un grupo muscular'),
  description: z.string().max(500, 'Máximo 500 caracteres').optional(),
  videoUrl: z.union([z.literal(''), youTubeUrlSchema]),
})

export const routineFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(60, 'Máximo 60 caracteres'),
  description: z.string().max(300, 'Máximo 300 caracteres').optional(),
  goal: z.enum(['hipertrofia', 'fuerza', 'definicion', 'volumen', 'mantenimiento']),
  split: z.enum(['ppl', 'weider', 'torso_pierna', 'full_body', 'upper_lower', 'personalizado']),
  durationWeeks: z.number().int('Debe ser un número entero').min(1, 'Mínimo 1 semana').max(52, 'Máximo 52 semanas').optional(),
})

export const setEntrySchema = z.object({
  weightKg: z.number().min(0, 'El peso no puede ser negativo').max(500, 'Máximo 500 kg'),
  reps: z.number().int('Debe ser un número entero').min(1, 'Mínimo 1 repetición').max(200, 'Máximo 200 repeticiones'),
  rir: z.number().int('Debe ser un número entero').min(0, 'RIR mínimo 0').max(10, 'RIR máximo 10').optional(),
  restSeconds: z.number().int('Debe ser un número entero').min(0, 'No puede ser negativo').max(600, 'Máximo 600 segundos').optional(),
  isFailure: z.boolean(),
})

const cm = (min: number, max: number) =>
  z.number().min(min, `Mínimo ${min} cm`).max(max, `Máximo ${max} cm`).optional()

export const measurementFormSchema = z.object({
  date: z.string().min(1, 'Ingresá una fecha').refine((d) => new Date(d) <= new Date(), 'La fecha no puede ser futura'),
  weightKg: z.number().min(30, 'Mínimo 30 kg').max(300, 'Máximo 300 kg'),
  heightCm: cm(100, 250),
  waistCm: cm(30, 200),
  hipsCm: cm(30, 200),
  chestCm: cm(40, 200),
  bicepsCm: cm(10, 100),
  thighCm: cm(20, 150),
  notes: z.string().max(500, 'Máximo 500 caracteres').optional(),
})

export const linkFormSchema = z.object({
  title: z.string().min(2, 'Mínimo 2 caracteres').max(100, 'Máximo 100 caracteres'),
  url: z.string().regex(urlRegex, 'Ingresá una URL válida (http:// o https://)'),
  category: z.string().min(1, 'Seleccioná una categoría'),
})