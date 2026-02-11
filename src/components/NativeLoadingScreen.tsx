export function NativeLoadingScreen() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Spinning ring with logo */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-7">
        <div className="absolute w-24 h-24 rounded-full border-4 border-primary/15 border-t-primary border-r-primary/40 animate-spin" />
        <img src="/app-icon.png" alt="Collab Hunts" className="w-14 h-14 rounded-full object-cover" />
      </div>

      <h1 className="text-xl font-bold text-foreground tracking-tight">Collab Hunts</h1>
      <p className="text-muted-foreground text-sm mt-1">Preparing your experience...</p>
    </div>
  );
}

export default NativeLoadingScreen;
