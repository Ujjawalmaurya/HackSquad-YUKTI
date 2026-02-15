'use client';

import { usePathname } from 'next/navigation';

export default function MainContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();

    // Pages where sidebar is hidden
    const noSidebarPages = ['/', '/login', '/signup'];
    const hasSidebar = !noSidebarPages.includes(pathname);

    return (
        <main className={`flex-1 p-8 ${hasSidebar ? 'lg:ml-72' : ''}`}>
            {children}
        </main>
    );
}
