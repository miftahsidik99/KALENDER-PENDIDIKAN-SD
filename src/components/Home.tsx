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
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-6xl mx-auto mb-12"
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
                <h3 className="text-2xl font-bold text-gray-900">Kalender Pendidik</h3>
                <p className="text-gray-500 text-sm">Lengkap dengan Analisis Hari Efektif & Jadwal Pelajaran</p>
              </div>
            </div>
            
            <div className="mb-4">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Guru Kelas</h4>
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
            </div>

            <div className="mt-8 border-t border-gray-100 pt-6">
              <h4 className="text-sm font-semibold text-gray-500 mb-3 uppercase tracking-wider">Guru Mata Pelajaran</h4>
              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                <button
                  onClick={() => onStart('subject-paibp')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <BookOpen size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="font-semibold text-sm text-center text-gray-700 group-hover:text-indigo-700">Guru PAIBP</span>
                </button>
                <button
                  onClick={() => onStart('subject-pjok')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <BookOpen size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="font-semibold text-sm text-center text-gray-700 group-hover:text-indigo-700">Guru PJOK</span>
                </button>
                <button
                  onClick={() => onStart('subject-ipas')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <BookOpen size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="font-semibold text-sm text-center text-gray-700 group-hover:text-indigo-700">Guru IPAS</span>
                </button>
                <button
                  onClick={() => onStart('subject-bahasa inggris')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <BookOpen size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="font-semibold text-sm text-center text-gray-700 group-hover:text-indigo-700">Guru B. Inggris</span>
                </button>
                <button
                  onClick={() => onStart('subject-kka')}
                  className="flex flex-col items-center justify-center p-3 rounded-2xl border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-all group"
                >
                  <BookOpen size={24} className="text-gray-400 group-hover:text-indigo-600 mb-2 transition-colors" />
                  <span className="font-semibold text-sm text-center text-gray-700 group-hover:text-indigo-700">Guru KKA</span>
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Matriks Regulasi Kurikulum Card */}
        <motion.div
          className="max-w-6xl mx-auto"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[2px] rounded-3xl shadow-2xl shadow-purple-900/20 hover:shadow-purple-900/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-white p-8 rounded-[22px] relative z-10 h-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4">
                  <FileText size={14} />
                  <span>Dokumen Penting</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                  Matriks Regulasi Kurikulum <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-pink-600">Periode (2023–2026)</span>
                </h3>
                <p className="text-gray-600 mb-6 md:mb-0">
                  Akses kumpulan dokumen regulasi kurikulum terbaru yang disusun berdasarkan tahun pelajaran untuk memudahkan referensi Anda.
                </p>
              </div>
              <div className="flex flex-col w-full md:w-auto gap-3">
                <a 
                  href="https://drive.google.com/drive/folders/1fIe8bQ6ZBdBD6YpLOUufZmy51eo25YjJ?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-xl transition-colors border border-indigo-100 hover:border-indigo-200"
                >
                  <span>Regulasi 2023-2024</span>
                  <ArrowRight size={18} />
                </a>
                <a 
                  href="https://drive.google.com/drive/folders/1tKtcrz1PbimTvPK54uAPneiKsoNhOSkF?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-purple-50 hover:bg-purple-100 text-purple-700 font-semibold rounded-xl transition-colors border border-purple-100 hover:border-purple-200"
                >
                  <span>Regulasi 2024-2025</span>
                  <ArrowRight size={18} />
                </a>
                <a 
                  href="https://drive.google.com/drive/folders/1GyQpND_Nv0faRXvyQtl0vI7RU2zz30c7?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-pink-50 hover:bg-pink-100 text-pink-700 font-semibold rounded-xl transition-colors border border-pink-100 hover:border-pink-200"
                >
                  <span>Regulasi 2025-2026</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Kalender Acuan Card */}
        <motion.div
          className="max-w-6xl mx-auto mt-8"
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <div className="bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 p-[2px] rounded-3xl shadow-2xl shadow-teal-900/20 hover:shadow-teal-900/40 transition-all duration-500 group relative overflow-hidden">
            <div className="absolute inset-0 bg-white/20 backdrop-blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="bg-white p-8 rounded-[22px] relative z-10 h-full flex flex-col md:flex-row items-center gap-8">
              <div className="flex-1">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-wider mb-4">
                  <Calendar size={14} />
                  <span>Referensi Resmi</span>
                </div>
                <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3 leading-tight">
                  Kalender Acuan Provinsi Jabar <br className="hidden md:block" />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-cyan-600">Periode (2023–2026)</span>
                </h3>
                <p className="text-gray-600 mb-6 md:mb-0">
                  Akses dokumen kalender pendidikan acuan resmi dari Provinsi Jawa Barat untuk berbagai tahun pelajaran.
                </p>
              </div>
              <div className="flex flex-col w-full md:w-auto gap-3">
                <a 
                  href="https://drive.google.com/file/d/1mJe05go6Ukno3vADex0hMdIbw0tTyEWa/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-semibold rounded-xl transition-colors border border-emerald-100 hover:border-emerald-200"
                >
                  <span>Acuan 2023-2024</span>
                  <ArrowRight size={18} />
                </a>
                <a 
                  href="https://drive.google.com/file/d/115lt2W6slpsvKXxnjW-Q9_tpKl5cQGY1/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-teal-50 hover:bg-teal-100 text-teal-700 font-semibold rounded-xl transition-colors border border-teal-100 hover:border-teal-200"
                >
                  <span>Acuan 2024-2025</span>
                  <ArrowRight size={18} />
                </a>
                <a 
                  href="https://drive.google.com/file/d/10Xd_kDqepu8ZGSey5O4_jwrhNa6cDzvj/view?usp=sharing" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-between gap-4 px-6 py-3 bg-cyan-50 hover:bg-cyan-100 text-cyan-700 font-semibold rounded-xl transition-colors border border-cyan-100 hover:border-cyan-200"
                >
                  <span>Acuan 2025-2026</span>
                  <ArrowRight size={18} />
                </a>
              </div>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
}

