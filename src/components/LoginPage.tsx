import React, { useState } from 'react';
import { signInWithGoogle } from '../firebase';
import { Calendar as CalendarIcon, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage({ onLoginSuccess }: { onLoginSuccess?: () => void }) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      if (onLoginSuccess) {
        onLoginSuccess();
      }
    } catch (err: any) {
      console.error("Login error:", err);
      if (err.code === 'auth/unauthorized-domain') {
        setError("Domain ini belum diizinkan di Firebase. Tambahkan domain ini ke daftar Authorized Domains di Firebase Console.");
      } else if (err.code === 'auth/popup-closed-by-user') {
        setError("Login dibatalkan. Silakan coba lagi.");
      } else {
        setError(err.message || "Terjadi kesalahan saat login. Silakan coba lagi.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center p-4 selection:bg-blue-100 selection:text-blue-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white p-8 sm:p-10 rounded-2xl shadow-xl max-w-md w-full text-center border border-gray-100"
      >
        <div className="bg-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-200">
          <CalendarIcon size={32} className="text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Kaldik Jabar</h1>
        <p className="text-gray-500 mb-8">Generator Kalender Pendidikan & Administrasi Guru</p>
        
        <button
          onClick={handleLogin}
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 px-6 py-3.5 rounded-xl text-base font-semibold transition-all shadow-sm disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          ) : (
            <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          )}
          {isLoading ? 'Memproses...' : 'Masuk dengan Google'}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-left">
            <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}
        
        <p className="mt-8 text-sm text-gray-400">
          Silakan masuk untuk mulai membuat dan menyimpan pengaturan kalender Anda.
        </p>
      </motion.div>
    </div>
  );
}
