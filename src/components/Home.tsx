import React from 'react';
import { motion } from 'motion/react';
import { Calendar, FileText, Settings, ArrowRight, Sparkles, Download, Users, BookOpen } from 'lucide-react';

interface HomeProps {
  onStart: (view: string) => void;
}

export function Home({ onStart }: HomeProps) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 overflow-hidden relative pb-20">
      {/* Background Decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute top-[20%] -right-[10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />
        <div className="absolute -bottom-[10%] left-[20%] w-[60%] h-[60%] rounded-full bg-emerald-400/10 blur-[120px]" />
      </div>

      {/* Navbar */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-xl text-white shadow-lg shadow-blue-600/20">
            <Calendar size={24} />
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-800">Kaldik Jabar</span>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 relative z-10">
        <motion.div 
          className="text-center max-w-3xl mx-auto mb-16"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-6">
            <Sparkles size={16} />
            <span>Generator Kalender Pendidikan Modern</span>
          </motion.div>
          
          <motion.h1 variants={itemVariants} className="text-4xl md:text-6xl font-extrabold tracking-tight text-gray-900 mb-6 leading-[1.1]">
            Pilih Jenis <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-emerald-600">
              Kalender Pendidikan
            </span>
          </motion.h1>
          
          <motion.p variants={itemVariants} className="text-lg text-gray-600 leading-relaxed max-w-2xl mx-auto">
            Pilih menu di bawah ini untuk membuat Kalender Pendidikan Umum untuk sekolah, atau Kalender khusus Administrasi Guru Kelas (Kelas 1 - 6).
          </motion.p>
        </motion.div>

        {/* Selection Cards */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* General Calendar Card */}
          <motion.div 
            variants={itemVariants} 
            onClick={() => onStart('app')}
            className="lg:col-span-1 bg-white p-8 rounded-3xl border border-blue-100 shadow-xl shadow-blue-900/5 hover:shadow-blue-900/10 hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 transition-transform group-hover:scale-110" />
            <div className="w-16 h-16 bg-blue-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-600/30">
              <Calendar size={32} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Kalender Umum</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              Kalender pendidikan standar untuk tingkat sekolah. Dilengkapi fitur ekspor ke Word (A4/F4).
            </p>
            <div className="flex items-center text-blue-600 font-semibold group-hover:gap-2 transition-all">
              Buka Aplikasi <ArrowRight size={20} className="ml-1" />
            </div>
          </motion.div>

          {/* Teacher Calendars Grid */}
          <motion.div variants={itemVariants} className="lg:col-span-2 bg-white p-8 rounded-3xl border border-emerald-100 shadow-xl shadow-emerald-900/5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Kalender Guru Kelas</h3>
                <p className="text-gray-500 text-sm">Lengkap dengan Analisis Hari Efektif & Jadwal Pelajaran</p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {[1, 2, 3, 4, 5, 6].map((grade) => (
                <button
                  key={grade}
                  onClick={() => onStart(`teacher-${grade}`)}
                  className="flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                >
                  <BookOpen size={28} className="text-gray-400 group-hover:text-emerald-600 mb-2 transition-colors" />
                  <span className="font-semibold text-gray-700 group-hover:text-emerald-700">Kelas {grade}</span>
                </button>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}

