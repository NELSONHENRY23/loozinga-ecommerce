import Link from 'next/link';
import { User, Lock } from 'lucide-react';

export default function AccountPage(){
    return (
        <div className="p-5">
            {/* Heading */}

            <div className="mb-6">
                <h1 className="text-2xl font-semibold text-gray-700">
                    Account
                </h1>

                <div className="mt-2 flex gap-2 text-sm text-gray-500">
                    <Link href="/admin" className="hover:text-blue-500">
                        Home
                    </Link>

                    <span>/</span>

                    <span>Account</span>
                </div>
            </div>

            <div className="grid gap-5 lg:grid-cols-2">
                {/* Profile information */}
                <section className="bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                        <User size={18} className="text-blue-500"/>

                        <h2 className="font-semi-bold text-gray-700">
                            Profile Information
                        </h2>
                    </div>

                    <form className="space-y-5 p-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Name
                            </label>

                            <input type="text" defaultValue= "Nelson Henry" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
 
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Email
                            </label>

                            <input type="email" defaultValue= "nelson@example.com" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
 
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Phone
                            </label>

                            <input type="text" defaultValue= "+60123456789" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
 
                        </div>
                        <div className="flex justify-end">
                            <button type="submit" className="bg-blue-500 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-blue-600">
                                Save Changes
                            </button>
                        </div>
                    </form>
                </section>

                <section className="bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-4">
                        <Lock size={18} className="text-blue-500"/>

                            <h2 className="font-semibold text-gray-700">
                                Change Password
                            </h2>
                    </div>

                    <form className="space-y-5 p-5">
                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Current Password
                            </label>

                            <input type="password" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                New Password
                            </label>

                            <input type="password" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
                        </div>

                        <div>
                            <label className="mb-2 block text-sm font-medium text-gray-600">
                                Confirm New Password
                            </label>

                            <input type="password" className="w-full border border-gray-200 px-3 py-2.5 text-sm text-gray-700 outline-none transition focus:border-blue-400" />
                        </div>

                        <div className="flex justify-end">
                            <button className="bg-blue-500 px-5 py-2 5 text-sm font-medium text-white transition hover:bg-blue-600">
                                Update Password
                            </button>
                        </div>
                    </form>
                </section>
            </div>
        </div>

    )
}