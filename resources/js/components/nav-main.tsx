import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem, useSidebar } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

export function NavMain({ title, items = [] }: { title?: string; items: NavItem[] }) {
    const page = usePage();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed' || state === 'hidden';

    const isActiveLink = (itemUrl: string) => {
        return page.url === itemUrl || page.url.startsWith(itemUrl + '/');
    };
    
    return (
        <SidebarGroup className={`py-0 ${isCollapsed ? 'px-1 space-y-2' : 'px-2'}`}>
            {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
            <SidebarMenu className={isCollapsed ? 'gap-2 items-center' : ''}>
                {items.map((item) => {
                    const active = isActiveLink(item.url);
                    const activeClasses = active
                        ? isCollapsed
                            ? 'bg-primary/15 dark:bg-primary/20 text-primary font-semibold shadow-[0_0_12px_hsl(var(--primary)/0.15)]'
                            : 'bg-primary/10 dark:bg-primary/15 border-l-2 border-primary text-primary font-semibold shadow-[inset_0_0_12px_rgba(0,0,0,0.02)]'
                        : '';
                    return (
                        <SidebarMenuItem key={item.title} className={isCollapsed ? 'flex justify-center' : ''}>
                            {isCollapsed ? (
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <SidebarMenuButton 
                                            asChild 
                                            isActive={active}
                                            className={`group-data-[collapsible=icon]:pointer-events-auto! group-data-[collapsible=icon]:size-9! rounded-lg ${activeClasses}`}
                                        >
                                            <Link 
                                                href={item.url} 
                                                prefetch 
                                                className="flex items-center justify-center w-full h-full"
                                            >
                                                {item.icon && <item.icon className={`h-5 w-5 shrink-0 ${active ? 'text-primary' : ''}`} />}
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
