import { Metadata } from 'next';
import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { OAuthButtons } from '~/app/(auth)/signin/oauth-buttons';
import { auth } from '~/lib/auth/server';
import { siteConfig } from '~/lib/site';
import { EmailSignIn } from './email-signin';

export const metadata = {
  title: 'Sign in',
  description: `Sign in to your account to continue to ${siteConfig.name}`,
} satisfies Metadata;

export default async function AuthenticationPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (session?.user) {
    redirect('/');
  }

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">
          Sign in to your account or create a new one
        </p>
      </div>
      <div className="grid gap-6">
        <div className="space-y-1">
          <OAuthButtons />
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>
        <div className="space-y-1">
          <EmailSignIn />
        </div>
      </div>
    </div>
  );
}
