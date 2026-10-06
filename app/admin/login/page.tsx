import { LockKeyhole } from 'lucide-react';

import { login } from './actions';

type AdminLoginPageProps = {
  searchParams: Promise<{
    error?: string;
  }>;
};

export default async function AdminLoginPage({
  searchParams,
}: AdminLoginPageProps) {
  const params = await searchParams;

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white p-6 shadow-sm">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
            <LockKeyhole
              size={22}
              className="text-blue-500"
            />
          </div>

          <h1 className="text-2xl font-semibold text-gray-700">
            Admin Login
          </h1>

          <p className="mt-2 text-sm text-gray-500">
            Sign in to access the Loozinga admin dashboard.
          </p>
        </div>

        {params.error && (
          <div className="mb-4 rounded-md bg-red-50 px-4 py-3 text-sm text-red-600">
            {params.error}
          </div>
        )}

        <form
          action={login}
          className="space-y-5"
        >
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Email
            </label>

            <input
              id="email"
              type="email"
              name="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
              placeholder="admin@example.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-600"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
              placeholder="Enter your password"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-md bg-blue-500 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}