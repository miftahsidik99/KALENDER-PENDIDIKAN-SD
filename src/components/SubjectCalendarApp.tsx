import React, { useState, useEffect } from 'react';
import { Download, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { motion } from 'motion/react';
import { CalendarView } from './CalendarView';
import { SubjectEffectiveDaysAnalysis } from './SubjectEffectiveDaysAnalysis';
import { useSchoolCalendarData } from '../lib/useCalendarData';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ScheduleItem } from '../types';
import { exportSubjectWord } from '../lib/exportSubjectWord';

interface SubjectCalendarAppProps {
  subject: string;
  onBack: () => void;
  initialStartYear?: number;
}

export function SubjectCalendarApp({ subject, onBack, initialStartYear }: SubjectCalendarAppProps) {
  const [startYear, setStartYear] = useState<number>(initialStartYear || new Date().getFullYear());
  const [schedules, setSchedules] = useState<Record<number, ScheduleItem[]>>({});
  const [classHolidays, setClassHolidays] = useState<Record<number, Holiday[]>>({});
  const [isLoadingSchedules, setIsLoadingSchedules] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');

  // We use the school calendar data as the reference for holidays and school days
  const {
    schoolDays, setSchoolDays,
    identity, setIdentity,
    holidays, setHolidays,
    saveSchoolData, isSaving
  } = useSchoolCalendarData(startYear);

  useEffect(() => {
    async function loadAllClassSchedules() {
      if (!auth.currentUser) return;
      setIsLoadingSchedules(true);
      const newSchedules: Record<number, ScheduleItem[]> = {};
      const newHolidays: Record<number, Holiday[]> = {};
      
      try {
        for (let i = 1; i <= 6; i++) {
          const docRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${i}`);
          const snap = await getDoc(docRef);
          if (snap.exists()) {
            const data = snap.data();
            newSchedules[i] = data.schedule || [];
            newHolidays[i] = data.holidays || [];
          } else {
            // Default empty schedule if not compiled
            newSchedules[i] = [];
            newHolidays[i] = [];
          }
        }
        setSchedules(newSchedules);
        setClassHolidays(newHolidays);
      } catch (error) {
        console.error("Error loading class schedules:", error);
      } finally {
        setIsLoadingSchedules(false);
      }
    }

    loadAllClassSchedules();
  }, [startYear]);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportSubjectWord(subject, identity, startYear, holidays, schoolDays, schedules, classHolidays, paperSize);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Terjadi kesalahan saat mengekspor dokumen.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20"
    >
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-indigo-600 p-2 rounded-lg text-white">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold leading-tight">Kalender Guru {subject}</h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">Tahun Pelajaran {startYear}/{startYear + 1}</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={startYear}
              onChange={(e) => setStartYear(Number(e.target.value))}
              className="pl-3 pr-8 py-1.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-medium bg-gray-50 hidden sm:block"
            >
              {[2023, 2024, 2025, 2026, 2027].map(year => (
                <option key={year} value={year}>{year}/{year + 1}</option>
              ))}
            </select>
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'A4' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperSize('F4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'F4' ? 'bg-white shadow-sm text-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                F4
              </button>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {isExporting ? <span className="animate-pulse">Mengekspor...</span> : <><Download size={18} /> <span className="hidden sm:inline">Unduh Word</span></>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0"
          >
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                Kalender Pendidikan Guru {subject}
              </h2>
              <p className="text-gray-600 mt-1">{identity.name || 'Sekolah'} - {identity.city}</p>
              <p className="text-gray-600 font-medium mt-1">Tahun Pelajaran {startYear}/{startYear + 1}</p>
            </div>

            <CalendarView startYear={startYear} holidays={holidays} schoolDays={schoolDays} onChangeHolidays={setHolidays} />
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="print:break-before-page"
          >
            {isLoadingSchedules ? (
              <div className="flex items-center justify-center p-12 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                <span className="ml-3 text-gray-500">Memuat data jadwal kelas...</span>
              </div>
            ) : (
              <SubjectEffectiveDaysAnalysis 
                subject={subject}
                startYear={startYear}
                schoolHolidays={holidays}
                classHolidays={classHolidays}
                schoolDays={schoolDays}
                schedules={schedules}
              />
            )}
          </motion.div>
        </div>
      </main>
    </motion.div>
  );
}
