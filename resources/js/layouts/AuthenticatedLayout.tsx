import React, { ReactNode, useState } from 'react';
import { Link, usePage } from '@inertiajs/react';
import {
    Bars3Icon,
    XMarkIcon,
    HomeIcon,
    ChartBarIcon,
    ClipboardDocumentListIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';

interface User {
    id: number;
    name: string;
    email: string;
}

interface PageProps {
    auth: {
        user: User;
    };
}

interface Props {
    children: ReactNode;
}

export default function AuthenticatedLayout({ children }: Props) {
    const { auth } = usePage<PageProps>().props;
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const navigation = [
        { name: 'Dashboard', href: route('mahasiswa.dashboard'), icon: HomeIcon },
        { name: 'Konsultasi', href: route('mahasiswa.konsultasi.index'), icon: ClipboardDocumentListIcon },
        { name: 'Riwayat Konsultasi', href: route('mahasiswa.riwayat-konsultasi.index'), icon: ChartBarIcon },
    ];

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile menu */}
            <div className={`fixed inset-0 flex z-40 md:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
                <div className={`fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`} onClick={() => setSidebarOpen(false)} />

                <div className={`relative flex-1 flex flex-col max-w-xs w-full bg-white transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                    <div className="absolute top-0 right-0 -mr-12 pt-2">
                        <button
                            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                            onClick={() => setSidebarOpen(false)}
                        >
                            <XMarkIcon className="h-6 w-6 text-white" />
                        </button>
                    </div>

                    <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
                        <div className="flex-shrink-0 flex items-center px-4">
                            <h1 className="text-xl font-bold text-gray-900">CF Depresi</h1>
                        </div>
                        <nav className="mt-5 px-2 space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-base font-medium rounded-md"
                                >
                                    <item.icon className="text-gray-400 mr-4 h-6 w-6" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            {/* Static sidebar for desktop */}
            <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
                <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
                    <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
                        <div className="flex items-center flex-shrink-0 px-4">
                            <h1 className="text-xl font-bold text-gray-900">CF Depresi</h1>
                        </div>
                        <nav className="mt-5 flex-1 px-2 bg-white space-y-1">
                            {navigation.map((item) => (
                                <Link
                                    key={item.name}
                                    href={item.href}
                                    className="text-gray-600 hover:bg-gray-50 hover:text-gray-900 group flex items-center px-2 py-2 text-sm font-medium rounded-md"
                                >
                                    <item.icon className="text-gray-400 mr-3 h-5 w-5" />
                                    {item.name}
                                </Link>
                            ))}
                        </nav>
                    </div>
                </div>
            </div>

            <div className="md:pl-64 flex flex-col flex-1">
                {/* Top navigation */}
                <div className="sticky top-0 z-10 md:hidden pl-1 pt-1 sm:pl-3 sm:pt-3 bg-gray-100">
                    <button
                        className="-ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Bars3Icon className="h-6 w-6" />
                    </button>
                </div>

                {/* Top bar */}
                <div className="sticky top-0 z-10 flex-shrink-0 flex h-16 bg-white shadow">
                    <div className="flex-1 px-4 flex justify-between items-center">
                        <div className="flex-1" />

                        {/* User menu */}
                        <div className="ml-4 flex items-center md:ml-6">
                            <div className="relative ml-3">
                                <div className="flex items-center space-x-4">
                                    <div className="flex items-center space-x-2">
                                        <UserIcon className="h-5 w-5 text-gray-400" />
                                        <span className="text-sm font-medium text-gray-700">
                                            {auth.user.name}
                                        </span>
                                    </div>

                                    <Link
                                        href={route('logout')}
                                        method="post"
                                        as="button"
                                        className="flex items-center space-x-2 text-gray-400 hover:text-gray-600"
                                    >
                                        <ArrowRightOnRectangleIcon className="h-5 w-5" />
                                        <span className="text-sm">Logout</span>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <main className="flex-1">
                    <div className="py-6">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
