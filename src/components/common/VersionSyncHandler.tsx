'use client';

import { useEffect } from 'react';

/**
 * VersionSyncHandler
 * 
 * This component listens for global errors and unhandled promise rejections.
 * If it detects a "Failed to find Server Action" error, it triggers a page reload.
 * This is necessary because Next.js Server Action IDs change between deployments,
 * and users with old pages open will encounter this error when they try to perform an action.
 */
export default function VersionSyncHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const message = 'reason' in event 
        ? (event.reason?.message || String(event.reason))
        : (event.error?.message || event.message);

      if (
        message && 
        (message.includes('Failed to find Server Action') || 
         message.includes('NEXT_NOT_FOUND_SERVER_ACTION'))
      ) {
        console.warn('Server Action mismatch detected. Reloading page for version sync...');
        window.location.reload();
      }
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleError);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, []);

  return null;
}
