'use client';

import * as React from 'react';
import { OAuthButtons } from '~/app/(auth)/signin/oauth-buttons';
import { EmailSignIn } from './email-signin';

export default function AuthenticationPage() {
  const [isSignUp, setIsSignUp] = React.useState(false);

  return (
    <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          {isSignUp ? 'Create an account' : 'Welcome back'}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isSignUp
            ? 'Create a new account to get started'
            : 'Sign in to your account or create a new one'}
        </p>
      </div>
      <div className="grid gap-6">
        <div className="space-y-1">
          <OAuthButtons isSignUp={isSignUp} />
        </div>

        <div className="flex items-center gap-4">
          <div className="flex-1 border-t" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="flex-1 border-t" />
        </div>
        <div className="space-y-1">
          <EmailSignIn
            isSignUp={isSignUp}
            onToggleMode={() => setIsSignUp(!isSignUp)}
          />
        </div>
      </div>
    </div>
  );
}
