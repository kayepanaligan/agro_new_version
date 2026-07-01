import { useSidebar } from '@/components/ui/sidebar';

export default function AppLogo() {
    const { state } = useSidebar();
    const isCollapsed = state === 'collapsed' || state === 'hidden';

    return (
        <>
            <img
                src="/agroprofiler_logo.png"
                alt="AgroProfiler"
                className="size-8 rounded-md object-contain"
            />
            {!isCollapsed && (
                <div className="ml-1 grid flex-1 text-left text-sm">
                    <span className="mb-0.5 truncate leading-none font-semibold">AgroProfiler</span>
                </div>
            )}
        </>
    );
}
