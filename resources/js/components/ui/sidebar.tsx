import { Slot } from '@radix-ui/react-slot';
import { VariantProps, cva } from 'class-variance-authority';
import { PanelLeft } from 'lucide-react';
import * as React from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useIsMobile } from '@/hooks/use-mobile';
import { cn } from '@/lib/utils';

const SIDEBAR_COOKIE_NAME = 'sidebar:state';
const SIDEBAR_MODE_COOKIE_NAME = 'sidebar:mode';
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = '16rem';
const SIDEBAR_WIDTH_MOBILE = '18rem';
const SIDEBAR_WIDTH_ICON = '4rem';
const SIDEBAR_KEYBOARD_SHORTCUT = 'b';
const SIDEBAR_WIDTH_STORAGE_KEY = 'sidebar:width';
const SIDEBAR_MIN_WIDTH = 180;
const SIDEBAR_MAX_WIDTH = 360;
const SIDEBAR_DEFAULT_WIDTH = 256; // 16rem
const SIDEBAR_ICON_WIDTH = 64; // 4rem
const SIDEBAR_COLLAPSE_THRESHOLD = 120;
const SIDEBAR_HIDE_THRESHOLD = 40;
const SIDEBAR_RESIZE_STEP = 16;

// Single source of truth for the shell animation so the rail, the floating panel,
// the inset content and every label animate on the exact same curve.
const SIDEBAR_MOTION = 'duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none';

type SidebarMode = 'expanded' | 'collapsed' | 'hidden';

type SidebarContext = {
    state: 'expanded' | 'collapsed' | 'hidden';
    sidebarMode: SidebarMode;
    open: boolean;
    setOpen: (open: boolean) => void;
    setSidebarMode: (mode: SidebarMode) => void;
    openMobile: boolean;
    setOpenMobile: (open: boolean) => void;
    isMobile: boolean;
    toggleSidebar: () => void;
    hideSidebar: () => void;
    showSidebar: () => void;
    customWidth: number | null;
    setCustomWidth: (width: number | null) => void;
    isResizing: boolean;
    setIsResizing: (resizing: boolean) => void;
};

const SidebarContext = React.createContext<SidebarContext | null>(null);

function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider.');
    }

    return context;
}

const SidebarProvider = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        defaultOpen?: boolean;
        open?: boolean;
        onOpenChange?: (open: boolean) => void;
    }
