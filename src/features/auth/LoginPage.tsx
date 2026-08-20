import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Dumbbell } from 'lucide-react'
import { toast } from 'sonner'
import { loginSchema } from '../../lib/validators'
import { useAuthStore } from '../../stores/authStore'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card } from '../../components/ui/Card'

interface LoginValues {
  email: string
  password: string
}

export function LoginPage() {
  const navigate = useNavigate()
  const mode = useAuthStore((state) => state.mode)
  const login = useAuthStore((state) => state.login)
  const signInWithGoogle = useAuthStore((state) => state.signInWithGoogle)
  const continueLocally = useAuthStore((state) => state.continueLocally)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) })

  const onSubmit = async (values: LoginValues) => {
    const result = await login(values.email, values.password)
    if (result.error) {
      toast.error(result.error)
      return
    }
    toast.success('¡Bienvenido de nuevo!')
    navigate('/')
  }

  const onGoogle = async () => {
    const result = await signInWithGoogle()
    if (result.error) toast.error(result.error)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="mb-6 flex flex-col items-center gap-2">
        <Dumbbell size={40} className="text-emerald-500" />
        <h1 className="text-2xl font-bold">GymTracker Pro</h1>
      </div>

      <Card className="w-full max-w-md">
        {mode === 'local' ? (
          <div className="flex flex-col gap-4">
            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
              Aún no configuraste la sincronización en la nube. Podés usar la app en este dispositivo y conectar tu cuenta más adelante.
            </p>
            <Button
              size="lg"
              onClick={async () => {
                await continueLocally()
                navigate('/')
              }}
            >
              Continuar en modo local
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
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
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />
            <Button size="lg" type="submit" loading={isSubmitting}>
              Iniciar sesión
            </Button>
            <Button type="button" variant="secondary" onClick={onGoogle}>
              Continuar con Google
            </Button>
          </form>
        )}
      </Card>

      {mode === 'cloud' && (
        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          ¿No tenés cuenta?{' '}
          <Link to="/registro" className="font-semibold text-emerald-500">
            Registrate
          </Link>
        </p>
      )}
    </div>
  )
}