const PageLoader = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-0" style={{ backgroundColor: '#F97316' }}>
      {/* White spinner ring */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-7">
        <div className="absolute w-20 h-20 rounded-full border-4 border-white/25 border-t-white animate-spin" style={{ animationDuration: '1.2s' }} />
      </div>

      <p className="text-lg font-bold text-white tracking-tight">Collab Hunts</p>
      <p className="text-sm text-white/70 mt-1">Preparing your experience...</p>
    </div>
  );
};

export default PageLoader;
