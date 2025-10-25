'use client';

import { User as BetterAuthUser } from 'better-auth';
import { Check, LogOut, Shield } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { toast } from 'sonner';
import { authClient } from '~/lib/auth/client';
import { getErrorMessage } from '~/lib/errors';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Spinner } from '../ui/spinner';

export function UserDropdown({ user }: { user: BetterAuthUser }) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    try {
      setIsLoading(true);
      await authClient.signOut();
      router.push('/');
      setIsOpen(false);
    } catch (error) {
      toast.error(getErrorMessage(error));
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ''} alt={user.name || ''} />
            <AvatarFallback className="bg-primary text-primary-foreground">
              {getInitials(user.name || 'User')}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80 p-0" align="end" forceMount>
        {/* User Profile Section */}
        <div className="flex items-center gap-3 p-4 pb-3">
          <div className="relative">
            <Avatar className="h-12 w-12">
              <AvatarImage src={user.image || ''} alt={user.name || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(user.name || 'User')}
              </AvatarFallback>
            </Avatar>
            {user.emailVerified && (
              <div className="absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full bg-green-500 border-2 border-background flex items-center justify-center">
                <Check className="h-2.5 w-2.5 text-white" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <Badge
                variant={user.emailVerified ? 'default' : 'outline'}
                className={`text-xs px-1.5 py-0.5 h-5 ${
                  user.emailVerified
                    ? 'bg-green-500 hover:bg-green-500 text-white'
                    : 'text-amber-600 border-amber-200'
                }`}
              >
                {user.emailVerified ? (
                  <>
                    <Shield className="h-3 w-3 mr-1" />
                    Verified
                  </>
                ) : (
                  'Unverified'
                )}
              </Badge>
            </div>
            <p className="text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </div>

        <DropdownMenuSeparator />

        <div className="p-2">
          <DropdownMenuItem
            className="cursor-pointer text-red-600 focus:text-red-600"
            onClick={handleSignOut}
            disabled={isLoading}
          >
            {isLoading ? (
              <Spinner className="mr-2 h-4 w-4" />
            ) : (
              <LogOut className="mr-2 h-4 w-4" />
            )}
            <span>Log out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
