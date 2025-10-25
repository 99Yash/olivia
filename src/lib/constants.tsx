import z from 'zod';
import { GitHub, Google } from '~/components/ui/icons';

export const authOptionsSchema = z.enum(['EMAIL', 'GOOGLE', 'GITHUB']);
export type AuthOptionsType = z.infer<typeof authOptionsSchema>;

export const LOCAL_STORAGE_SCHEMAS = {
  LAST_AUTH_METHOD: authOptionsSchema,
} as const;

export type LocalStorageKey = keyof typeof LOCAL_STORAGE_SCHEMAS;

export type LocalStorageValue<K extends LocalStorageKey> = z.infer<
  (typeof LOCAL_STORAGE_SCHEMAS)[K] & z.ZodTypeAny
>;

interface OAuthProvider {
  id: string;
  name: string;
  icon?: React.ComponentType<{ className?: string }>;
}

export const OAUTH_PROVIDERS: Record<
  Lowercase<Exclude<AuthOptionsType, 'EMAIL'>>,
  OAuthProvider
> = {
  github: {
    id: 'github',
    name: 'GitHub',
    icon: GitHub,
  },
  google: {
    id: 'google',
    name: 'Google',
    icon: Google,
  },
} as const;

export type OAuthProviderId = keyof typeof OAUTH_PROVIDERS;

export const getProviderById = (
  id: OAuthProviderId
): OAuthProvider | undefined => {
  return OAUTH_PROVIDERS[id];
};

// File Upload Constants
export const FILE_UPLOAD = {
  // File size limits (in bytes)
  SIZE_LIMITS: {
    IMAGE: 4 * 1024 * 1024, // 4MB
    RESUME: 8 * 1024 * 1024, // 8MB
  } as const,

  // File size limits (as strings for UploadThing)
  SIZE_LIMITS_STRING: {
    IMAGE: '4MB' as const,
    RESUME: '8MB' as const,
  },

  // File count limits
  COUNT_LIMITS: {
    IMAGE: 1,
    RESUME: 1,
  },

  // Supported file types
  TYPES: {
    IMAGE: {
      ACCEPT: 'image/*',
      MIME_TYPES: [
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
    },
    RESUME: {
      ACCEPT:
        'application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      MIME_TYPES: [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
    },
  },

  // Upload endpoints
  ENDPOINTS: {
    IMAGE: 'imageUploader',
    RESUME: 'resumeUploader',
  },
} as const;

// Helper functions for file size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};
