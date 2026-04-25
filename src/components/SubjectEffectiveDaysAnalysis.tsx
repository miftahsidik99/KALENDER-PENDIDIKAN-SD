import React, { useMemo } from 'react';
import { Holiday, ScheduleItem } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval, format, getDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface SubjectEffectiveDaysAnalysisProps {
  subject: string;
  startYear: number;
  schoolHolidays: Holiday[];
  classHolidays: Record<number, Holiday[]>;
  schoolDays: 5 | 6;
  schedules: Record<number, ScheduleItem[]>;
}

const dayNames: Record<number, string> = {
  1: 'Senin',
  2: 'Selasa',
  3: 'Rabu',
  4: 'Kamis',
  5: "Jum'at",
  6: 'Sabtu'
};

const dayKeys: Record<number, keyof ScheduleItem> = {
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday'
};

const toRoman = (num: number) => {
  const roman = ['I', 'II', 'III', 'IV', 'V', 'VI'];
  return roman[num - 1] || num.toString();
};

const isSubjectMatch = (subjectName: string, targetSubject: string) => {
  const s = subjectName.toUpperCase();
  const t = targetSubject.toUpperCase();
  if (s.includes(t)) return true;
  if (t === 'PAIBP' && (s.includes('PAI') || s.includes('AGAMA') || s.includes('PENDIDIKAN AGAMA'))) return true;
  return false;
};

