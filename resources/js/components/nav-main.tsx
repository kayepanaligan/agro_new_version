import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function NavMain({ title, items = [] }: { title?: string; items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';
    
    return (
        <SidebarGroup className="px-2 py-0">
            {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                        {isCollapsed ? (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <SidebarMenuButton 
                                        asChild 
                                        isActive={item.url === page.url}
                                        className="group-data-[collapsible=icon]:pointer-events-auto! group-data-[collapsible=icon]:w-full"
                                    >
                                        <Link 
                                            href={item.url} 
                                            prefetch 
                                            className="flex items-center gap-2 w-full h-full pointer-events-auto"
                                        >
                                            {item.icon && <item.icon />}
                                            <span>{item.title}</span>
                                        </Link>
                                    </SidebarMenuButton>
                                </TooltipTrigger>
                                <TooltipContent 
                                    side="right" 
                                    className="flex items-center gap-4 text-xs font-medium bg-popover text-popover-foreground shadow-md border border-border"
                                    sideOffset={8}
                                >
                                    {item.title}
                                </TooltipContent>
                            </Tooltip>
                        ) : (
                            <SidebarMenuButton 
                                asChild 
                                isActive={item.url === page.url}
                                className="group-data-[collapsible=icon]:pointer-events-auto! group-data-[collapsible=icon]:w-full"
                            >
                                <Link 
                                    href={item.url} 
                                    prefetch 
                                    className="flex items-center gap-2 w-full h-full pointer-events-auto"
                                >
                                    {item.icon && <item.icon />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        )}
                    </SidebarMenuItem>
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}
