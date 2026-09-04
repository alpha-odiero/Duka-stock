import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Link, useNavigate } from 'react-router-dom';
import type { z } from 'zod';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { registerSchema } from '@/schemas';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { extractError } from '@/lib/api';

type FormValues = z.infer<typeof registerSchema>;

export function RegisterPage() {
  const { registerBusiness: registerUser } = useAuth();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      phone: '',
      password: '',
      shopName: '',
      shopLocation: '',
    },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await registerUser(values);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setServerError(extractError(err).message);
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-ink">Start your shop</h1>
      <p className="mt-1 text-sm text-muted">
        Create your account and DukaStock will set up your shop with default categories for you.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4" noValidate>
        {serverError && (
          <div
            role="alert"
            className="rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger"
          >
            {serverError}
          </div>
        )}

        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Your details
          </legend>
          <div className="space-y-4">
            <Input
              label="Full name"
              placeholder="Mama Njeri"
              error={errors.fullName?.message}
              {...register('fullName')}
            />
            <Input
              label="Email"
              type="email"
              placeholder="you@example.com"
              error={errors.email?.message}
              {...register('email')}
            />
            <Input
              label="Phone (optional)"
              type="tel"
              placeholder="+254 712 345 678"
              error={errors.phone?.message}
              {...register('phone')}
            />
            <Input
              label="Password"
              type="password"
              placeholder="At least 8 characters"
              error={errors.password?.message}
              {...register('password')}
            />
          </div>
        </fieldset>

        <fieldset className="rounded-xl border border-line p-4">
          <legend className="px-1 text-xs font-semibold uppercase tracking-wide text-muted">
            Your shop
          </legend>
          <div className="space-y-4">
            <Input
              label="Shop name"
              placeholder="Mama Njeri Mini Mart"
              error={errors.shopName?.message}
              {...register('shopName')}
            />
            <Input
              label="Location (optional)"
              placeholder="Nakuru, Kenya"
              error={errors.shopLocation?.message}
              {...register('shopLocation')}
            />
          </div>
        </fieldset>

        <Button type="submit" loading={isSubmitting} className="w-full">
          Create my shop
        </Button>
      </form>

      <p className="mt-5 text-center text-sm text-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
