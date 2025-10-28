"use client"

import Link from "next/link";
import { Button } from "./ui/button";
import { LogoutButton } from "./logout-button";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js"

interface AuthButtonProps {
    locale: string;
}

export function AuthButtonClient({ locale }: AuthButtonProps) {
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

    return user ? (
        <div className="flex items-center gap-4">
            Hey, {user.email}!
            <LogoutButton />
        </div>
    ) : (
        <div className="flex gap-2">
            <Button asChild size="sm" variant={"outline"}>
                <Link href={`/${locale}/auth/login`}>Sign in</Link>
            </Button>
            <Button asChild size="sm" variant={"default"}>
                <Link href={`/${locale}/auth/sign-up`}>Sign up</Link>
            </Button>
        </div>
    );
}
