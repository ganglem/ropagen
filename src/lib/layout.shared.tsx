import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';

export function baseOptions(): BaseLayoutProps {
    return {
        nav: {
            title: 'ROPAgen Documentation',
            transparentMode: 'none',
        },
        sidebar: {
            // Disable theme toggle in sidebar
            banner: undefined,
        },
        // Disable theme toggle completely
        disableThemeSwitch: true,
    };
}