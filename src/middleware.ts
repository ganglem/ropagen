import {NextRequest, NextResponse} from 'next/server';
import {createServerClient} from '@supabase/ssr';
import createIntlMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

const handleI18nRouting = createIntlMiddleware(routing);

const PROTECTED_ROUTES = ['/generate', '/profile'];
const OVERWRITTEN_PROTECTED_ROUTES_AS_PUBLIC = ['/generate/ask', '/generate/chat', '/generate/form'];

function stripLocale(pathname: string) {
    const [, first, ...rest] = pathname.split('/');
    if (routing.locales.includes(first as (typeof routing)['locales'][number])) {
        const restPath = '/' + rest.join('/');
        return restPath === '/' ? '/' : restPath;
    }
    return pathname;
}

function getLocale(pathname: string) {
    const match = routing.locales.find(
        (l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`)
    );
    return match ?? routing.defaultLocale;
}

export async function middleware(request: NextRequest) {
    const i18nResponse = handleI18nRouting(request);

    let supabaseResponse = NextResponse.next({request});
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll();
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({name, value}) => request.cookies.set(name, value));
                    supabaseResponse = NextResponse.next({request});
                    cookiesToSet.forEach(({name, value, options}) =>
                        supabaseResponse.cookies.set(name, value, options)
                    );
                }
            }
        }
    );

    const {data} = await supabase.auth.getClaims();
    const user = data?.claims;

    if (i18nResponse.status >= 300 && i18nResponse.status < 400) {
        return i18nResponse;
    }

    const pathname = request.nextUrl.pathname;
    const locale = getLocale(pathname);
    const pathWithoutLocale = stripLocale(pathname);

    const isProtected = PROTECTED_ROUTES.some(
        (route) =>
            pathWithoutLocale === route ||
            pathWithoutLocale.startsWith(`${route}/`)
    ) && !OVERWRITTEN_PROTECTED_ROUTES_AS_PUBLIC.some(
        (route) =>
            pathWithoutLocale === route ||
            pathWithoutLocale.startsWith(`${route}/`)
    );

    const isAuthPath =
        pathWithoutLocale.startsWith('/auth') || pathWithoutLocale.startsWith('/login');

    if (isProtected && !user && !isAuthPath) {
        const url = request.nextUrl.clone();
        url.pathname = `/${locale}/auth/login`;
        url.searchParams.set('next', pathname + request.nextUrl.search);
        const redirectToLogin = NextResponse.redirect(url);
        return redirectToLogin;
    }

    return i18nResponse;
}

export const config = {
    matcher: ['/((?!api|trpc|_next|_vercel|.*\\..*).*)']
};
