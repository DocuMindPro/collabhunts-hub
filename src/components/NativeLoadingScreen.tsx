import { Loader2 } from 'lucide-react';

/**
 * A branded loading screen for native mobile apps.
 * Shows the app logo and a loading spinner while the app initializes.
 */
export function NativeLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* App Logo/Branding */}
      <div className="mb-8">
        <div className="w-24 h-24 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
          <span className="text-4xl font-bold text-primary-foreground">CH</span>
        </div>
      </div>
      
      {/* App Name */}
      <h1 className="text-2xl font-bold text-foreground mb-2">
        CollabHunts
      </h1>
      <p className="text-muted-foreground mb-8">
        Creators
      </p>
      
      {/* Loading Spinner */}
      <Loader2 className="w-8 h-8 text-primary animate-spin" />
      
      {/* Loading Text */}
      <p className="text-sm text-muted-foreground mt-4">
        Loading...
      </p>
    </div>
  );
}

export default NativeLoadingScreen;
