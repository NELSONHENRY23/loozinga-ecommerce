'use client';

import {
  useState,
  useTransition,
} from 'react';

import { updatePassword } from '@/app/admin/account/actions';

export default function PasswordForm() {
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState<boolean | null>(null);

  const [isPending, startTransition] =
    useTransition();

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const form = event.currentTarget;
    
    const formData = new FormData(
      event.currentTarget,
    );

    setMessage('');
    setSuccess(null);

    startTransition(async () => {
      const result =
        await updatePassword(formData);

      setMessage(result?.message ?? '');
      setSuccess(result?.success ?? false);

      if (result?.success) {
        form.reset();

        setTimeout(() => {
          setMessage('');
          setSuccess(null);
        }, 3000);
      }
    });
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="newPassword"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          New Password
        </label>

        <input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
        />
      </div>

      <div>
        <label
          htmlFor="confirmPassword"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          Confirm New Password
        </label>

        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
        />
      </div>

      {message && (
        <p
          className={`text-sm ${
            success
              ? 'text-green-600'
              : 'text-red-600'
          }`}
        >
          {message}
        </p>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending
            ? 'Updating...'
            : 'Update Password'}
        </button>
      </div>
    </form>
  );
}