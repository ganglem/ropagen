import { source } from '@/lib/source';
import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { baseOptions } from '@/lib/layout.shared';
import {RootProvider} from "fumadocs-ui/provider";

export const dynamic = 'force-dynamic';

// @ts-ignore
export default function Layout({ children }: LayoutProps<'/docs'>) {
    return <div className="overscroll-y-hidden">
        <RootProvider>
            <DocsLayout tree={source.pageTree} {...baseOptions}>
                {children}
            </DocsLayout>
        </RootProvider>
    </div>
}