export function SubjectEffectiveDaysAnalysis({ subject, startYear, schoolHolidays, classHolidays, schoolDays, schedules }: SubjectEffectiveDaysAnalysisProps) {
  
  const isHoliday = (date: Date, grade: number) => {
    const activeHolidays = (classHolidays[grade] && classHolidays[grade].length > 0) ? classHolidays[grade] : schoolHolidays;
    return activeHolidays.some(h => {
      const start = parseISO(h.date);
      if (h.endDate) {
        const end = parseISO(h.endDate);
        return isWithinInterval(date, { start, end });
      }
      return isSameDay(date, start);
    });
  };

  // Pre-calculate what days and periods the subject is taught for each class
  const classInfos = useMemo(() => {
    const infos: Record<number, { days: number[], hoursPerWeek: number, scheduleInfo: { day: number, periods: number[] }[] }> = {};
    for (let grade = 1; grade <= 6; grade++) {
      const classSchedule = schedules[grade];
      let hoursPerWeek = 0;
      const daysMap = new Map<number, number[]>(); 
      
      if (classSchedule && classSchedule.length > 0) {
        classSchedule.forEach(item => {
          for (let dayNum = 1; dayNum <= schoolDays; dayNum++) {
            const key = dayKeys[dayNum];
            const subjectName = item[key]?.toString().trim() || '';
            if (subjectName && subjectName !== '-' && subjectName.toUpperCase() !== 'ISTIRAHAT') {
              if (isSubjectMatch(subjectName, subject)) {
                hoursPerWeek++;
                const existing = daysMap.get(dayNum) || [];
                const slotNum = parseInt(item.id);
                if (!isNaN(slotNum)) {
                  existing.push(slotNum);
                }
                daysMap.set(dayNum, Array.from(new Set(existing))); // ensure unique
              }
            }
          }
        });
      }
      
      infos[grade] = {
        days: Array.from(daysMap.keys()),
        hoursPerWeek,
        scheduleInfo: Array.from(daysMap.entries()).map(([day, periods]) => ({ day, periods: periods.sort((a,b)=>a-b) }))
      };
    }
    return infos;
  }, [schedules, subject, schoolDays]);

  const calculateSemesterData = (semester: 1 | 2) => {
    const months = semester === 1
      ? Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1))
      : Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1));

    const monthData = months.map(monthDate => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });

      let monthName = format(monthDate, 'MMMM', { locale: id });

      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      
      for (let grade = 1; grade <= 6; grade++) {
        const daysTaught = classInfos[grade].days;
        
        let count = 0;
        days.forEach(day => {
          const dayOfWeek = getDay(day);
          if (daysTaught.includes(dayOfWeek)) {
            if (!isHoliday(day, grade)) {
              count++;
            }
          }
        });
        counts[grade] = count;
      }

      const total = Object.values(counts).reduce((a, b) => a + b, 0);

      return {
        name: monthName,
        counts,
        total
      };
    });

    const totals = monthData.reduce((acc, curr) => {
      acc[1] += curr.counts[1];
      acc[2] += curr.counts[2];
      acc[3] += curr.counts[3];
      acc[4] += curr.counts[4];
      acc[5] += curr.counts[5];
      acc[6] += curr.counts[6];
      acc.total += curr.total;
      return acc;
    }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, total: 0 });

    const classStats: Record<number, { hbe: number, totalHours: number }> = {};
    for (let grade = 1; grade <= 6; grade++) {
      const info = classInfos[grade];
      let totalHBE = 0;
      let totalHours = 0;
      
      info.scheduleInfo.forEach(({ day, periods }) => {
        let hbeForDay = 0;
        months.forEach(monthDate => {
          const start = startOfMonth(monthDate);
          const end = endOfMonth(monthDate);
          const days = eachDayOfInterval({ start, end });
          days.forEach(d => {
            if (getDay(d) === day && !isHoliday(d, grade)) {
              hbeForDay++;
            }
          });
        });
        totalHBE += hbeForDay;
        totalHours += hbeForDay * periods.length;
      });

      classStats[grade] = {
        hbe: totalHBE,
        totalHours
      };
    }

    return { monthData, totals, classStats };
  };

  const smt1 = useMemo(() => calculateSemesterData(1), [calculateSemesterData]);
  const smt2 = useMemo(() => calculateSemesterData(2), [calculateSemesterData]);

  const renderJampelTable = (semester: 1 | 2, smtData: any) => (
    <div className="mb-8 overflow-x-auto">
      <h4 className="font-bold mb-3 uppercase text-gray-800">PERHITUNGAN JUMLAH JAMPEL {subject} SEMESTER {semester}</h4>
      <table className="w-full text-sm border-collapse border-2 border-black text-center min-w-[600px]">
        <thead>
          <tr className="bg-gray-50">
            <th className="border-2 border-black p-2 uppercase font-bold">No</th>
            <th className="border-2 border-black p-2 uppercase font-bold">K E L A S</th>
            <th className="border-2 border-black p-2 uppercase font-bold">Jam/<br/>mg</th>
            <th className="border-2 border-black p-2 uppercase font-bold">Hari (dijadwal)</th>
            <th className="border-2 border-black p-2 uppercase font-bold">Jml HBE</th>
            <th className="border-2 border-black p-2 uppercase font-bold">Jam<br/>Pel</th>
            <th className="border-2 border-black p-2 uppercase font-bold bg-gray-200">Total Jam<br/>/ Smt</th>
          </tr>
        </thead>
        <tbody>
          {[1, 2, 3, 4, 5, 6].map(grade => {
            const info = classInfos[grade];
            const stats = smtData.classStats[grade];
            return (
              <tr key={grade} className="bg-white hover:bg-gray-50">
                <td className="border-2 border-black p-2">{grade}</td>
                <td className="border-2 border-black p-2 font-bold text-left px-4">{toRoman(grade)}</td>
                <td className="border-2 border-black p-2">{info.hoursPerWeek || ''}</td>
                <td className="border-2 border-black p-2 text-left px-4">{info.days.map(d => dayNames[d]).join(', ') || ''}</td>
                <td className="border-2 border-black p-2">{stats.hbe || ''}</td>
                <td className="border-2 border-black p-2">{info.hoursPerWeek || ''}</td>
                <td className="border-2 border-black p-2 font-bold">{stats.totalHours || ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 print:shadow-none print:border-none print:p-0">
      <div className="space-y-12">
        {/* Table 1: Analisa HBE Smt 1 and Smt 2 */}
        <div className="overflow-x-auto">
          <h4 className="font-bold mb-3 text-gray-800">1. Analisa HBE Semester 1 dan 2 Kelas I Sampai Kelas VI Tahun Ajaran {startYear}-{startYear+1}</h4>
          <table className="w-full text-sm border-collapse border-2 border-black text-center min-w-[700px]">
            <thead>
              <tr className="bg-gray-50">
                <th className="border-2 border-black p-2 uppercase min-w-[120px]">
                  <div className="text-left font-bold mb-1">HARI</div>
                  <hr className="border-black"/>
                  <div className="text-left font-bold mt-1">BULAN</div>
                </th>
                {[1,2,3,4,5,6].map(grade => (
                  <th key={grade} className="border-2 border-black p-0 min-w-[80px]">
                    <div className="border-b-2 border-black p-2 font-normal">{classInfos[grade].days.map(d => dayNames[d]).join(', ') || '-'}</div>
                    <div className="p-2 font-bold">Kelas {grade}</div>
                  </th>
                ))}
                <th className="border-2 border-black p-2 uppercase font-bold min-w-[100px]">TOTAL /<br/>BULAN</th>
              </tr>
            </thead>
            <tbody>
              {/* Semester 1 */}
              {smt1.monthData.map((m, i) => (
                <tr key={i} className="bg-white">
                  <td className="border-2 border-black p-2 text-left uppercase">{m.name}</td>
                  {[1,2,3,4,5,6].map(grade => (
                    <td key={grade} className="border-2 border-black p-2 font-medium">{m.counts[grade] || ''}</td>
                  ))}
                  <td className="border-2 border-black p-2 font-bold">{m.total || ''}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border-2 border-black p-2 text-left uppercase">TOTAL/SEMESTER 1</td>
                {[1,2,3,4,5,6].map(grade => (
                  <td key={grade} className="border-2 border-black p-2">{smt1.totals[grade]}</td>
                ))}
                <td className="border-2 border-black p-2">{smt1.totals.total}</td>
              </tr>
              
              {/* Spacer */}
              <tr className="bg-white"><td colSpan={8} className="p-2 border-x-2 border-black border-collapse"></td></tr>

              {/* Semester 2 */}
              {smt2.monthData.map((m, i) => (
                <tr key={i} className="bg-white">
                  <td className="border-2 border-black p-2 text-left uppercase">{m.name}</td>
                  {[1,2,3,4,5,6].map(grade => (
                    <td key={grade} className="border-2 border-black p-2 font-medium">{m.counts[grade] || ''}</td>
                  ))}
                  <td className="border-2 border-black p-2 font-bold">{m.total || ''}</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold">
                <td className="border-2 border-black p-2 text-left uppercase">TOTAL/SEMESTER 2</td>
                {[1,2,3,4,5,6].map(grade => (
                  <td key={grade} className="border-2 border-black p-2">{smt2.totals[grade]}</td>
                ))}
                <td className="border-2 border-black p-2">{smt2.totals.total}</td>
              </tr>
              
              {/* Full Total */}
              <tr className="bg-gray-200 font-bold">
                <td className="border-2 border-black p-2 text-left uppercase tracking-wide">TOTAL SEMESTER 1 & 2</td>
                {[1,2,3,4,5,6].map(grade => (
                  <td key={grade} className="border-2 border-black p-2">{smt1.totals[grade] + smt2.totals[grade]}</td>
                ))}
                <td className="border-2 border-black p-2">{smt1.totals.total + smt2.totals.total}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Tables 2 & 3: Perhitungan Jumlah Jampel Semester 1 and 2 */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 print:block print:space-y-8">
          {renderJampelTable(1, smt1)}
          {renderJampelTable(2, smt2)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 print:block print:space-y-12">
          {/* Table 4: Pengaturan Jam Pelajaran */}
          <div className="overflow-x-auto">
            <h4 className="font-bold mb-3 uppercase text-gray-800">PENGATURAN JAM PELAJARAN K-13 DAN KURMED {subject}</h4>
            <table className="w-full text-sm border-collapse border-2 border-black text-center min-w-[500px]">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-2 border-black p-2 uppercase font-bold" rowSpan={2}>MAPEL</th>
                  <th className="border-2 border-black p-2 uppercase font-bold" colSpan={6}>JAM PELAJARAN PERMINGGU</th>
                  <th className="border-2 border-black p-2 uppercase font-bold" rowSpan={2}>Jumlah</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 1</th>
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 2</th>
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 3</th>
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 4</th>
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 5</th>
                  <th className="border-2 border-black p-2 font-bold whitespace-nowrap">KLS 6</th>
                </tr>
              </thead>
              <tbody>
                <tr className="bg-white">
                  <td className="border-2 border-black p-2 uppercase font-bold text-left">{subject}</td>
                  {[1,2,3,4,5,6].map(grade => <td key={grade} className="border-2 border-black p-2">{classInfos[grade].hoursPerWeek || ''}</td>)}
                  <td className="border-2 border-black p-2 font-bold">
                    {[1,2,3,4,5,6].reduce((acc, grade) => acc + (classInfos[grade].hoursPerWeek || 0), 0) || ''}
                  </td>
                </tr>
                <tr className="bg-gray-100 font-bold">
                  <td className="border-2 border-black p-2 uppercase text-left tracking-widest">TOTAL</td>
                  {[1,2,3,4,5,6].map(grade => <td key={grade} className="border-2 border-black p-2">{classInfos[grade].hoursPerWeek || ''}</td>)}
                  <td className="border-2 border-black p-2">
                    {[1,2,3,4,5,6].reduce((acc, grade) => acc + (classInfos[grade].hoursPerWeek || 0), 0) || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Table 5: Jadwal Pelajaran */}
          <div className="overflow-x-auto">
            <h4 className="font-bold mb-3 uppercase text-gray-800">JADWAL PELAJARAN</h4>
            <table className="w-full max-w-sm text-sm border-collapse border-2 border-black text-center mx-auto lg:mx-0">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border-2 border-black p-2 uppercase font-bold" rowSpan={2}>KELAS</th>
                  <th className="border-2 border-black p-2 uppercase font-bold" colSpan={2}>HARI/JAMPEL</th>
                </tr>
                <tr className="bg-gray-50">
                  <th className="border-2 border-black p-2 font-bold">HARI</th>
                  <th className="border-2 border-black p-2 font-bold">JAM KE-</th>
                </tr>
              </thead>
              <tbody>
                {[1, 2, 3, 4, 5, 6].map(grade => {
                  const info = classInfos[grade];
                  return (
                    <tr key={grade} className="bg-white">
                      <td className="border-2 border-black p-2 font-bold">{toRoman(grade)}</td>
                      <td className="border-2 border-black p-2 text-left px-4">{info.days.map(d => dayNames[d]).join(', ') || ''}</td>
                      <td className="border-2 border-black p-2">{info.scheduleInfo.map(si => si.periods.join(', ')).join(' | ') || ''}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
