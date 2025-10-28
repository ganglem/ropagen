"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";

export function SignUpForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const t = useTranslations("Authentication");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [repeatPassword, setRepeatPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const params = useParams();
  const locale = params.locale as string;

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Client-side validation
    if (password !== repeatPassword) {
      setError(t("errors.passwordsDontMatch"));
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError(t("errors.passwordTooShort"));
      setIsLoading(false);
      return;
    }

    if (!firstName.trim() || !lastName.trim()) {
      setError(t("errors.nameRequired"));
      setIsLoading(false);
      return;
    }

    try {
      const supabase = createClient();

      // Log environment check (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log('Supabase URL configured:', !!process.env.NEXT_PUBLIC_SUPABASE_URL);
        console.log('Supabase Key configured:', !!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY);
      }

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/${locale}/generate`,
          data: {
            first_name: firstName.trim(),
            last_name: lastName.trim(),
            full_name: `${firstName.trim()} ${lastName.trim()}`,
          },
        },
      });

      if (signUpError) {
        console.error('Supabase signup error:', signUpError);
        throw signUpError;
      }

      if (!data.user) {
        throw new Error('No user data returned from signup');
      }

      // Check if email confirmation is required
      if (data.user && !data.session) {
        // Email confirmation required
        router.push(`/${locale}/auth/sign-up-success`);
      } else if (data.session) {
        // Auto-confirmed, redirect to generate page
        router.push(`/${locale}/generate`);
      }
    } catch (error: any) {
      console.error('Sign up error:', error);

      // Provide more specific error messages
      let errorMessage = t("errors.generalError");

      if (error.message) {
        errorMessage = error.message;
      }

      // Handle specific Supabase error codes
      if (error.status === 422) {
        errorMessage = t("errors.invalidEmail");
      } else if (error.status === 429) {
        errorMessage = t("errors.tooManyRequests");
      } else if (error.message?.includes('User already registered')) {
        errorMessage = t("errors.userAlreadyRegistered");
      } else if (error.message?.includes('Database error') || error.message?.includes('Unable to validate email')) {
        errorMessage = t("errors.databaseError");
      } else if (error.message?.includes('Invalid API key')) {
        errorMessage = t("errors.invalidApiKey");
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">{t("signUp")}</CardTitle>
          <CardDescription>{t("createNewAccount")}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSignUp}>
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="first-name">{t("firstName")}</Label>
                  <Input
                    id="first-name"
                    type="text"
                    placeholder={t("firstNamePlaceholder")}
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="last-name">{t("lastName")}</Label>
                  <Input
                    id="last-name"
                    type="text"
                    placeholder={t("lastNamePlaceholder")}
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder={t("emailPlaceholder")}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="password">{t("password")}</Label>
                </div>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder={t("passwordMinLength")}
                />
              </div>
              <div className="grid gap-2">
                <div className="flex items-center">
                  <Label htmlFor="repeat-password">{t("repeatPassword")}</Label>
                </div>
                <Input
                  id="repeat-password"
                  type="password"
                  required
                  minLength={6}
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  disabled={isLoading}
                  placeholder={t("passwordMinLength")}
                />
              </div>
              {error && (
                <div className="text-sm text-red-500 bg-red-50 dark:bg-red-950/20 p-3 rounded-md border border-red-200 dark:border-red-800">
                  {error}
                </div>
              )}
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? t("creatingAccount") : t("signUp")}
              </Button>
            </div>
            <div className="mt-4 text-center text-sm">
              {t("alreadyHaveAccount")}{" "}
              <Link href={`/${locale}/auth/login`} className="underline underline-offset-4">
                {t("login")}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
