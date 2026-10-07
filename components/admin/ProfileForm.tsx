'use client';

import { useState, useTransition } from 'react';

import { updateProfile } from '@/app/admin/account/actions';

type ProfileFormProps = {
  name: string;
  phone: string;
  email: string;
  role: string;
};

export default function ProfileForm({
  name,
  phone,
  email,
  role,
}: ProfileFormProps) {
  const [message, setMessage] = useState('');
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    setMessage('');

    startTransition(async () => {
      const result = await updateProfile(formData);

      const newMessage = result?.message ?? '';
      setMessage(newMessage);

      if (result?.success) {
        setTimeout(() => {
          setMessage('');
        }, 3000);
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 p-5">
      {/* Name */}
      <div>
        <label
          htmlFor="name"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          Name
        </label>

        <input
          id="name"
          name="name"
          type="text"
          defaultValue={name}
          required
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
        />
      </div>

      {/* Email */}
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
          value={email}
          readOnly
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
        />
      </div>

      {/* Phone */}
      <div>
        <label
          htmlFor="phone"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          Phone
        </label>

        <input
          id="phone"
          name="phone"
          type="text"
          defaultValue={phone}
          placeholder="Add phone number"
          className="w-full rounded-md border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400"
        />
      </div>

      {/* Role */}
      <div>
        <label
          htmlFor="role"
          className="mb-2 block text-sm font-medium text-gray-600"
        >
          Role
        </label>

        <input
          id="role"
          type="text"
          value={role}
          readOnly
          className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-500 outline-none"
        />
      </div>

      {message && <p className="text-sm text-gray-500">{message}</p>}

      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isPending}
          className="rounded-md bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isPending ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </form>
  );
}
