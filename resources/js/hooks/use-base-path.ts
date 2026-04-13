import { usePage } from '@inertiajs/react';
import { useEffect } from 'react';

/**
 * Hook to get the base path for API calls based on current route
 * Returns '/admin' or '/super-admin' based on the current URL
 */
export function useBasePath() {
    const { url } = usePage();
    
    // Determine base path from current URL
    const basePath = url.startsWith('/super-admin') ? '/super-admin' : '/admin';
    
    return basePath;
}

/**
 * Hook to update breadcrumb hrefs dynamically
 */
export function useDynamicBreadcrumbs(baseBreadcrumbs: Array<{title: string, href: string}>) {
    const basePath = useBasePath();
    
    return baseBreadcrumbs.map(breadcrumb => ({
        ...breadcrumb,
        href: breadcrumb.href.replace('/admin', basePath)
    }));
}
