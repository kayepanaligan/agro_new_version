import { router } from '@inertiajs/react';

/**
 * Cleanup all Radix UI dialog overlays from DOM
 * This should be called on page navigation to prevent invisible overlays blocking clicks
 */
export function cleanupDialogOverlays(): void {
    // Force close all open dialogs
    const openDialogs = document.querySelectorAll('[data-state="open"]');
    openDialogs.forEach(dialog => {
        const dialogElement = dialog as HTMLElement;
        // Trigger Radix UI's close mechanism
        if (dialogElement.dataset.state === 'open') {
            dialogElement.setAttribute('data-state', 'closed');
        }
    });

    // Remove any orphaned overlays after a short delay
    setTimeout(() => {
        const overlays = document.querySelectorAll('[data-radix-dialog-overlay]');
        overlays.forEach(overlay => {
            const overlayElement = overlay as HTMLElement;
            // Only remove if it's not currently being used (has no active dialog)
            const hasActiveDialog = document.querySelector('[data-radix-dialog-content][data-state="open"]');
            if (!hasActiveDialog) {
                overlay.remove();
            }
        });
    }, 100);
}

/**
 * Setup global dialog cleanup on Inertia navigation
 * Call this once in your main app component or layout
 */
export function setupInertiaDialogCleanup(): void {
    // Listen for Inertia navigation events
    router.on('navigate', () => {
        cleanupDialogOverlays();
    });
}
