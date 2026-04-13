/**
 * Utility to create super admin page wrappers
 * This HOC allows reusing admin pages with super-admin breadcrumbs and URLs
 */
import { type ComponentType } from 'react';

export function createSuperAdminPage<T extends Record<string, any>>(
    AdminPage: ComponentType<T>,
    title: string,
    basePath: string
) {
    // Return the admin page component directly
    // The actual URL routing is handled by the backend controller
    // and the frontend router calls
    return AdminPage;
}
