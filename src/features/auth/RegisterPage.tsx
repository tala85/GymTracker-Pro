import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { registerSchema } from '../../lib/validators'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

interface RegisterValues {
  name: string
  email: string
  password: string
  confirm: string
}

export function RegisterPage() {
  const navigate = useNavigate()
  const registerUser = useAuthStore((state) => state.register)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) })

  const onSubmit = async (values: RegisterValues) => {
    const result = await registerUser(values.name, values.email, values.password)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.needsConfirmation) {
      toast.success('Cuenta creada. Revisá tu email para confirmarla.')
      navigate('/login')
      return
    }
    toast.success('¡Cuenta creada con éxito!')
    navigate('/')
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Dumbbell size={40} className="text-emerald-500" />
        <h1 className="text-2xl font-bold">Crear cuenta</h1>
      </div>

      <Card className="w-full max-w-md">
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input
            label="Nombre"
            placeholder="Tu nombre"
            error={errors.name?.message}
            {...register('name')}
          />
          <Input
            label="Email"
            type="email"
            placeholder="tu@email.com"
            error={errors.email?.message}
            {...register('email')}
          />
          <Input
            label="Contraseña"
            type="password"
            placeholder="Mínimo 6 caracteres"
            error={errors.password?.message}
            {...register('password')}
          />
          <Input
            label="Confirmar contraseña"
            type="password"
            placeholder="Repetí la contraseña"
            error={errors.confirm?.message}
            {...register('confirm')}
          />
          <Button size="lg" type="submit" loading={isSubmitting}>
            Crear cuenta
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="font-semibold text-emerald-500">
          Iniciá sesión
        </Link>
      </p>
    </div>
  )
}