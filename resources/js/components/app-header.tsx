import { Breadcrumbs } from '@/components/breadcrumbs';
import { Icon } from '@/components/icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { NavigationMenu, NavigationMenuItem, NavigationMenuList, navigationMenuTriggerStyle } from '@/components/ui/navigation-menu';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { UserMenuContent } from '@/components/user-menu-content';
import { RealTimeNotifications } from '@/components/real-time-notifications';
import { useInitials } from '@/hooks/use-initials';
import { cn } from '@/lib/utils';
import { type BreadcrumbItem, type NavItem, type SharedData, getFullName } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Menu, Search, MessageSquare, ChevronDown } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import AppLogo from './app-logo';
import AppLogoIcon from './app-logo-icon';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        url: '/dashboard',
        icon: LayoutGrid,
    },
];

const rightNavItems: NavItem[] = [
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

const activeItemStyles = 'text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100';

interface AppHeaderProps {
    breadcrumbs?: BreadcrumbItem[];
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
    const page = usePage<SharedData>();
    const { auth } = page.props;
    const getInitials = useInitials();
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);
    const fullName = getFullName(auth.user);

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    return (
        <>
            <div className="border-sidebar-border/80 border-b">
                <div className="mx-auto flex h-16 items-center px-4 md:max-w-7xl">
                    {/* Mobile Menu */}
                    <div className="lg:hidden">
                        <Sheet>
                            <SheetTrigger asChild>
                                <Button variant="ghost" size="icon" className="mr-2 h-[34px] w-[34px]">
                                    <Menu className="h-5 w-5" />
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="flex h-full w-64 flex-col items-stretch justify-between bg-sidebar">
                                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                                <SheetHeader className="flex justify-start text-left">
                                    <AppLogoIcon className="h-6 w-6 fill-current text-black dark:text-white" />
                                </SheetHeader>
                                <div className="mt-6 flex h-full flex-1 flex-col space-y-4">
                                    <div className="flex h-full flex-col justify-between text-sm">
                                        <div className="flex flex-col space-y-4">
                                            {mainNavItems.map((item) => (
                                                <Link key={item.title} href={item.url} className="flex items-center space-x-2 font-medium">
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </Link>
                                            ))}
                                        </div>

                                        <div className="flex flex-col space-y-4">
                                            {rightNavItems.map((item) => (
                                                <a
                                                    key={item.title}
                                                    href={item.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center space-x-2 font-medium"
                                                >
                                                    {item.icon && <Icon iconNode={item.icon} className="h-5 w-5" />}
                                                    <span>{item.title}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </SheetContent>
                        </Sheet>
                    </div>

                    <Link href="/dashboard" prefetch className="flex items-center space-x-2">
                        <AppLogo />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="ml-6 hidden h-full items-center space-x-6 lg:flex">
                        <NavigationMenu className="flex h-full items-stretch">
                            <NavigationMenuList className="flex h-full items-stretch space-x-2">
                                {mainNavItems.map((item, index) => (
                                    <NavigationMenuItem key={index} className="relative flex h-full items-center">
                                        <Link
                                            href={item.url}
                                            className={cn(
                                                navigationMenuTriggerStyle(),
                                                page.url === item.url && activeItemStyles,
                                                'h-9 cursor-pointer px-3',
                                            )}
                                        >
                                            {item.icon && <Icon iconNode={item.icon} className="mr-2 h-4 w-4" />}
                                            {item.title}
                                        </Link>
                                        {page.url === item.url && (
                                            <div className="absolute bottom-0 left-0 h-0.5 w-full translate-y-px bg-black dark:bg-white"></div>
                                        )}
                                    </NavigationMenuItem>
                                ))}
                            </NavigationMenuList>
                        </NavigationMenu>
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
                                    <div className="hidden flex-col items-start lg:flex">
                                        <span className="text-xs font-semibold leading-tight">{fullName}</span>
                                        <span className="text-[10px] leading-tight text-muted-foreground">{auth.user.email}</span>
                                    </div>
                                    <ChevronDown className="hidden h-3.5 w-3.5 text-muted-foreground lg:block" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-60" align="end">
                                <UserMenuContent user={auth.user} />
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </div>
            {breadcrumbs.length > 1 && (
                <div className="border-sidebar-border/70 flex w-full border-b">
                    <div className="mx-auto flex h-12 w-full items-center justify-start px-4 text-neutral-500 md:max-w-7xl">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            )}
        </>
    );
}
