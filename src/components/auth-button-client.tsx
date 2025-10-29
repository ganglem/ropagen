"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js"
import { useTranslations } from "next-intl";

interface AuthButtonProps {
    locale: string;
}

export function AuthButtonClient({ locale }: AuthButtonProps) {
    const t = useTranslations("Authentication");
    const [user, setUser] = useState<User | null>(null);
    const supabase = createClient();

    useEffect(() => {
        const getUser = async () => {
            const { data } = await supabase.auth.getUser();
            setUser(data.user);
        };

        getUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, [supabase]);

    // Get user's first and last name from metadata
    const firstName = user?.user_metadata?.first_name;
    const lastName = user?.user_metadata?.last_name;
    const fullName = firstName && lastName ? `${firstName} ${lastName}` : user?.email;

    return user ? (
        <div className="flex items-center gap-4">
            {t("greeting")}, {fullName}!
            <LogoutButton />
        </div>
    ) : (
        <div className="flex gap-2">
            <Button asChild size="sm" variant={"outline"}>
                <Link href={`/${locale}/auth/login`}>{t("signIn")}</Link>
            </Button>
        </div>
    );
}
