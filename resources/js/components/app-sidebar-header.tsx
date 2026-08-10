import { Breadcrumbs } from '@/components/breadcrumbs';
import { ThemePicker } from '@/components/theme-picker';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RealTimeNotifications } from '@/components/real-time-notifications';
import { UserMenuContent } from '@/components/user-menu-content';
import { useInitials } from '@/hooks/use-initials';
import { type SharedData, getFullName } from '@/types';
import { usePage } from '@inertiajs/react';
import { Search, MessageSquare, ChevronDown, Calendar, PanelLeft, PanelLeftClose, PanelLeftOpen, PanelRight } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    const getInitials = useInitials();
    const fullName = getFullName(auth.user);
    const isAdmin = auth.user.role?.name === 'admin';
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const { state, toggleSidebar, hideSidebar, showSidebar } = useSidebar();
    const isHidden = state === 'hidden';
    const isCollapsed = state === 'collapsed';

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    return (
        <header className="header-glass sticky top-0 z-50 flex h-16 shrink-0 items-center gap-2 border-b px-6 md:px-4">
            <div className="flex items-center gap-2">
                {/* One stable control group in every state, so the header never reflows on toggle. */}
                <div className="glass-surface flex items-center rounded-lg p-0.5">
                    {/* Collapse / Expand toggle */}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={toggleSidebar}
                                    aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                                        'hover:bg-primary/15 hover:text-primary',
                                        isCollapsed && 'bg-primary/10 text-primary',
                                    )}
                                >
                                    {isCollapsed || isHidden
                                        ? <PanelRight className="h-3.5 w-3.5" />
                                        : <PanelLeft className="h-3.5 w-3.5" />
                                    }
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isCollapsed || isHidden ? 'Expand' : 'Collapse'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Thin divider */}
                    <div className="mx-0.5 h-4 w-px bg-border dark:bg-foreground/25" />

                    {/* Hide / Show sidebar */}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button
                                    onClick={isHidden ? showSidebar : hideSidebar}
                                    aria-label={isHidden ? 'Show sidebar' : 'Hide sidebar'}
                                    className={cn(
                                        'flex h-7 w-7 items-center justify-center rounded-md transition-colors',
                                        'hover:bg-primary/15 hover:text-primary',
                                        isHidden && 'bg-primary/10 text-primary',
                                    )}
                                >
                                    {isHidden
                                        ? <PanelLeftOpen className="h-3.5 w-3.5" />
                                        : <PanelLeftClose className="h-3.5 w-3.5" />
                                    }
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>{isHidden ? 'Show Sidebar' : 'Hide Sidebar'}</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                </div>
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            <div className="ml-auto flex items-center gap-3">
                {/* Search Bar */}
                <div className={cn(
                    'relative transition-all duration-300',
                    searchOpen ? 'w-64' : 'w-9'
                )}>
                    {searchOpen ? (
                        <div className="glass-surface flex items-center rounded-xl">
                            <Search className="ml-3 h-4 w-4 shrink-0 text-muted-foreground" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder="Search anything..."
                                className="h-9 w-full bg-transparent px-3 text-sm outline-none placeholder:text-muted-foreground"
                                onBlur={() => setSearchOpen(false)}
                            />
                            <kbd className="mr-2 rounded-md border bg-muted/50 px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">ESC</kbd>
                        </div>
                    ) : (
                        <button
                            onClick={() => setSearchOpen(true)}
                            className="glass-surface flex h-9 w-9 items-center justify-center rounded-xl transition-colors hover:bg-primary/10 hover:text-primary"
                        >
                            <Search className="h-4 w-4" />
                        </button>
                    )}
                </div>

                {/* Action Icons Container */}
                <div className="glass-surface flex items-center gap-1 rounded-xl px-1.5 py-1">
                    {/* Activity Calendar - Admin only */}
                    {isAdmin && (
                        <TooltipProvider delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <Link
                                        href="/admin/calendar"
                                        className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Calendar className="h-4 w-4" />
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent><p>Activity Calendar</p></TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )}

                    {/* Messages */}
                    <TooltipProvider delayDuration={0}>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <button className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-primary/10 hover:text-primary">
                                    <MessageSquare className="h-4 w-4" />
                                </button>
                            </TooltipTrigger>
                            <TooltipContent><p>Messages</p></TooltipContent>
                        </Tooltip>
                    </TooltipProvider>

                    {/* Notifications */}
                    <RealTimeNotifications compact />
                </div>

                {/* Theme Picker */}
                <ThemePicker />

                {/* User Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="glass-surface flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 transition-colors hover:bg-primary/10">
                            <Avatar className="h-7 w-7 overflow-hidden rounded-full">
                                <AvatarImage src={auth.user.avatar} alt={fullName} />
                                <AvatarFallback className="rounded-full bg-primary/10 text-primary text-xs font-semibold">
                                    {getInitials(fullName)}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden flex-col items-start md:flex">
                                <span className="text-xs font-semibold leading-tight">{fullName}</span>
                                <span className="text-[10px] leading-tight text-muted-foreground">{auth.user.email}</span>
                            </div>
                            <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground md:block" />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-60" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
