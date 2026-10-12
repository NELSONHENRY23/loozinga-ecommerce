
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { registerCustomer } from './actions';

type Props = {
  searchParams: Promise<{ error?: string }>;
};

export default async function RegisterPage({
  searchParams,
}: Props) {
  const { error } = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-lg bg-white p-7 shadow-sm">
        <div className="mb-6 text-center">
          <UserPlus
            size={30}
            className="mx-auto mb-3 text-blue-500"
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            Create Loozinga Account
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Register to shop and track your orders.
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {error}
          </p>
        )}

        <form action={registerCustomer} className="space-y-4">
          <input
            name="name"
            placeholder="Full name"
            required
            maxLength={150}
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <input
            name="email"
            type="email"
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <input
            name="password"
            type="password"
            placeholder="Password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <input
            name="confirmPassword"
            type="password"
            placeholder="Confirm password"
            autoComplete="new-password"
            minLength={8}
            required
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <button
            type="submit"
            className="w-full rounded bg-blue-500 py-3 font-medium text-white hover:bg-blue-600"
          >
            Create Account
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          Already registered?{' '}
          <Link
            href="/account/login"
            className="text-blue-500 hover:underline"
          >
            Sign in
          </Link>
        </p>
      </section>
    </main>
  );
}
