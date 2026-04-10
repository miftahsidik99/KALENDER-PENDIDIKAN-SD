import React, { useState } from 'react';
import { Holiday } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval, format, getDay } from 'date-fns';
import { id } from 'date-fns/locale';

interface EffectiveDaysAnalysisProps {
  startYear: number;
  holidays: Holiday[];
  grade: number;
  schoolDays: 5 | 6;
}

export function EffectiveDaysAnalysis({ startYear, holidays, grade, schoolDays }: EffectiveDaysAnalysisProps) {
  const [semester, setSemester] = useState<1 | 2>(1);

  const isHoliday = (date: Date) => {
    return holidays.some(h => {
      const start = parseISO(h.date);
      if (h.endDate) {
        const end = parseISO(h.endDate);
        return isWithinInterval(date, { start, end });
      }
      return isSameDay(date, start);
    });
  };

  const calculateMonthData = (monthDate: Date) => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });

    // 1=Senin, 2=Selasa, 3=Rabu, 4=Kamis, 5=Jumat, 6=Sabtu
    const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    days.forEach(day => {
      const dayOfWeek = getDay(day);
      if (dayOfWeek >= 1 && dayOfWeek <= schoolDays) {
        if (!isHoliday(day)) {
          counts[dayOfWeek as keyof typeof counts]++;
        }
      }
    });

    const total = Object.values(counts).reduce((a, b) => a + b, 0);

    // Format month to match screenshot (e.g., Jul-25, Agust-25, Nop-25)
    let monthName = format(monthDate, 'MMM-yy', { locale: id });
    monthName = monthName.replace('Agt', 'Agust').replace('Nov', 'Nop');

    return {
      name: monthName,
      counts,
      total
    };
  };

  const months = semester === 1
    ? Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1))
    : Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1));

  const data = months.map(calculateMonthData);

  const totals = data.reduce((acc, curr) => {
    acc[1] += curr.counts[1];
    acc[2] += curr.counts[2];
    acc[3] += curr.counts[3];
    acc[4] += curr.counts[4];
    acc[5] += curr.counts[5];
    acc[6] += curr.counts[6];
    acc.total += curr.total;
    return acc;
  }, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, total: 0 });

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-xl font-bold text-gray-800">Analisis Hari Efektif</h2>
        <div className="flex items-center gap-3">
          <label className="text-sm font-medium text-gray-600">Pilih Semester:</label>
          <select
            value={semester}
            onChange={(e) => setSemester(Number(e.target.value) as 1 | 2)}
            className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none bg-gray-50 font-medium"
          >
            <option value={1}>Semester 1</option>
            <option value={2}>Semester 2</option>
          </select>
        </div>
      </div>

      <div className="text-center mb-8">
        <h2 className="text-xl md:text-2xl font-bold text-gray-900 uppercase tracking-wide mb-1">
          <span className="bg-blue-50/50 px-2">ANALISIS HARI EFEKTIF BELAJAR KELAS {grade} SEMESTER {semester}</span>
        </h2>
        <h3 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wide">
          <span className="bg-blue-50/50 px-2">TAHUN PELAJARAN {startYear} - {startYear + 1}</span>
        </h3>
      </div>

      <div className="overflow-x-auto flex justify-center">
        <table className="w-full max-w-4xl text-sm md:text-base text-center border-collapse border-2 border-black">
          <thead>
            <tr className="bg-white">
              <th colSpan={2} className="border-2 border-black py-3 px-4 uppercase font-bold">Bulan</th>
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Senin</th>
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Selasa</th>
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Rabu</th>
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Kamis</th>
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Jum'at</th>
              {schoolDays === 6 && <th className="border-2 border-black py-3 px-4 uppercase font-bold">Sabtu</th>}
              <th className="border-2 border-black py-3 px-4 uppercase font-bold">Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="bg-white">
                <td className="border-2 border-black py-2 px-4 text-left whitespace-nowrap">{row.name}</td>
                {i === 0 && (
                  <td
                    rowSpan={6}
                    className="border-2 border-black py-2 px-2 font-bold tracking-widest"
                    style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
                  >
                    SEMESTER {semester}
                  </td>
                )}
                <td className="border-2 border-black py-2 px-4 font-medium">{row.counts[1]}</td>
                <td className="border-2 border-black py-2 px-4 font-medium">{row.counts[2]}</td>
                <td className="border-2 border-black py-2 px-4 font-medium">{row.counts[3]}</td>
                <td className="border-2 border-black py-2 px-4 font-medium">{row.counts[4]}</td>
                <td className="border-2 border-black py-2 px-4 font-medium">{row.counts[5]}</td>
                {schoolDays === 6 && <td className="border-2 border-black py-2 px-4 font-medium bg-[#b5a67e]">{row.counts[6] > 0 ? row.counts[6] : ''}</td>}
                <td className="border-2 border-black py-2 px-4 font-bold italic">{row.total}</td>
              </tr>
            ))}
            <tr className="bg-white">
              <td colSpan={2} className="border-2 border-black py-3 px-4 text-left font-bold uppercase">Jumlah</td>
              <td className="border-2 border-black py-3 px-4 font-bold italic">{totals[1]}</td>
              <td className="border-2 border-black py-3 px-4 font-bold italic">{totals[2]}</td>
              <td className="border-2 border-black py-3 px-4 font-bold italic">{totals[3]}</td>
              <td className="border-2 border-black py-3 px-4 font-bold italic">{totals[4]}</td>
              <td className="border-2 border-black py-3 px-4 font-bold italic">{totals[5]}</td>
              {schoolDays === 6 && <td className="border-2 border-black py-3 px-4 font-bold italic bg-[#b5a67e]">{totals[6] > 0 ? totals[6] : ''}</td>}
              <td className="border-2 border-black py-3 px-4 font-bold italic"></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

