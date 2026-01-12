import NavPill from "@/components/ui/nav-pill";
import {getTranslations} from "next-intl/server";

export default async function AppLayout({
    children,
    params
}: {
    children: React.ReactNode,
    params: Promise<{locale: string}>;
}) {
    const { locale } = await params;
    const t = await getTranslations('Layout');

    return <>
        {/* HEADER */}
        <header className="sticky top-0 z-50 pointer-events-none">
            <div className="relative pointer-events-none flex items-center justify-center h-16 px-4">
                <div className="pointer-events-auto absolute left-1/2 -translate-x-1/2 top-2">
                    <NavPill
                        logoSrc="/star.svg"
                        brandName="ROPAgen"
                        links={[
                            {name: t("generate"), href: "/generate"}
                        ]}
                        locale={locale}
                    />
                </div>
            </div>
        </header>

        {/* MAIN CONTENT */}
        <main className="flex-grow">{children}</main>
    </>
}