import { NavMain } from '@/components/nav-main';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem
} from '@/components/ui/sidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { type NavItem } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import {
    LayoutDashboard,
    Users,
    Brain,
    Activity,
    FileText,
    Settings,
    GitBranch,
    LogOut,
    User,
    ChevronUp,
    BarChart3,
    Database,
    Shield
} from 'lucide-react';

interface PageProps {
    auth: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            admin?: any;
        };
    };
}

export function AppSidebar() {
    const { auth } = usePage<PageProps>().props;
    const user = auth?.user;

    // Handle logout
    const handleLogout = () => {
        router.post(route('logout'));
    };

    // Nav items untuk admin - sesuai dengan struktur folder Pages
    const adminNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: route('admin.dashboard'),
            icon: LayoutDashboard,
        },
        {
            title: 'Daftar Mahasiswa',
            href: route('admin.mahasiswa.index'),
            icon: Users,
        },
        {
            title: 'Riwayat Konsultasi Mahasiswa',
            href: route('admin.riwayat-konsultasi.index'),
            icon: FileText,
        },
        {
            title: 'Riwayat Konsultasi Guest',
            href: route('admin.guest-consultation.index'),
            icon: GitBranch,
        },
        {
            title: 'Analisis BDI-II',
            href: route('admin.guest-consultation.bdi-analysis'),
            icon: BarChart3,
        },

        {
            title: 'Daftar Diagnosa',
            href: route('admin.diagnosa.index'),
            icon: Brain,
        },
        {
            title: 'Daftar Gejala',
            href: route('admin.gejala.index'),
            icon: Activity,
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={route('admin.dashboard')} prefetch>
                                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                                    <Shield className="size-4" />
                                </div>
                                <div className="grid flex-1 text-left text-sm leading-tight">
                                    <span className="truncate font-semibold">
                                        Sistem Pakar Admin
                                    </span>
                                    <span className="truncate text-xs">
                                        Panel Administrator
                                    </span>
                                </div>
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={adminNavItems} />
            </SidebarContent>

            <SidebarFooter>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                                >
                                    <Avatar className="h-8 w-8 rounded-lg">
                                        <AvatarImage
                                            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || '')}&background=6366f1&color=fff`}
                                            alt={user?.name}
                                        />
                                        <AvatarFallback className="rounded-lg">
                                            {user?.name?.charAt(0).toUpperCase() || 'U'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="grid flex-1 text-left text-sm leading-tight">
                                        <span className="truncate font-semibold">
                                            {user?.name}
                                        </span>
                                        <span className="truncate text-xs">
                                            {user?.email}
                                        </span>
                                    </div>
                                    <ChevronUp className="ml-auto size-4" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                                side="bottom"
                                align="end"
                                sideOffset={4}
                            >
                                <DropdownMenuItem
                                    className="cursor-pointer text-red-600 focus:text-red-600"
                                    onClick={handleLogout}
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Keluar
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}

export default AppSidebar;
