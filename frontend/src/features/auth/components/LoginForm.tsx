import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Input } from '@/components/Input'
import { Button } from '@/components/Button'
import { useLogin } from '../api/authApi'
import { loginSchema, type LoginFormValues } from '../schemas/authSchemas'

export function LoginForm() {
  const loginMutation = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate({ email: data.email, password: data.password })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        placeholder="you@example.com"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input
        label="Password"
        type="password"
        autoComplete="current-password"
        placeholder="••••••••"
        error={errors.password?.message}
        {...register('password')}
      />
      <Button
        type="submit"
        variant="primary"
        size="md"
        loading={isSubmitting || loginMutation.isPending}
        className="w-full mt-1"
      >
        Sign in
      </Button>
    </form>
  )
}
