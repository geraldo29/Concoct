import { Amplify } from 'aws-amplify';

/**
 * AWS configuration is read from VITE_-prefixed environment variables.
 * These come from `cdk deploy`'s outputs (see DEPLOY.md).
 */
const region = import.meta.env.VITE_AWS_REGION as string | undefined;
const userPoolId = import.meta.env.VITE_AWS_USER_POOL_ID as string | undefined;
const userPoolClientId = import.meta.env.VITE_AWS_USER_POOL_CLIENT_ID as string | undefined;

export const API_URL = (import.meta.env.VITE_AWS_API_URL as string | undefined) ?? '';

export function isAwsConfigured(): boolean {
  return Boolean(region && userPoolId && userPoolClientId && API_URL);
}

let configured = false;

export function ensureAmplifyConfigured(): boolean {
  if (configured) return true;
  if (!isAwsConfigured()) return false;

  Amplify.configure({
    Auth: {
      Cognito: {
        userPoolId: userPoolId!,
        userPoolClientId: userPoolClientId!,
        loginWith: { email: true },
        signUpVerificationMethod: 'code',
      },
    },
  });

  configured = true;
  return true;
}
