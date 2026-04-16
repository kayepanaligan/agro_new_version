import { BookOpen, Folder, LayoutGrid, Users, Tags, Sprout, Leaf, UserRound, GraduationCap, UsersRound, Activity, Award, AlertTriangle, Rat, Worm, WormIcon, Ruler, ClipboardList, FileCheck, HandCoinsIcon, Wallet, Layers, MapPin, CheckSquare, Truck, Scale, FileText, FolderOpen, FlaskConical, Shield, ClipboardCheck, Key, Calendar } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import OfflineStatusIndicator from '@/components/offline-status-indicator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage, router } from '@inertiajs/react';
import { useEffect, useRef } from 'react';
import AppLogo from './app-logo';

export interface NavGroup {
    title: string;
    items: NavItem[];
}

export function AppSidebar() {
    const { auth } = usePage<SharedData>().props;
    const isSuperAdmin = auth.user.role?.name === 'super admin';
    const isAdmin = auth.user.role?.name === 'admin';
    const scrollAreaContainerRef = useRef<HTMLDivElement>(null);
    const SCROLL_STORAGE_KEY = 'sidebar_scroll_position';

    // Helper to get the viewport element
    const getViewport = () => {
        if (!scrollAreaContainerRef.current) return null;
        // The viewport is the direct child of the ScrollArea root with data attribute
        return scrollAreaContainerRef.current.querySelector('[data-radix-scroll-area-viewport]') as HTMLElement;
    };

    // Restore scroll position on mount
    useEffect(() => {
        const savedPosition = sessionStorage.getItem(SCROLL_STORAGE_KEY);
        if (savedPosition) {
            const scrollTop = parseInt(savedPosition, 10);
            if (!isNaN(scrollTop)) {
                // Use setTimeout to ensure the DOM is ready
                setTimeout(() => {
                    const viewport = getViewport();
                    if (viewport) {
                        viewport.scrollTop = scrollTop;
                    }
                }, 0);
            }
        }
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            const viewport = getViewport();
            if (viewport) {
                sessionStorage.setItem(
                    SCROLL_STORAGE_KEY,
                    viewport.scrollTop.toString()
                );
            }
        };

        // Wait for component to mount, then attach scroll listener
        const timeoutId = setTimeout(() => {
            const viewport = getViewport();
            if (viewport) {
                viewport.addEventListener('scroll', handleScroll);
            }
        }, 0);

        // Listen to Inertia navigation start event
        const unsubscribe = router.on('start', () => {
            const viewport = getViewport();
            if (viewport) {
                sessionStorage.setItem(
                    SCROLL_STORAGE_KEY,
                    viewport.scrollTop.toString()
                );
            }
        });

        return () => {
            clearTimeout(timeoutId);
            const viewport = getViewport();
            if (viewport) {
                viewport.removeEventListener('scroll', handleScroll);
            }
            unsubscribe();
        };
    }, []);

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
        // navGroups.push({
        //     title: 'Crop Libary',
        //     items: [
        //         {
        //             title: 'Categories',
        //             url: '/admin/categories',
        //             icon: Tags,
        //         },
        //         {
        //             title: 'Commodities',
        //             url: '/admin/commodities',
        //             icon: Sprout,
        //         },
        //         {
        //             title: 'Varieties',
        //             url: '/admin/varieties',
        //             icon: Leaf,
        //         },
        //     ],
        // });

        navGroups.push({
            title: 'Farmer Records',
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
            title: 'Programs & Assistance',
            items: [
                //  {
                //     title: 'Programs',
                //     url: '/admin/programs',
                //     icon: HandCoinsIcon,
                // },
                // {
                //     title: 'Funding Sources',
                //     url: '/admin/funding-sources',
                //     icon: Wallet,
                // },
                // {
                //     title: 'Assistance Categories',
                //     url: '/admin/assistance-categories',
                //     icon: Layers,
                // },
                // {
                //     title: 'Allocation Types',
                //     url: '/admin/allocation-types',
                //     icon: ClipboardList,
                // },
                // {
                //     title: 'Eligible Barangays',
                //     url: '/admin/eligible-barangays',
                //     icon: MapPin,
                // },
                // {
                //     title: 'Eligibility Rules',
                //     url: '/admin/eligibility-rules',
                //     icon: CheckSquare,
                // },
                {
                    title: 'Distribution Records',
                    url: '/admin/distribution-records',
                    icon: Truck,
                },
                // {
                //     title: 'Allocation Policies',
                //     url: '/admin/allocation-policies',
                //     icon: Scale,
                // },
               
            ],
        });

        navGroups.push({
            title: 'Damage Logs',
            items: [
                // {
                //     title: 'Damage Categories',
                //     url: '/admin/damage-categories',
                //     icon: WormIcon,
                // },
                // {
                //     title: 'Damage Types',
                //     url: '/admin/damage-types',
                //     icon: Rat,
                // },
                {
                    title: 'Crop Damage Records',
                    url: '/admin/crop-damage-records',
                    icon: FileText,
                },
            ],
        });

        // Crop Monitoring Section
        navGroups.push({
            title: 'Crop Monitoring',
            items: [
                // {
                //     title: 'Monitoring Categories',
                //     url: '/admin/monitoring-categories',
                //     icon: Tags,
                // },
                {
                    title: 'Monitoring Folders',
                    url: '/admin/monitoring-folders',
                    icon: FolderOpen,
                },
            ],
        });

        // Task & Report Management
        navGroups.push({
            title: 'Task & Report Management',
            items: [
                {
                    title: 'Task Management',
                    url: '/admin/tasks',
                    icon: ClipboardCheck,
                },
                {
                    title: 'Technician Reports',
                    url: '/admin/technician-reports',
                    icon: FileText,
                },
                {
                    title: 'Activity Calendar',
                    url: '/admin/calendar',
                    icon: Calendar,
                },
            ],
        });

       

        // navGroups.push({
        //     title: 'Supporting Infrastructure',
        //     items: [
        //         {
        //             title: 'Organizations',
        //             url: '/admin/organizations',
        //             icon: UsersRound,
        //         },
        //         {
        //             title: 'Unit of Measures',
        //             url: '/admin/unit-of-measures',
        //             icon: Ruler,
        //         },
        //         {
        //             title: 'Farmer Eligibilities',
        //             url: '/admin/farmer-eligibilities',
        //             icon: FileCheck,
        //         },
        //     ],
        // });
    }

    if (isSuperAdmin) {
        navGroups.push({
            title: 'Crop Library',
            items: [
                {
                    title: 'Categories',
                    url: '/super-admin/categories',
                    icon: Tags,
                },
                {
                    title: 'Commodities',
                    url: '/super-admin/commodities',
                    icon: Sprout,
                },
                {
                    title: 'Varieties',
                    url: '/super-admin/varieties',
                    icon: Leaf,
                },
            ],
        });

        navGroups.push({
            title: 'Programs & Assistance',
            items: [
                {
                    title: 'Programs',
                    url: '/super-admin/programs',
                    icon: HandCoinsIcon,
                },
                {
                    title: 'Funding Sources',
                    url: '/super-admin/funding-sources',
                    icon: Wallet,
                },
                {
                    title: 'Assistance Categories',
                    url: '/super-admin/assistance-categories',
                    icon: Layers,
                },
                {
                    title: 'Allocation Types',
                    url: '/super-admin/allocation-types',
                    icon: ClipboardList,
                },
                {
                    title: 'Eligibility Rules',
                    url: '/super-admin/eligibility-rules',
                    icon: CheckSquare,
                },
                {
                    title: 'Allocation Policies',
                    url: '/super-admin/allocation-policies',
                    icon: Scale,
                },
                {
                    title: 'Formula Types',
                    url: '/super-admin/formula-types',
                    icon: FlaskConical,
                },
            ],
        });

        navGroups.push({
            title: 'Damage Logs',
            items: [
                {
                    title: 'Damage Categories',
                    url: '/super-admin/damage-categories',
                    icon: WormIcon,
                },
                {
                    title: 'Damage Types',
                    url: '/super-admin/damage-types',
                    icon: Rat,
                },
            ],
        });

        navGroups.push({
            title: 'Crop Monitoring',
            items: [
                {
                    title: 'Monitoring Categories',
                    url: '/super-admin/monitoring-categories',
                    icon: Tags,
                },
            ],
        });

        navGroups.push({
            title: 'Supporting Infrastructure',
            items: [
                {
                    title: 'Organizations',
                    url: '/super-admin/organizations',
                    icon: UsersRound,
                },
                {
                    title: 'Unit of Measures',
                    url: '/super-admin/unit-of-measures',
                    icon: Ruler,
                },
                {
                    title: 'Farmer Eligibilities',
                    url: '/super-admin/farmer-eligibilities',
                    icon: FileCheck,
                },
            ],
        });

        navGroups.push({
            title: 'Privilege Management',
            items: [
                {
                    title: 'Role Management',
                    url: '/super-admin/roles',
                    icon: Shield,
                },
                {
                    title: 'User Privileges',
                    url: '/super-admin/privileges',
                    icon: Key,
                },
                {
                    title: 'User Monitoring',
                    url: '/super-admin/users',
                    icon: Users,
                },
            ],
        });

        navGroups.push({
            title: 'Monitoring',
            items: [
                {
                    title: 'Session Monitoring',
                    url: '/super-admin/sessions',
                    icon: Activity,
                },
                {
                    title: 'Audit Logs',
                    url: '/super-admin/audit-logs',
                    icon: FileText,
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

            <SidebarContent className="overflow-hidden">
                <ScrollArea className="h-full px-2 py-0" ref={scrollAreaContainerRef}>
                    {navGroups.map((group) => (
                        <NavMain key={group.title} title={group.title} items={group.items} />
                    ))}
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                <div className="px-4 py-2 border-t">
                    <OfflineStatusIndicator />
                </div>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
