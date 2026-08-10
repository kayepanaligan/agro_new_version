export default function AppLogo() {
    return (
        <>
            {/* `max-w-none` is load-bearing: preflight's `img{max-width:100%}` would otherwise clamp
                this to the button's content box, which is narrower than 32px on the collapsed rail.
                That both shrank the logo mid-animation and left it 2px off the centre the nav icons
                and the user avatar sit on. */}
            <img
                src="/agroprofiler_logo.png"
                alt="AgroProfiler"
                className="size-8 max-w-none shrink-0 rounded-md object-contain"
            />
            {/* Hidden via the sidebar's own data attribute so this also works outside a sidebar.
                `flex-1` (basis 0) lets the width follow the button's animating width smoothly. */}
            <div className="ml-1 grid min-w-0 flex-1 overflow-hidden text-left text-sm transition-opacity duration-[250ms] ease-[cubic-bezier(0.32,0.72,0,1)] group-data-[collapsible=icon]:opacity-0 motion-reduce:transition-none">
                <span className="mb-0.5 truncate leading-none font-semibold">AgroProfiler</span>
            </div>
        </>
    );
}
