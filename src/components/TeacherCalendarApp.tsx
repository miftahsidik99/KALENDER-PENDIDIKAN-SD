import React, { useState, useEffect } from 'react';
import { TeacherIdentity, Holiday, ScheduleItem, CurriculumSubject } from '../types';
import { getDefaultHolidays, defaultCurriculum } from '../lib/defaultData';
import { TeacherForm } from './TeacherForm';
import { CalendarView } from './CalendarView';
import { EffectiveDaysAnalysis } from './EffectiveDaysAnalysis';
import { ScheduleTable } from './ScheduleTable';
import { CurriculumStructure } from './CurriculumStructure';
import { TimeAllocation } from './TimeAllocation';
import { ScheduleSyncAlert } from './ScheduleSyncAlert';
import { getRecommendedSchedule } from '../lib/scheduleGenerator';
import { exportTeacherWord } from '../lib/exportTeacherWord';
import { Download, Calendar as CalendarIcon, Settings, FileText, ArrowLeft, Save, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { AuthButton } from './AuthButton';
import { useClassCalendarData } from '../lib/useCalendarData';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

interface TeacherCalendarAppProps {
  grade: number;
  onBack: () => void;
  initialStartYear?: number;
}

export function TeacherCalendarApp({ grade, onBack, initialStartYear }: TeacherCalendarAppProps) {
  const [startYear, setStartYear] = useState<number>(initialStartYear || new Date().getFullYear());
  const [paperSize, setPaperSize] = useState<'A4' | 'F4'>('A4');
  const [isExporting, setIsExporting] = useState(false);
  const [syncState, setSyncState] = useState<{ isOpen: boolean; type: 'loading' | 'results'; discrepancies: string[]; clashes: string[] }>({
    isOpen: false,
    type: 'loading',
    discrepancies: [],
    clashes: []
  });

  const {
    schoolDays, setSchoolDays,
    identity, setIdentity,
    holidays, setHolidays,
    schedule, setSchedule,
    curriculum, setCurriculum,
    saveClassData, syncWithSchoolCalendar, isSaving, isLoading
  } = useClassCalendarData(startYear, grade);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportTeacherWord(identity, startYear, holidays, grade, schedule, curriculum, schoolDays, paperSize);
    } catch (error) {
      console.error("Export failed:", error);
      alert("Terjadi kesalahan saat mengekspor dokumen.");
    } finally {
      setIsExporting(false);
    }
  };

  const handleCheckSync = async () => {
    if (!auth.currentUser) return;
    setSyncState({ isOpen: true, type: 'loading', discrepancies: [], clashes: [] });

    const discrepancies: string[] = [];
    const clashes: string[] = [];
    
    // 1. Check against current curriculum (internal validation)
    const scheduledCounts: Record<string, number> = {};
    const dayKeys = schoolDays === 5 
      ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] as const
      : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'] as const;

    schedule.forEach(row => {
      dayKeys.forEach(day => {
        const parsed = String(row[day] || '').trim().toUpperCase();
        if (parsed && parsed !== '-' && parsed !== 'ISTIRAHAT') {
          scheduledCounts[parsed] = (scheduledCounts[parsed] || 0) + 1;
        }
      });
    });

    curriculum.forEach(sub => {
      const required = Number(sub.hoursPerWeek) || 0;
      if (required === 0) return; // Skip headers with 0 hours
      
      const parsedTarget = sub.name.trim().toUpperCase();
      const actual = scheduledCounts[parsedTarget] || 0;
      if (actual < required) {
        discrepancies.push(`${sub.name}: Kurang ${required - actual} JP (Dibutuhkan: ${required}, Terjadwal: ${actual})`);
      } else if (actual > required) {
        discrepancies.push(`${sub.name}: Berlebih ${actual - required} JP (Dibutuhkan: ${required}, Terjadwal: ${actual})`);
      }
    });

    // 2. Fetch other classes for clash detection
    const specializedMapel = ['PJOK', 'PAIBP', 'PENDIDIKAN AGAMA ISLAM'];
    const daysMap: Record<string, string> = {
      monday: 'Senin', tuesday: 'Selasa', wednesday: 'Rabu', 
      thursday: 'Kamis', friday: "Jum'at", saturday: 'Sabtu'
    };

    try {
      for (let i = 1; i <= 6; i++) {
        if (i === grade) continue;
        const docRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${i}`);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          const otherSchedule = snap.data().schedule as ScheduleItem[];
          
          if (otherSchedule && Array.isArray(otherSchedule)) {
            schedule.forEach((row, rowIndex) => {
              const otherRow = otherSchedule[rowIndex];
              if (!otherRow) return;
              
              dayKeys.forEach(day => {
                const myMapel = String(row[day] || '').trim().toUpperCase();
                const otherMapel = String(otherRow[day] || '').trim().toUpperCase();
                
                if (myMapel && specializedMapel.includes(myMapel) && myMapel === otherMapel) {
                  clashes.push(`Bentrok Mapel Guru Khusus (${myMapel}) dengan Kelas ${i} pada hari ${daysMap[day]} waktu ${row.time}`);
                }
              });
            });
          }
        }
      }
    } catch (e) {
      console.error("Error fetching other classes for clash detection", e);
    }

    setSyncState({ isOpen: true, type: 'results', discrepancies, clashes });
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gray-50 text-gray-900 font-sans selection:bg-blue-100 selection:text-blue-900 pb-20 print:bg-white print:pb-0"
    >
      {/* Header - Hidden in Print */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10 shadow-sm print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={onBack}
              className="p-2 -ml-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Kembali ke Beranda"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex items-center gap-3">
              <div className="bg-emerald-600 p-2 rounded-lg text-white hidden sm:block">
                <CalendarIcon size={20} />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold leading-tight">Kalender Guru Kelas {grade}</h1>
                <p className="text-xs text-gray-500 font-medium hidden sm:block">Administrasi Guru Kelas</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <AuthButton />
            <div className="flex items-center gap-1 sm:gap-2 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPaperSize('A4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'A4' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                A4
              </button>
              <button
                onClick={() => setPaperSize('F4')}
                className={`px-2 sm:px-3 py-1 text-xs sm:text-sm font-medium rounded-md transition-all ${paperSize === 'F4' ? 'bg-white shadow-sm text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                F4
              </button>
            </div>
            <button
              onClick={handleExport}
              disabled={isExporting}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {isExporting ? <span className="animate-pulse">Mengekspor...</span> : <><Download size={18} /> <span className="hidden sm:inline">Unduh Word</span></>}
            </button>
            <button
              onClick={syncWithSchoolCalendar}
              disabled={isSaving}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
              title="Singkronkan libur dan hari belajar dari Kalender Induk"
            >
              {isSaving ? <span className="animate-pulse">Menyim...</span> : <><RefreshCw size={18} /> <span className="hidden lg:inline">Singkronkan Kalender Sekolah</span></>}
            </button>
            <button
              onClick={saveClassData}
              disabled={isSaving}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-sm sm:text-base font-medium transition-all shadow-sm disabled:opacity-70"
            >
              {isSaving ? <span className="animate-pulse">Menyimpan...</span> : <><Save size={18} /> <span className="hidden sm:inline">Simpan</span></>}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 print:p-0 print:max-w-none">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:block">
          
          {/* Left Sidebar - Configuration (Hidden in Print) */}
          <div className="lg:col-span-4 space-y-6 print:hidden">
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
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
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50"
                  >
                    <option value={6}>6 Hari (Senin - Sabtu)</option>
                    <option value={5}>5 Hari (Senin - Jum'at)</option>
                  </select>
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
              <TeacherForm identity={identity} onChange={setIdentity} />
            </motion.div>
          </div>

          {/* Right Content - Preview (Visible in Print) */}
          <div className="lg:col-span-8 print:col-span-12">
            
            {/* Cover / Header Print */}
            <div className="hidden print:block text-center mb-12">
              <h1 className="text-3xl font-bold uppercase mb-2">Administrasi Guru Kelas</h1>
              <h2 className="text-2xl font-bold uppercase mb-4">{identity.schoolName}</h2>
              <p className="text-lg">Tahun Pelajaran {startYear}/{startYear + 1}</p>
            </div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 print:shadow-none print:border-none print:p-0 mb-8"
            >
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-wide">
                  Kalender Pendidikan Kelas {grade}
                </h2>
                <p className="text-gray-600 mt-1">{identity.schoolName} - {identity.city}</p>
                <p className="text-gray-600 font-medium mt-1">Guru Kelas: {identity.name}</p>
              </div>

              <CalendarView startYear={startYear} holidays={holidays} schoolDays={schoolDays} onChangeHolidays={setHolidays} />

              {/* Legend / Keterangan */}
              <div className="mt-12 border-t border-gray-100 pt-8 print:break-inside-avoid">
                <div className="flex items-center gap-2 mb-6">
                  <FileText size={20} className="text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-800">Keterangan Hari Libur & Agenda</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {holidays.map(holiday => (
                    <div key={holiday.id} className="flex items-start gap-3">
                      <div className="w-4 h-4 rounded-sm mt-1 shrink-0 print:border print:border-gray-300" style={{ backgroundColor: holiday.color }} />
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

            {/* Page Break for Print */}
            <div className="print:break-before-page" />

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="print:shadow-none print:border-none print:p-0"
            >
              <EffectiveDaysAnalysis startYear={startYear} holidays={holidays} grade={grade} schoolDays={schoolDays} />
            </motion.div>

            {/* Page Break for Print */}
            <div className="print:break-before-page" />

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="print:shadow-none print:border-none print:p-0"
            >
              <CurriculumStructure subjects={curriculum} onChange={setCurriculum} grade={grade} />
            </motion.div>

            {/* Page Break for Print */}
            <div className="print:break-before-page" />

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="print:shadow-none print:border-none print:p-0"
            >
              <ScheduleTable 
                schedule={schedule} 
                onChange={setSchedule} 
                schoolDays={schoolDays} 
                onCheckSync={handleCheckSync}
              />
            </motion.div>

            {/* Page Break for Print */}
            <div className="print:break-before-page" />

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="print:shadow-none print:border-none print:p-0"
            >
              <TimeAllocation 
                subjects={curriculum} 
                schedule={schedule} 
                startYear={startYear} 
                holidays={holidays} 
                grade={grade} 
                identity={identity} 
                schoolDays={schoolDays}
              />
            </motion.div>

          </div>
        </div>
      </main>

      <ScheduleSyncAlert 
        isOpen={syncState.isOpen}
        type={syncState.type}
        discrepancies={syncState.discrepancies}
        clashes={syncState.clashes}
        onClose={() => setSyncState(prev => ({ ...prev, isOpen: false }))}
      />
    </motion.div>
  );
}
