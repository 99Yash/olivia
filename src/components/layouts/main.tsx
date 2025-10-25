import { SidebarProvider } from '~/components/ui/sidebar';

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <SidebarProvider>
      <div className="h-svh relative lg:p-2 w-full flex flex-col overflow-hidden">
        <div className="lg:border lg:rounded-md flex flex-col bg-background w-full h-full">
          <div className="flex-1 overflow-auto">
            <div className="pointer-events-none absolute -left-32 -top-32 h-64 w-64 rounded-full bg-linear-to-br from-rose-400/25 via-pink-400/15 to-transparent blur-3xl dark:from-rose-500/40 dark:via-pink-500/25" />

            {/* Decorative gradient burst - top right */}
            <div className="pointer-events-none absolute -right-32 -top-40 h-80 w-80 rounded-full bg-linear-to-bl from-violet-400/25 via-purple-400/15 to-transparent blur-3xl dark:from-violet-500/40 dark:via-purple-500/25" />

            {/* Decorative gradient burst - bottom left */}
            <div className="pointer-events-none absolute -bottom-32 -left-40 h-80 w-80 rounded-full bg-linear-to-tr from-cyan-400/25 via-sky-400/15 to-transparent blur-3xl dark:from-cyan-500/40 dark:via-sky-500/25" />

            {/* Decorative gradient burst - bottom right */}
            <div className="pointer-events-none absolute -bottom-40 -right-32 h-72 w-72 rounded-full bg-linear-to-tl from-fuchsia-400/25 via-pink-400/15 to-transparent blur-3xl dark:from-fuchsia-500/40 dark:via-pink-500/25" />

            {/* Decorative gradient burst - center top */}
            <div className="pointer-events-none absolute left-1/2 top-0 -translate-x-1/2 h-96 w-96 rounded-full bg-linear-to-b from-indigo-400/20 via-blue-400/12 to-transparent blur-3xl dark:from-indigo-500/35 dark:via-blue-500/20" />

            {/* Decorative gradient burst - center left */}
            <div className="pointer-events-none absolute left-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-r from-amber-400/15 via-orange-400/8 to-transparent blur-3xl dark:from-amber-500/30 dark:via-orange-500/15" />

            {/* Decorative gradient burst - center right */}
            <div className="pointer-events-none absolute right-1/4 top-1/2 -translate-y-1/2 h-80 w-80 rounded-full bg-linear-to-l from-green-400/15 via-emerald-400/8 to-transparent blur-3xl dark:from-green-500/30 dark:via-emerald-500/15" />
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}
