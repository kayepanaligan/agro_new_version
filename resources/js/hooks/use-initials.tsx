export function useInitials() {
    const getInitials = (fullName: string | null | undefined): string => {
        if (!fullName || typeof fullName !== 'string') return '';
        
        const names = fullName.trim().split(' ').filter(n => n.length > 0);

        if (names.length === 0) return '';
        if (names.length === 1) return names[0].charAt(0).toUpperCase();

        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    };

    return getInitials;
}
