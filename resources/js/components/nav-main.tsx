import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function NavMain({ title, items = [] }: { title?: string; items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed';

    const isActiveLink = (itemUrl: string) => {
        return page.url === itemUrl || page.url.startsWith(itemUrl + '/');
    };
    
    return (
        <SidebarGroup className="px-2 py-0">
            {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
            <SidebarMenu>
                {items.map((item) => {
                    const active = isActiveLink(item.url);
                    const activeClasses = active
                        ? 'bg-primary/10 dark:bg-primary/15 border-l-2 border-primary text-primary font-semibold shadow-[inset_0_0_12px_rgba(0,0,0,0.02)]'
                        : '';
                    return (
                        <SidebarMenuItem key={item.title}>
                            {isCollapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={active}
                                            className={`group-data-[collapsible=icon]:pointer-events-auto! group-data-[collapsible=icon]:w-full ${activeClasses}`}
                                        >
                                            <Link 
                                                href={item.url} 
                                                prefetch 
                                                className="flex items-center gap-2 w-full h-full pointer-events-auto"
                                            >
                                                {item.icon && <item.icon className={active ? 'text-primary' : ''} />}
                                                <span className={active ? 'text-primary' : ''}>{item.title}</span>
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
                                    isActive={active}
                                    className={`group-data-[collapsible=icon]:pointer-events-auto! group-data-[collapsible=icon]:w-full ${activeClasses}`}
                                >
                                    <Link 
                                        href={item.url} 
                                        prefetch 
                                        className="flex items-center gap-2 w-full h-full pointer-events-auto"
                                    >
                                        {item.icon && <item.icon className={active ? 'text-primary' : ''} />}
                                        <span className={active ? 'text-primary' : ''}>{item.title}</span>
                                    </Link>
                                </SidebarMenuButton>
                            )}
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
