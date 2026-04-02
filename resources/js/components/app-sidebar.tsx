import { BookOpen, Folder, LayoutGrid, Users, Tags, Sprout, Leaf, UserRound, GraduationCap, UsersRound, Activity, Award, AlertTriangle, Rat, Worm, WormIcon } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import AppLogo from './app-logo';

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.role?.name === 'super admin';
    const isAdmin = auth.user.role?.name === 'admin';

    const navGroups = [
        {
            title: 'Main',
            items: [
                {
                    title: 'Dashboard',
                    url: '/dashboard',
                    icon: LayoutGrid,
                },
            ],
        },
    ];

    if (isAdmin) {
        navGroups.push({
            title: 'Crop Libary',
            items: [
                {
                    title: 'Categories',
                    url: '/admin/categories',
                    icon: Tags,
                },
                {
                    title: 'Commodities',
                    url: '/admin/commodities',
                    icon: Sprout,
                },
                {
                    title: 'Varieties',
                    url: '/admin/varieties',
                    icon: Leaf,
                },
            ],
        });

        navGroups.push({
            title: 'Farm Management',
            items: [
                {
                    title: 'Farmers',
                    url: '/admin/farmers',
                    icon: UserRound,
                },
                {
                    title: 'Farms',
                    url: '/admin/farms',
                    icon: Award,
                },
            ],
        });

        navGroups.push({
            title: 'Programs & Aid',
            items: [
                {
                    title: 'Organizations',
                    url: '/admin/organizations',
                    icon: UsersRound,
                },
                {
                    title: 'Programs',
                    url: '/admin/programs',
                    icon: GraduationCap,
                },
            ],
        });

        navGroups.push({
            title: 'Field Reports',
            items: [
                {
                    title: 'Damage Categories',
                    url: '/admin/damage-categories',
                    icon: WormIcon,
                },
                {
                    title: 'Damage Types',
                    url: '/admin/damage-types',
                    icon: Rat,
                },
            ],
        });
    }

    if (isSuperAdmin) {
        navGroups.push({
            title: 'Monitoring',
            items: [
                {
                    title: 'User Monitoring',
                    url: '/super-admin/users',
                    icon: Users,
                },
                {
                    title: 'Session Monitoring',
                    url: '/super-admin/sessions',
                    icon: Activity,
                },
            ],
        });
    }

    const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        url: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        url: 'https://laravel.com/docs/starter-kits',
        icon: BookOpen,
    },
];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                {navGroups.map((group) => (
                    <NavMain key={group.title} title={group.title} items={group.items} />
                ))}
            </SidebarContent>

            <SidebarFooter>
              
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
