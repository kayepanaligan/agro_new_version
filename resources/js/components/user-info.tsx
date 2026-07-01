import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSidebar } from '@/components/ui/sidebar';
import { useInitials } from '@/hooks/use-initials';
import { type User, getFullName } from '@/types';

export function UserInfo({ user, showEmail = false }: { user: User; showEmail?: boolean }) {
    const getInitials = useInitials();
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed' || state === 'hidden';
    const fullName = getFullName(user);

    return (
        <>
            <Avatar className="h-8 w-8 overflow-hidden rounded-full">
                <AvatarImage src={user.avatar} alt={fullName} />
                <AvatarFallback className="rounded-lg bg-neutral-200 text-black dark:bg-neutral-700 dark:text-white">
                    {getInitials(fullName)}
                </AvatarFallback>
            </Avatar>
            {!isCollapsed && (
                <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{fullName}</span>
                    {showEmail && <span className="text-muted-foreground truncate text-xs">{user.email}</span>}
                </div>
            )}
        </>
    );
}
