
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { loginCustomer } from './actions';

type Props = {
  searchParams: Promise<{
    error?: string;
    registered?: string;
  }>;
};

export default async function CustomerLoginPage({
  searchParams,
}: Props) {
  const params = await searchParams;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <section className="w-full max-w-md rounded-lg bg-white p-7 shadow-sm">
        <div className="mb-6 text-center">
          <LogIn
            size={30}
            className="mx-auto mb-3 text-blue-500"
          />
          <h1 className="text-2xl font-semibold text-gray-800">
            Customer Login
          </h1>
        </div>

        {params.registered === '1' && (
          <p className="mb-4 rounded bg-green-50 p-3 text-sm text-green-700">
            Registration submitted. Check your email
            for a confirmation link if required.
          </p>
        )}

        {params.error && (
          <p className="mb-4 rounded bg-red-50 p-3 text-sm text-red-600">
            {params.error}
          </p>
        )}

        <form action={loginCustomer} className="space-y-4">
          <input
            type="email"
            name="email"
            placeholder="Email address"
            autoComplete="email"
            required
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            autoComplete="current-password"
            required
            className="w-full rounded border px-3 py-3 text-sm"
          />

          <button
            type="submit"
            className="w-full rounded bg-blue-500 py-3 font-medium text-white hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-gray-500">
          New to Loozinga?{' '}
          <Link
            href="/account/register"
            className="text-blue-500 hover:underline"
          >
            Create an account
          </Link>
        </p>
      </section>
    </main>
  );
}
