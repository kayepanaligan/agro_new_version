import * as AvatarPrimitive from '@radix-ui/react-avatar';
import * as React from 'react';

import { cn } from '@/lib/utils';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

const Avatar = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Root>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Root>>(
    ({ className, ...props }, ref) => (
        <AvatarPrimitive.Root ref={ref} className={cn('relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full', className)} {...props} />
    ),
);
Avatar.displayName = AvatarPrimitive.Root.displayName;

const AvatarImage = React.forwardRef<React.ElementRef<typeof AvatarPrimitive.Image>, React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Image>>(
    ({ className, ...props }, ref) => <AvatarPrimitive.Image ref={ref} className={cn('aspect-square h-full w-full', className)} {...props} />,
);
AvatarImage.displayName = AvatarPrimitive.Image.displayName;

const AvatarFallback = React.forwardRef<
    React.ElementRef<typeof AvatarPrimitive.Fallback>,
    React.ComponentPropsWithoutRef<typeof AvatarPrimitive.Fallback>
>(({ className, ...props }, ref) => (
    <AvatarPrimitive.Fallback
        ref={ref}
        className={cn('flex h-full w-full items-center justify-center rounded-full bg-green-500 text-white font-semibold', className)}
        {...props}
    />
));
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;

// Avatar Group Components
const AvatarGroup = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex -space-x-2', className)} {...props} />
));
AvatarGroup.displayName = 'AvatarGroup';

const AvatarGroupCount = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { users?: Array<{ user: any }> }>(
    ({ className, users, children, ...props }, ref) => {
        const count = users ? users.length : 0;
        return (
            <TooltipProvider delayDuration={0}>
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span
                            ref={ref}
                            className={cn(
                                'flex h-7 w-7 items-center justify-center rounded-full border-2 border-background bg-background/80 backdrop-blur-sm text-xs font-medium cursor-pointer hover:bg-background transition-colors shadow-sm',
                                className,
                            )}
                            {...props}
                        >
                            {children || `+${count}`}
                        </span>
                    </TooltipTrigger>
                    {users && users.length > 0 && (
                        <TooltipContent side="top" className="max-w-xs z-50 px-3 py-2">
                            <div className="space-y-1">
                                <p className="text-xs font-semibold">Updating Users</p>
                                <ul className="text-xs space-y-0.5">
                                    {users.map((u, idx) => (
                                        <li key={idx}>
                                            {u.user.first_name} {u.user.last_name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </TooltipContent>
                    )}
                </Tooltip>
            </TooltipProvider>
        );
    },
);
AvatarGroupCount.displayName = 'AvatarGroupCount';

export { Avatar, AvatarFallback, AvatarImage, AvatarGroup, AvatarGroupCount };
