import { Capacitor } from '@capacitor/core';
import { useNavigate } from 'react-router-dom';

const NativeDebugButton = () => {
  const navigate = useNavigate();
  
  // Only show on native platforms
  if (!Capacitor.isNativePlatform()) {
    return null;
  }

  return (
    <button
      onClick={() => navigate('/debug')}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '50px',
        height: '50px',
        borderRadius: '50%',
        backgroundColor: '#f97316',
        color: '#fff',
        border: 'none',
        fontSize: '24px',
        zIndex: 99999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        cursor: 'pointer',
      }}
    >
      🔧
    </button>
  );
};

export default NativeDebugButton;
