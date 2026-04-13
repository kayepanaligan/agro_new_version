import { LayoutGrid, User, Sprout, AlertTriangle, Package, CheckCircle, Megaphone } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import OfflineStatusIndicator from '@/components/offline-status-indicator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import AppLogo from './app-logo';

export function FarmerSidebar() {
    const navGroups = [
        {
            title: 'Main',
            items: [
                { 
                    title: 'Dashboard',
                    url: '/farmer/dashboard',
                    icon: LayoutGrid,
                },
            ],
        },
        {
            title: 'My Account',
            items: [
                {
                    title: 'My Profile',
                    url: '/farmer/profile',
                    icon: User,
                },
                {
                    title: 'My Farms & Parcels',
                    url: '/farmer/farms',
                    icon: Sprout,
                },
            ],
        },
        {
            title: 'Reports & Allocations',
            items: [
                {
                    title: 'Crop Damage Reports',
                    url: '/farmer/crop-damage',
                    icon: AlertTriangle,
                },
                {
                    title: 'My Allocations',
                    url: '/farmer/allocations',
                    icon: Package,
                },
                {
                    title: 'Eligible Allocations',
                    url: '/farmer/allocations/eligible',
                    icon: CheckCircle,
                },
            ],
        },
        {
            title: 'Notifications',
            items: [
                {
                    title: 'Announcements',
                    url: '/farmer/announcements',
                    icon: Megaphone,
                },
            ],
        },
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/farmer/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent className="overflow-hidden">
                <ScrollArea className="h-full px-2 py-0">
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
