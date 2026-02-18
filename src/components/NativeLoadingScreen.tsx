export function NativeLoadingScreen() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 safe-area-top safe-area-bottom" style={{ backgroundColor: '#F97316' }}>
      {/* White spinner ring */}
      <div className="relative flex items-center justify-center w-20 h-20 mb-8">
        <div className="absolute w-20 h-20 rounded-full border-4 border-white/25 border-t-white animate-spin" style={{ animationDuration: '1.2s' }} />
      </div>

      <h1 className="text-xl font-bold text-white tracking-tight">Collab Hunts</h1>
      <p className="text-white/70 text-sm mt-1">Preparing your experience...</p>
    </div>
  );
}

export default NativeLoadingScreen;
