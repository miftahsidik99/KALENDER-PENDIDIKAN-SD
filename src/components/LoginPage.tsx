import React from 'react';
import { signInWithGoogle } from '../firebase';
import { Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';

export function LoginPage() {
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
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center gap-3 bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 text-gray-700 px-6 py-3.5 rounded-xl text-base font-semibold transition-all shadow-sm"
        >
          <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
          Masuk dengan Google
        </button>
        
        <p className="mt-8 text-sm text-gray-400">
          Silakan masuk untuk mulai membuat dan menyimpan pengaturan kalender Anda.
        </p>
      </motion.div>
    </div>
  );
}
