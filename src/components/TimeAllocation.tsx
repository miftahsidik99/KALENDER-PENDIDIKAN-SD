import React, { useState } from 'react';
import { CurriculumSubject, ScheduleItem, Holiday, TeacherIdentity } from '../types';
import { calculateHBEPerDay } from '../lib/calendarUtils';

interface Props {
  subjects: CurriculumSubject[];
  schedule: ScheduleItem[];
  startYear: number;
  holidays: Holiday[];
  grade: number;
  identity: TeacherIdentity;
  schoolDays: 5 | 6;
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

export function TimeAllocation({ subjects, schedule, startYear, holidays, grade, identity, schoolDays }: Props) {
  const [semester, setSemester] = useState<1 | 2>(1);

  const hbePerDay = calculateHBEPerDay(startYear, semester, holidays, schoolDays);

  // Calculate schedule occurrences
  const scheduleCounts: Record<string, Record<number, number>> = {};
  const daysToIterate = schoolDays === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];
  
  schedule.forEach(item => {
    daysToIterate.forEach(dayNum => {
      const key = dayKeys[dayNum];
      const subjectName = item[key]?.toString().trim();
      if (subjectName && subjectName !== '-' && subjectName.toUpperCase() !== 'ISTIRAHAT') {
        const upperName = subjectName.toUpperCase();
        if (!scheduleCounts[upperName]) scheduleCounts[upperName] = {};
        scheduleCounts[upperName][dayNum] = (scheduleCounts[upperName][dayNum] || 0) + 1;
      }
    });
  });

  const allocations = subjects.map(subject => {
    const upperName = subject.name.trim().toUpperCase();
    const occurrences = scheduleCounts[upperName] || {};
    const daysScheduled = Object.keys(occurrences).map(Number).sort((a, b) => a - b);
    
    const details = daysScheduled.map(dayNum => {
      const jmlHBE = hbePerDay[dayNum as keyof typeof hbePerDay];
      const jamPel = occurrences[dayNum];
      return {
        dayNum,
        dayName: dayNames[dayNum],
        jmlHBE,
        jamPel,
        total: jmlHBE * jamPel
      };
    });

    return {
      ...subject,
      details: details.length > 0 ? details : [{ dayNum: 0, dayName: '', jmlHBE: '', jamPel: '', total: '' }]
    };
  });

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 mb-8 print:shadow-none print:border-none print:p-0">
      <div className="flex justify-between items-center mb-8 print:hidden">
        <h2 className="text-xl font-bold text-gray-800">Alokasi Waktu</h2>
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

      <div className="text-center mb-6">
        <h2 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wide">
          PERHITUNGAN JUMLAH JAM PELAJARAN (ALOKASI WAKTU)
        </h2>
        <h2 className="text-lg md:text-xl font-bold text-gray-900 uppercase tracking-wide mb-4">
          BERDASARKAN PERHITUNGAN HEB KELAS {grade}
        </h2>
        <h3 className="text-lg font-bold text-gray-900 uppercase tracking-wide">
          SEMESTER {semester}
        </h3>
      </div>

      <div className="overflow-x-auto flex justify-center mb-4">
        <table className="w-full max-w-5xl text-sm md:text-base border-collapse border-2 border-black">
          <thead>
            <tr className="bg-gray-200 text-center">
              <th className="border-2 border-black py-2 px-2 w-12">No</th>
              <th className="border-2 border-black py-2 px-4">Mapel</th>
              <th className="border-2 border-black py-2 px-2 w-16">Jam/ mg</th>
              <th className="border-2 border-black py-2 px-4 w-24">Hari (dijadwal)</th>
              <th className="border-2 border-black py-2 px-2 w-16">Jml HBE</th>
              <th className="border-2 border-black py-2 px-2 w-16">Jam pel</th>
              <th className="border-2 border-black py-2 px-2 w-20">Total Jampel / Smt</th>
              <th className="border-2 border-black py-2 px-4 w-32">Keterangan</th>
            </tr>
          </thead>
          <tbody>
            {allocations.map((alloc) => {
              const rowSpan = alloc.details.length;
              return (
                <React.Fragment key={alloc.id}>
                  <tr className="bg-white">
                    <td className="border-2 border-black py-1 px-2 text-center" rowSpan={rowSpan}>{alloc.no}</td>
                    <td className={`border-2 border-black py-1 px-4 ${alloc.isSubItem ? 'pl-8' : ''}`} rowSpan={rowSpan}>{alloc.name}</td>
                    <td className="border-2 border-black py-1 px-2 text-center" rowSpan={rowSpan}>{alloc.hoursPerWeek}</td>
                    <td className="border-2 border-black py-1 px-4 text-center">{alloc.details[0].dayName}</td>
                    <td className="border-2 border-black py-1 px-2 text-center">{alloc.details[0].jmlHBE}</td>
                    <td className="border-2 border-black py-1 px-2 text-center">{alloc.details[0].jamPel}</td>
                    <td className="border-2 border-black py-1 px-2 text-center font-bold italic">{alloc.details[0].total}</td>
                    <td className="border-2 border-black py-1 px-4 bg-gray-300" rowSpan={rowSpan}></td>
                  </tr>
                  {alloc.details.slice(1).map((detail, j) => (
                    <tr key={`${alloc.id}-${j}`} className="bg-white">
                      <td className="border-2 border-black py-1 px-4 text-center">{detail.dayName}</td>
                      <td className="border-2 border-black py-1 px-2 text-center">{detail.jmlHBE}</td>
                      <td className="border-2 border-black py-1 px-2 text-center">{detail.jamPel}</td>
                      <td className="border-2 border-black py-1 px-2 text-center font-bold italic">{detail.total}</td>
                    </tr>
                  ))}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="max-w-5xl mx-auto text-sm italic mb-12">
        <p className="font-bold">Catatan :</p>
        <ol className="list-decimal pl-5">
          <li>Perhitungan jumlah jampel (alokasi waktu) bisa dilakukan apabila jadwal sudah beres, dan analisis hari efektif belajar selesai.</li>
          <li>Apabila jumlah jampel sudah selesai. Baru bisa menyusun promes (membagi alokasi waktu pada Promes).</li>
          <li className="text-blue-600">Pastikan penulisan nama mata pelajaran pada Jadwal Pelajaran <b>sama persis</b> dengan nama pada Struktur Kurikulum agar dapat terhitung otomatis.</li>
        </ol>
      </div>

      {/* Signatures for Print */}
      <div className="hidden print:flex justify-end mt-12 px-10">
        <div className="text-center">
          <p className="mb-20">{identity.city}, 15 Juli {startYear}<br/>Guru Kelas {grade}</p>
          <p className="font-bold underline uppercase">{identity.name}</p>
          <p>NIP. {identity.nip || '-'}</p>
        </div>
      </div>
    </div>
  );
}
