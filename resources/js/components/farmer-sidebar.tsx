import { LayoutGrid, User, Sprout, AlertTriangle, Package, CheckCircle, Megaphone } from 'lucide-react';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import OfflineStatusIndicator from '@/components/offline-status-indicator';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarResizeHandle } from '@/components/ui/sidebar';
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
                <ScrollArea className="h-full">
                    {navGroups.map((group) => (
                        <NavMain key={group.title} title={group.title} items={group.items} />
                    ))}
                </ScrollArea>
            </SidebarContent>

            <SidebarFooter>
                {/* Matches app-sidebar: animated grid row instead of `display:none`, and the strip is
                    dropped entirely while OfflineStatusIndicator renders nothing. */}
                <div className="grid grid-rows-[1fr] transition-[grid-template-rows,opacity] duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:grid-rows-[0fr] group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none [&:has(>div:empty)]:hidden">
                    <div className="min-h-0 overflow-hidden border-t px-4 py-2">
                        <OfflineStatusIndicator />
                    </div>
                </div>
                <NavUser />
            </SidebarFooter>

            <SidebarResizeHandle />
        </Sidebar>
    );
}
