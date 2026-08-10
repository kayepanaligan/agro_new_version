import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ title, items = [] }: { title?: string; items: NavItem[] }) {
    const page = usePage();

    const isActiveLink = (itemUrl: string) => {
        return page.url === itemUrl || page.url.startsWith(itemUrl + '/');
    };

    return (
        // Collapsed styling is driven entirely by the sidebar's data attributes so the markup
        // stays identical in every state — no remounting of links while the panel animates.
        // Padding and gaps stay constant: the buttons centre themselves on the rail, so there is
        // nothing here that needs to move, and an un-transitioned gap change snapped every item
        // to new spacing the instant the toggle was pressed.
        <SidebarGroup className="px-2 py-0">
            {title && <SidebarGroupLabel>{title}</SidebarGroupLabel>}
            <SidebarMenu className="gap-1">
                {items.map((item) => {
                    const active = isActiveLink(item.url);

                    return (
                        <SidebarMenuItem key={item.title}>
                            <SidebarMenuButton
                                asChild
                                isActive={active}
                                tooltip={item.title}
                                className={cn(
                                    'rounded-lg',
                                    active &&
                                        // The active indicator is an inset shadow rather than a border so
                                        // it never changes the item's box size mid-transition, and it is
                                        // kept identical in both states so nothing repaints on toggle.
                                        'bg-primary/10 font-semibold text-primary shadow-[inset_2px_0_0_0_currentcolor] dark:bg-primary/15',
                                )}
                            >
                                <Link href={item.url} prefetch>
                                    {item.icon && <item.icon className={active ? 'text-primary' : undefined} />}
                                    <span>{item.title}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    );
                })}
            </SidebarMenu>
        </SidebarGroup>
    );
}