>(({ defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children, ...props }, ref) => {
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);

    // Custom sidebar width (persisted in localStorage)
    const [customWidth, _setCustomWidth] = React.useState<number | null>(() => {
        if (typeof window !== 'undefined') {
            const stored = localStorage.getItem(SIDEBAR_WIDTH_STORAGE_KEY);
            if (stored) {
                const parsed = parseInt(stored, 10);
                if (!isNaN(parsed) && parsed >= SIDEBAR_MIN_WIDTH && parsed <= SIDEBAR_MAX_WIDTH) return parsed;
            }
        }
        return null;
    });
    const setCustomWidth = React.useCallback((width: number | null) => {
        _setCustomWidth((prev) => (prev === width ? prev : width));
        if (width !== null) {
            localStorage.setItem(SIDEBAR_WIDTH_STORAGE_KEY, String(width));
        } else {
            localStorage.removeItem(SIDEBAR_WIDTH_STORAGE_KEY);
        }
    }, []);

    // Resize tracking
    const [isResizing, setIsResizing] = React.useState(false);

    // Three-state sidebar mode: expanded → collapsed → hidden → expanded
    const [_sidebarMode, _setSidebarMode] = React.useState<SidebarMode>(() => {
        if (typeof document !== 'undefined') {
            const cookie = document.cookie
                .split('; ')
                .find(row => row.startsWith(`${SIDEBAR_MODE_COOKIE_NAME}=`));
            if (cookie) {
                const value = cookie.split('=')[1];
                if (value === 'expanded' || value === 'collapsed' || value === 'hidden') return value;
            }
        }
        return 'expanded';
    });
    const sidebarMode = _sidebarMode;

    const setSidebarMode = React.useCallback(
        (value: SidebarMode | ((prev: SidebarMode) => SidebarMode)) => {
            const newMode = typeof value === 'function' ? value(sidebarMode) : value;
            // Guard against redundant writes: resizing calls this on every mouse move.
            if (newMode === sidebarMode) return;
            _setSidebarMode(newMode);
            document.cookie = `${SIDEBAR_MODE_COOKIE_NAME}=${newMode}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
        },
        [sidebarMode],
    );

    // Derive boolean open state from mode
    const open = openProp ?? (sidebarMode !== 'hidden' && sidebarMode !== 'collapsed');
    const setOpen = React.useCallback(
        (value: boolean | ((value: boolean) => boolean)) => {
            const openState = typeof value === 'function' ? value(open) : value;
            if (setOpenProp) {
                setOpenProp(openState);
            } else {
                setSidebarMode(openState ? 'expanded' : 'collapsed');
            }
        },
        [setOpenProp, open, setSidebarMode],
    );

    // Toggle between expanded and collapsed only
    const toggleSidebar = React.useCallback(() => {
        if (isMobile) {
            return setOpenMobile((open) => !open);
        }
        setSidebarMode((prev) => {
            if (prev === 'expanded') return 'collapsed';
            return 'expanded';
        });
    }, [isMobile, setOpenMobile, setSidebarMode]);

    // Hide the sidebar completely
    const hideSidebar = React.useCallback(() => {
        if (isMobile) {
            return setOpenMobile(false);
        }
        setSidebarMode('hidden');
    }, [isMobile, setOpenMobile, setSidebarMode]);

    // Show the sidebar (restore from hidden)
    const showSidebar = React.useCallback(() => {
        if (isMobile) {
            return setOpenMobile(true);
        }
        setSidebarMode('expanded');
    }, [isMobile, setOpenMobile, setSidebarMode]);

    // Listen for mobile navigation events
    React.useEffect(() => {
        const handleMobileNavigation = () => {
            if (isMobile) {
                setOpenMobile(false);
            }
        };

        window.addEventListener('mobile-navigation', handleMobileNavigation);
        return () => window.removeEventListener('mobile-navigation', handleMobileNavigation);
    }, [isMobile, setOpenMobile]);

    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT && (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [toggleSidebar]);

    // State derived from mode
    const state = sidebarMode;

    const contextValue = React.useMemo<SidebarContext>(
        () => ({
            state: sidebarMode,
            sidebarMode,
            open,
            setOpen,
            setSidebarMode,
            isMobile,
            openMobile,
            setOpenMobile,
            toggleSidebar,
            hideSidebar,
            showSidebar,
            customWidth,
            setCustomWidth,
            isResizing,
            setIsResizing,
        }),
        [sidebarMode, open, setOpen, setSidebarMode, isMobile, openMobile, setOpenMobile, toggleSidebar, hideSidebar, showSidebar, customWidth, setCustomWidth, isResizing, setIsResizing],
    );

    return (
        <SidebarContext.Provider value={contextValue}>
            <TooltipProvider delayDuration={0}>
                <div
                    style={
                        {
                            // Kept stable across every mode: collapsing uses --sidebar-width-icon and
                            // hiding uses a transform, so the expanded target never changes mid-animation.
                            '--sidebar-width': customWidth ? `${customWidth}px` : SIDEBAR_WIDTH,
                            '--sidebar-width-icon': SIDEBAR_WIDTH_ICON,
                            ...style,
                        } as React.CSSProperties
                    }
                    className={cn('group/sidebar-wrapper flex min-h-svh w-full has-data-[variant=inset]:bg-sidebar', className)}
                    ref={ref}
                    {...props}
                >
                    {children}
                </div>
            </TooltipProvider>
        </SidebarContext.Provider>
    );
});
SidebarProvider.displayName = 'SidebarProvider';

const Sidebar = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        side?: 'left' | 'right';
        variant?: 'sidebar' | 'floating' | 'inset';
        collapsible?: 'offcanvas' | 'icon' | 'none';
    }
>(({ side = 'left', variant = 'sidebar', collapsible = 'offcanvas', className, children, ...props }, ref) => {
    const { isMobile, state, openMobile, setOpenMobile, isResizing } = useSidebar();

    if (collapsible === 'none') {
        return (
            <div className={cn('flex h-full w-(--sidebar-width) flex-col bg-sidebar text-sidebar-foreground', className)} ref={ref} {...props}>
                {children}
            </div>
        );
    }

    if (isMobile) {
        return (
            <Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
                <SheetContent
                    data-sidebar="sidebar"
                    data-mobile="true"
                    className="w-(--sidebar-width) bg-sidebar p-0 text-sidebar-foreground data-[state=closed]:duration-[250ms] data-[state=open]:duration-[250ms] [&>button]:hidden"
                    style={
                        {
                            '--sidebar-width': SIDEBAR_WIDTH_MOBILE,
                        } as React.CSSProperties
                    }
                    side={side}
                >
                    <SheetTitle className="sr-only">Sidebar Navigation</SheetTitle>
                    <div className="flex h-full w-full flex-col">{children}</div>
                </SheetContent>
            </Sheet>
        );
    }

    return (
        <div
            ref={ref}
            className="group peer hidden text-sidebar-foreground md:block"
            data-state={state}
            data-collapsible={state === 'collapsed' ? collapsible : state === 'hidden' ? 'hidden' : ''}
            data-variant={variant}
            data-side={side}
        >
            {/* This is what handles the sidebar gap on desktop */}
            <div
                className={cn(
                    'relative h-svh w-(--sidebar-width) bg-transparent transition-[width]',
                    SIDEBAR_MOTION,
                    isResizing && 'transition-none',
                    'group-data-[collapsible=offcanvas]:w-0',
                    'group-data-[collapsible=hidden]:w-0',
                    'group-data-[side=right]:rotate-180',
                    'group-data-[collapsible=icon]:w-(--sidebar-width-icon)',
                )}
            />
            <div
                className={cn(
                    // Tailwind v4 emits the standalone `translate` property, so it (not `transform`)
                    // is what has to be transitioned here.
                    'fixed inset-y-0 z-10 hidden h-svh w-(--sidebar-width) transition-[width,translate,padding] md:flex',
                    SIDEBAR_MOTION,
                    isResizing && 'transition-none',
                    side === 'left' ? 'left-0' : 'right-0',
                    // Offcanvas / hidden: slide out with a transform instead of shrinking to
                    // width 0, so the panel content never reflows while it animates away.
                    side === 'left'
                        ? 'group-data-[collapsible=offcanvas]:-translate-x-full group-data-[collapsible=hidden]:-translate-x-full'
                        : 'group-data-[collapsible=offcanvas]:translate-x-full group-data-[collapsible=hidden]:translate-x-full',
                    'group-data-[collapsible=hidden]:pointer-events-none',
                    // Collapsed and variant sizing
                    variant === 'floating' || variant === 'inset'
                        ? 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[collapsible=icon]:p-1'
                        : 'group-data-[collapsible=icon]:w-(--sidebar-width-icon) group-data-[side=left]:border-r group-data-[side=right]:border-l',
                    className,
                )}
                {...props}
            >
                <div
                    data-sidebar="sidebar"
                    className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow-sm"
                >
                    {children}
                </div>
            </div>
        </div>
    );
});
Sidebar.displayName = 'Sidebar';

const SidebarTrigger = React.forwardRef<React.ElementRef<typeof Button>, React.ComponentProps<typeof Button>>(
    ({ className, onClick, ...props }, ref) => {
        const { toggleSidebar, sidebarMode } = useSidebar();

        return (
            <Button
                ref={ref}
                data-sidebar="trigger"
                variant="ghost"
                size="icon"
                className={cn('h-7 w-7', className)}
                onClick={(event) => {
                    onClick?.(event);
                    toggleSidebar();
                }}
                {...props}
            >
                {/* Small piece of state feedback: the icon flips to face the direction the
                    panel will open back up from, instead of staying static regardless of mode. */}
                <PanelLeft
                    className={cn(
                        'transition-transform duration-300 ease-out motion-reduce:transition-none',
                        sidebarMode !== 'expanded' && 'rotate-180',
                    )}
                />
                <span className="sr-only">Toggle Sidebar</span>
            </Button>
        );
    },
);
SidebarTrigger.displayName = 'SidebarTrigger';

const SidebarResizeHandle = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    const { toggleSidebar, setSidebarMode, customWidth, setCustomWidth, isResizing, setIsResizing, state } = useSidebar();
    const startXRef = React.useRef(0);
    const startWidthRef = React.useRef(SIDEBAR_DEFAULT_WIDTH);
    // Width before the drag started, restored when the drag ends in collapsed/hidden.
    const startCustomWidthRef = React.useRef<number | null>(null);
    // Unclamped width, used to detect the collapse/hide thresholds. The applied width is
    // clamped to [MIN, MAX], so comparing the clamped value would never reach a threshold.
    const rawWidthRef = React.useRef(SIDEBAR_DEFAULT_WIDTH);

    const handleMouseDown = React.useCallback(
        (e: React.MouseEvent) => {
            e.preventDefault();
            // Dragging can start from the collapsed rail too, so measure from the width on screen.
            const currentWidth = state === 'collapsed' ? SIDEBAR_ICON_WIDTH : (customWidth ?? SIDEBAR_DEFAULT_WIDTH);
            startXRef.current = e.clientX;
            startWidthRef.current = currentWidth;
            startCustomWidthRef.current = customWidth;
            rawWidthRef.current = currentWidth;
            setIsResizing(true);

            document.body.style.userSelect = 'none';
            document.body.style.cursor = 'col-resize';
        },
        [customWidth, setIsResizing, state],
    );

    React.useEffect(() => {
        if (!isResizing) return;

        const handleMouseMove = (e: MouseEvent) => {
            const rawWidth = startWidthRef.current + (e.clientX - startXRef.current);
            rawWidthRef.current = rawWidth;

            // Live feedback: past the threshold the sidebar follows the pointer, below it
            // snaps to the icon rail. Hiding is only committed on release to avoid flapping.
            if (rawWidth >= SIDEBAR_COLLAPSE_THRESHOLD) {
                setSidebarMode('expanded');
                setCustomWidth(Math.min(SIDEBAR_MAX_WIDTH, Math.max(SIDEBAR_MIN_WIDTH, rawWidth)));
            } else {
                setSidebarMode('collapsed');
            }
        };

        const handleMouseUp = () => {
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
            setIsResizing(false);

            const rawWidth = rawWidthRef.current;

            if (rawWidth < SIDEBAR_HIDE_THRESHOLD) {
                setSidebarMode('hidden');
                setCustomWidth(startCustomWidthRef.current);
            } else if (rawWidth < SIDEBAR_COLLAPSE_THRESHOLD) {
                setSidebarMode('collapsed');
                setCustomWidth(startCustomWidthRef.current);
            }
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
            document.body.style.userSelect = '';
            document.body.style.cursor = '';
        };
    }, [isResizing, setCustomWidth, setSidebarMode, setIsResizing]);

    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
            e.preventDefault();

            const step = e.key === 'ArrowLeft' ? -SIDEBAR_RESIZE_STEP : SIDEBAR_RESIZE_STEP;

            if (state === 'collapsed') {
                if (step > 0) setSidebarMode('expanded');
                return;
            }

            const next = (customWidth ?? SIDEBAR_DEFAULT_WIDTH) + step;
            if (next < SIDEBAR_MIN_WIDTH) {
                setSidebarMode('collapsed');
                return;
            }
            setCustomWidth(Math.min(SIDEBAR_MAX_WIDTH, next));
        },
        [customWidth, setCustomWidth, setSidebarMode, state],
    );

    return (
        <div
            ref={ref}
            data-sidebar="resize-handle"
            role="separator"
            aria-orientation="vertical"
            aria-label="Resize sidebar"
            tabIndex={0}
            onMouseDown={handleMouseDown}
            onDoubleClick={toggleSidebar}
            onKeyDown={handleKeyDown}
            className={cn(
                'absolute inset-y-0 z-20 hidden w-1 -translate-x-1/2 cursor-col-resize transition-colors',
                'hover:w-1.5 hover:bg-primary/20 active:bg-primary/30',
                'focus-visible:bg-primary/30 focus-visible:outline-none',
                isResizing && 'bg-primary/30',
                'group-data-[side=left]:-right-0.5 group-data-[side=right]:-left-0.5',
                'sm:flex',
                className,
            )}
            {...props}
        >
            <div className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2 rounded-full bg-sidebar-border opacity-0 transition-opacity hover:opacity-100" />
        </div>
    );
});
SidebarResizeHandle.displayName = 'SidebarResizeHandle';

// Backward-compatible alias
const SidebarRail = SidebarResizeHandle;

const SidebarInset = React.forwardRef<HTMLDivElement, React.ComponentProps<'main'>>(({ className, ...props }, ref) => {
    const { state } = useSidebar();

    return (
        <main
            ref={ref}
            className={cn(
                'relative flex min-h-svh flex-1 flex-col bg-background',
                'transition-[margin] ' + SIDEBAR_MOTION,
                'peer-data-[variant=inset]:min-h-[calc(100svh-(--spacing(4)))] md:peer-data-[variant=inset]:m-2 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow-sm',
                // Stacked peer variants would need two peer siblings to match, so the state
                // dependent margin is resolved here instead of in a compound selector.
                state === 'hidden' ? 'md:peer-data-[variant=inset]:ml-2' : 'md:peer-data-[variant=inset]:ml-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarInset.displayName = 'SidebarInset';

const SidebarInput = React.forwardRef<React.ElementRef<typeof Input>, React.ComponentProps<typeof Input>>(({ className, ...props }, ref) => {
    return (
        <Input
            ref={ref}
            data-sidebar="input"
            className={cn('h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring', className)}
            {...props}
        />
    );
});
SidebarInput.displayName = 'SidebarInput';

const SidebarHeader = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="header" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
});
SidebarHeader.displayName = 'SidebarHeader';

const SidebarFooter = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="footer" className={cn('flex flex-col gap-2 p-2', className)} {...props} />;
});
SidebarFooter.displayName = 'SidebarFooter';

const SidebarSeparator = React.forwardRef<React.ElementRef<typeof Separator>, React.ComponentProps<typeof Separator>>(
    ({ className, ...props }, ref) => {
        return <Separator ref={ref} data-sidebar="separator" className={cn('mx-2 w-auto bg-sidebar-border', className)} {...props} />;
    },
);
SidebarSeparator.displayName = 'SidebarSeparator';

const SidebarContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return (
        <div
            ref={ref}
            data-sidebar="content"
            // Stays scrollable when collapsed as well, otherwise long icon rails overflow
            // out of reach. Tooltips are portalled, so they are not clipped by this.
            className={cn('flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto overflow-x-hidden', className)}
            {...props}
        />
    );
});
SidebarContent.displayName = 'SidebarContent';

const SidebarGroup = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => {
    return <div ref={ref} data-sidebar="group" className={cn('relative flex w-full min-w-0 flex-col p-2', className)} {...props} />;
});
SidebarGroup.displayName = 'SidebarGroup';

const SidebarGroupLabel = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'> & { asChild?: boolean }>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'div';

        return (
            <Comp
                ref={ref}
                data-sidebar="group-label"
                className={cn(
                    'flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-hidden ring-sidebar-ring transition-[margin,opacity] focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                    SIDEBAR_MOTION,
                    'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarGroupLabel.displayName = 'SidebarGroupLabel';

const SidebarGroupAction = React.forwardRef<HTMLButtonElement, React.ComponentProps<'button'> & { asChild?: boolean }>(
    ({ className, asChild = false, ...props }, ref) => {
        const Comp = asChild ? Slot : 'button';

        return (
            <Comp
                ref={ref}
                data-sidebar="group-action"
                className={cn(
                    'absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-hidden ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0',
                    // Increases the hit area of the button on mobile.
                    'after:absolute after:-inset-2 md:after:hidden',
                    'group-data-[collapsible=icon]:hidden',
                    className,
                )}
                {...props}
            />
        );
    },
);
SidebarGroupAction.displayName = 'SidebarGroupAction';

const SidebarGroupContent = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div ref={ref} data-sidebar="group-content" className={cn('w-full text-sm', className)} {...props} />
));
SidebarGroupContent.displayName = 'SidebarGroupContent';

const SidebarMenu = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
    <ul ref={ref} data-sidebar="menu" className={cn('flex w-full min-w-0 flex-col gap-1', className)} {...props} />
));
SidebarMenu.displayName = 'SidebarMenu';

const SidebarMenuItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ className, ...props }, ref) => (
    <li
        ref={ref}
        data-sidebar="menu-item"
        className={cn(
            'group/menu-item relative',
            // Signature affordance: a left accent bar grows in behind whichever item is
            // active. It reads identically whether the sidebar is expanded or collapsed to
            // icons, so "where am I" never depends on label text being visible. Driven by
            // :has() off the button's own data-active, so no extra markup or state wiring
            // is needed at the call site.
            'before:absolute before:left-0 before:top-1/2 before:h-0 before:w-[3px] before:-translate-y-1/2 before:rounded-r-full before:bg-primary before:transition-[height] before:duration-200 before:ease-out motion-reduce:before:transition-none has-data-[active=true]:before:h-5',
            className,
        )}
        {...props}
    />
));
SidebarMenuItem.displayName = 'SidebarMenuItem';

const sidebarMenuButtonVariants = cva(
    'peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm text-sidebar-foreground/80 outline-none ring-sidebar-ring transition-[padding,color] focus-visible:ring-2 active:text-primary disabled:pointer-events-none disabled:opacity-50 group-has-data-[sidebar=menu-action]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[state=open]:text-sidebar-foreground [&>svg]:size-4 [&>svg]:shrink-0 ' +
        // No background on hover or active — the row stays flat, and only the foreground
        // shifts. The icon and label both pick this up for free since they inherit
        // currentColor, so they change together without separate selectors. Active pairs
        // this with the accent bar on SidebarMenuItem, using the same `text-primary` so
        // bar and text read as one signal. Resting text is dimmed slightly (/80) so the
        // color shift on hover/active reads as a real change rather than nothing happening.
        'data-[active=true]:font-medium data-[active=true]:text-primary data-[active=false]:hover:text-sidebar-foreground ' +
        // The label is assumed to be the last child <span>. Flex items default to
        // `min-width: auto`, meaning a long label refuses to shrink below its own content
        // width no matter how narrow the button becomes — the button's real box then
        // extends past what's visually clipped by the panel's `overflow-hidden`, so the
        // hoverable/clickable area silently drifts away from the visible icon. `min-w-0`
        // is what actually lets the flex item shrink; `flex-1` gives `truncate` a definite
        // width to clip against instead of relying on ambient overflow.
        '[&>span:last-child]:min-w-0 [&>span:last-child]:flex-1 [&>span:last-child]:truncate [&>span:last-child]:transition-[width,opacity,margin] [&>span:last-child]:duration-[250ms] ' +
        // Collapsed: the button stays w-full (matching the visible icon rail exactly — no
        // hidden overflow, no offset hacks needed) and the icon is centred with a plain
        // `justify-center` now that the label can genuinely collapse to 0 width instead of
        // just fading out while still occupying layout space.
        'group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:gap-0 group-data-[collapsible=icon]:px-2 group-data-[collapsible=icon]:[&>span:last-child]:w-0 group-data-[collapsible=icon]:[&>span:last-child]:opacity-0 group-data-[collapsible=icon]:[&>span:last-child]:ml-0 ' +
        SIDEBAR_MOTION,
    {
        variants: {
            variant: {
                default: '',
                outline:
                    'bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]',
            },
            size: {
                default: 'h-8 text-sm',
                sm: 'h-7 text-xs',
                lg: 'h-12 text-sm',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'default',
        },
    },
);

const SidebarMenuButton = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        isActive?: boolean;
        tooltip?: string | React.ComponentProps<typeof TooltipContent>;
    } & VariantProps<typeof sidebarMenuButtonVariants>
>(({ asChild = false, isActive = false, variant = 'default', size = 'default', tooltip, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    const { isMobile, state } = useSidebar();

    // The button's box now always matches its visible bounds (see sidebarMenuButtonVariants),
    // so the tooltip no longer needs a measured, per-instance offset compensation — a small
    // fixed gap from the rail is enough.
    const button = (
        <Comp
            ref={ref}
            data-sidebar="menu-button"
            data-size={size}
            data-active={isActive}
            className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
            {...props}
        />
    );

    if (!tooltip) {
        return button;
    }

    if (typeof tooltip === 'string') {
        tooltip = {
            children: tooltip,
        };
    }

    return (
        <Tooltip>
            <TooltipTrigger asChild>{button}</TooltipTrigger>
            <TooltipContent side="right" align="center" sideOffset={8} hidden={state !== 'collapsed' || isMobile} {...tooltip} />
        </Tooltip>
    );
});
SidebarMenuButton.displayName = 'SidebarMenuButton';

const SidebarMenuAction = React.forwardRef<
    HTMLButtonElement,
    React.ComponentProps<'button'> & {
        asChild?: boolean;
        showOnHover?: boolean;
    }
>(({ className, asChild = false, showOnHover = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-action"
            className={cn(
                'absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
                // Increases the hit area of the button on mobile.
                'after:absolute after:-inset-2 md:after:hidden',
                'peer-data-[size=sm]/menu-button:top-1',
                'peer-data-[size=default]/menu-button:top-1.5',
                'peer-data-[size=lg]/menu-button:top-2.5',
                'group-data-[collapsible=icon]:hidden',
                showOnHover &&
                    'group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuAction.displayName = 'SidebarMenuAction';

const SidebarMenuBadge = React.forwardRef<HTMLDivElement, React.ComponentProps<'div'>>(({ className, ...props }, ref) => (
    <div
        ref={ref}
        data-sidebar="menu-badge"
        className={cn(
            'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground',
            'peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
            'peer-data-[size=sm]/menu-button:top-1',
            'peer-data-[size=default]/menu-button:top-1.5',
            'peer-data-[size=lg]/menu-button:top-2.5',
            'group-data-[collapsible=icon]:hidden',
            className,
        )}
        {...props}
    />
));
SidebarMenuBadge.displayName = 'SidebarMenuBadge';

const SidebarMenuSkeleton = React.forwardRef<
    HTMLDivElement,
    React.ComponentProps<'div'> & {
        showIcon?: boolean;
    }
>(({ className, showIcon = false, ...props }, ref) => {
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);

    return (
        <div ref={ref} data-sidebar="menu-skeleton" className={cn('flex h-8 items-center gap-2 rounded-md px-2', className)} {...props}>
            {showIcon && <Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon" />}
            <Skeleton
                className="h-4 max-w-(--skeleton-width) flex-1"
                data-sidebar="menu-skeleton-text"
                style={
                    {
                        '--skeleton-width': width,
                    } as React.CSSProperties
                }
            />
        </div>
    );
});
SidebarMenuSkeleton.displayName = 'SidebarMenuSkeleton';

const SidebarMenuSub = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(({ className, ...props }, ref) => (
    <ul
        ref={ref}
        data-sidebar="menu-sub"
        className={cn(
            'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5',
            'group-data-[collapsible=icon]:hidden',
            className,
        )}
        {...props}
    />
));
SidebarMenuSub.displayName = 'SidebarMenuSub';

const SidebarMenuSubItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(({ ...props }, ref) => <li ref={ref} {...props} />);
SidebarMenuSubItem.displayName = 'SidebarMenuSubItem';

const SidebarMenuSubButton = React.forwardRef<
    HTMLAnchorElement,
    React.ComponentProps<'a'> & {
        asChild?: boolean;
        size?: 'sm' | 'md';
        isActive?: boolean;
    }
>(({ asChild = false, size = 'md', isActive, className, ...props }, ref) => {
    const Comp = asChild ? Slot : 'a';

    return (
        <Comp
            ref={ref}
            data-sidebar="menu-sub-button"
            data-size={size}
            data-active={isActive}
            className={cn(
                'flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground/80 outline-hidden ring-sidebar-ring transition-colors hover:text-sidebar-foreground focus-visible:ring-2 active:text-primary disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
                'data-[active=true]:font-medium data-[active=true]:text-primary',
                size === 'sm' && 'text-xs',
                size === 'md' && 'text-sm',
                'group-data-[collapsible=icon]:hidden',
                className,
            )}
            {...props}
        />
    );
});
SidebarMenuSubButton.displayName = 'SidebarMenuSubButton';

export {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupAction,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInput,
    SidebarInset,
    SidebarMenu,
    SidebarMenuAction,
    SidebarMenuBadge,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSkeleton,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
    SidebarProvider,
    SidebarRail,
    SidebarResizeHandle,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar,
};
