import Link from 'next/link';
import {
  User,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { eq } from 'drizzle-orm';

import { db } from '@/app/db';
import { profiles } from '@/app/db/schema';

import { createClient } from '@/utils/superbase/server';
import ProfileForm from '@/components/admin/ProfileForm';

export default async function AccountPage() {
    const supabase = await createClient();

const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  return null;
}

const profileResult = await db
  .select()
  .from(profiles)
  .where(eq(profiles.id, user.id))
  .limit(1);

let profile = profileResult[0];

if(!profile){
  const insertedProfile = await db.insert(profiles).values(
    {
      id: user.id,
      name: 'Admin User',
      phone: null,
      role: 'Administrator',
      updatedAt: new Date(),
    }
  ).returning();

  profile = insertedProfile[0];

}

const name =
  profile?.name ?? 'Admin User';

const phone =
  profile?.phone ?? '';

const role =
  profile?.role ?? 'Administrator';

    return (
    <div className="p-5">
      {/* Heading */}
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-700">
          Account
        </h1>

        <div className="mt-2 flex gap-2 text-sm text-gray-500">
          <Link
            href="/admin"
            className="hover:text-blue-500"
          >
            Home
          </Link>

          <span>/</span>

          <span>Account</span>
        </div>
      </div>

      {/* Account Summary */}
      <section className="mb-5 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-5">
          {/* Avatar */}
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-blue-500">
            <User size={30} />
          </div>

          <div>
            <h2 className="text-lg font-semibold text-gray-700">
              {name}
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              {user?.email ?? 'No email available'}
            </p>

            <div className="mt-2 flex items-center gap-2 text-xs text-green-600">
              <ShieldCheck size={14} />
              Admin Account
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        {/* Profile Information */}
        <section className="bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <User
              size={18}
              className="text-blue-500"
            />

            <h2 className="font-semibold text-gray-700">
              Profile Information
            </h2>
          </div>

         <ProfileForm
            name={name}
            email={user?.email ?? ''}
            phone={phone}
            role={role}
          />
        </section>

        {/* Security */}
        <section className="bg-white shadow-sm">
          <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
            <Lock
              size={18}
              className="text-blue-500"
            />

            <h2 className="font-semibold text-gray-700">
              Security
            </h2>
          </div>

          <div className="p-5">
            <div className="mb-5 rounded-md bg-blue-50 p-4">
              <div className="flex gap-3">
                <ShieldCheck
                  size={20}
                  className="mt-0.5 text-blue-500"
                />

                <div>
                  <p className="text-sm font-medium text-gray-700">
                    Password Management
                  </p>

                  <p className="mt-1 text-xs leading-5 text-gray-500">
                    Password updates will be connected to
                    Supabase Authentication in the next step.
                  </p>
                </div>
              </div>
            </div>

            <form className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Current Password
                </label>

                <input
                  type="password"
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  New Password
                </label>

                <input
                  type="password"
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-600">
                  Confirm New Password
                </label>

                <input
                  type="password"
                  disabled
                  className="w-full cursor-not-allowed rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5 text-sm text-gray-400"
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  disabled
                  className="cursor-not-allowed rounded-md bg-gray-300 px-5 py-2.5 text-sm font-medium text-white"
                >
                  Update Password
                </button>
              </div>
            </form>
          </div>
        </section>
      </div>
    </div>
  );
}