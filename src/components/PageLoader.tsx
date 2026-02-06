const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-0">
      {/* Spinning ring with camera emoji */}
      <div className="relative flex items-center justify-center w-24 h-24 mb-7">
        <div className="absolute w-24 h-24 rounded-full border-4 border-primary/15 border-t-primary border-r-primary/40 animate-spin" />
        <span className="text-4xl animate-pulse">📸</span>
      </div>

      <p className="text-lg font-bold text-foreground tracking-tight">CollabHunts</p>
      <p className="text-sm text-muted-foreground mt-1">Preparing your experience...</p>
    </div>
  );
};

export default PageLoader;
