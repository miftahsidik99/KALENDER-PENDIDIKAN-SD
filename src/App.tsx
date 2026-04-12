import React, { useState, useEffect } from 'react';
import { SchoolForm } from './components/SchoolForm';
import { CalendarView } from './components/CalendarView';
import { exportToWord } from './lib/exportWord';
import { Download, Calendar as CalendarIcon, Settings, FileText, ArrowLeft, Save } from 'lucide-react';
import { motion } from 'motion/react';
import { Home } from './components/Home';
import { TeacherCalendarApp } from './components/TeacherCalendarApp';
import { AuthButton } from './components/AuthButton';
import { useSchoolCalendarData } from './lib/useCalendarData';
import { LoginPage } from './components/LoginPage';
import { auth } from './firebase';
import { onAuthStateChanged, User } from 'firebase/auth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [currentView, setCurrentView] = useState<string>('home');
  const [startYear, setStartYear] = useState<number>(new Date().getFullYear());
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setIsAuthChecking(false);
    });
    return () => unsubscribe();
  }, []);

  const { 
    schoolDays, setSchoolDays, 
    identity, setIdentity, 
    holidays, setHolidays, 
    saveSchoolData, isSaving 
  } = useSchoolCalendarData(startYear);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToWord(identity, startYear, holidays, paperSize);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Terjadi kesalahan saat mengekspor dokumen.");
    } finally {
      setIsExporting(false);
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <LoginPage onLoginSuccess={() => setCurrentView('home')} />;
  }

  if (currentView === 'home') {
    return <Home onStart={(view) => setCurrentView(view)} />;
  }

  if (currentView.startsWith('teacher-')) {
    const grade = parseInt(currentView.split('-')[1], 10);
    return <TeacherCalendarApp grade={grade} onBack={() => setCurrentView('home')} />;
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20"
    >
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentView('home')}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg text-white hidden sm:block">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold leading-tight">Kaldik Jabar</h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">Generator Kalender Pendidikan</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <AuthButton />
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'A4' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperSize('F4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'F4' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                F4
              </button>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {isExporting ? <span className="animate-pulse">Mengekspor...</span> : <><Download size={18} /> <span className="hidden sm:inline">Unduh Word</span></>}
            </button>
            <button
              onClick={saveSchoolData}
              disabled={isSaving}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {isSaving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={18} /> <span className="hidden sm:inline">Simpan</span></>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar - Configuration */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white p-6 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-2 mb-4">
                <Settings size={20} className="text-gray-400" />
                <h2 className="text-lg font-semibold text-gray-800">Pengaturan Kalender</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Tahun Pelajaran</label>
                  <select
                    value={startYear}
                    onChange={(e) => setStartYear(Number(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  >
                    {[2023, 2024, 2025, 2026, 2027].map(year => (
                      <option key={year} value={year}>{year}/{year + 1}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-600 mb-2">Hari Belajar Efektif</label>
                  <select
                    value={schoolDays}
                    onChange={(e) => setSchoolDays(Number(e.target.value) as 5 | 6)}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50"
                  >
                    <option value={6}>6 Hari (Senin - Sabtu)</option>
                    <option value={5}>5 Hari (Senin - Jum'at)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <SchoolForm identity={identity} onChange={setIdentity} />
            </motion.div>
          </div>

          {/* Right Content - Preview */}
          <div className="lg:col-span-8">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  {identity.name}
                </h2>
                <p className="text-gray-600 mt-1">{identity.address}, {identity.city}</p>
              </div>

              <CalendarView startYear={startYear} holidays={holidays} schoolDays={schoolDays} onChangeHolidays={setHolidays} />

              {/* Legend / Keterangan */}
              <div className="mt-12 border-t border-gray-100 pt-8">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800">Keterangan Hari Libur & Agenda</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {holidays.map(holiday => (
                    <div key={holiday.id} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-sm mt-1 shrink-0" style={{ backgroundColor: holiday.color }} />
                      <div>
                        <p className="text-sm font-medium text-gray-800">{holiday.description}</p>
                        <p className="text-xs text-gray-500">
                          {new Date(holiday.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}
                          {holiday.endDate && ` - ${new Date(holiday.endDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long' })}`}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
          
        </div>
      </main>
    </motion.div>
  );
}

