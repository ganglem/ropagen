import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { useTranslations } from "next-intl";

interface AuthButtonProps {
    locale: string;
}

export async function AuthButton({ locale }: AuthButtonProps) {
  const t = await useTranslations("Authentication");
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

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
      <Button asChild size="sm" variant={"default"}>
        <Link href={`/${locale}/auth/sign-up`}>{t("signUp")}</Link>
      </Button>
    </div>
  );
}
