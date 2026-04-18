import { ScheduleItem } from '../types';

export function getRecommendedSchedule(grade: number, schoolDays: 5 | 6, startYear: number = 2024): ScheduleItem[] {
  // standard time slots
  const schedule: ScheduleItem[] = [
    { id: '1', time: '07:00 - 07:35', monday: 'Upacara', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '2', time: '07:35 - 08:10', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '3', time: '08:10 - 08:45', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: 'break1', time: '08:45 - 09:00', monday: 'ISTIRAHAT', tuesday: 'ISTIRAHAT', wednesday: 'ISTIRAHAT', thursday: 'ISTIRAHAT', friday: 'ISTIRAHAT', saturday: 'ISTIRAHAT' },
    { id: '4', time: '09:00 - 09:35', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '5', time: '09:35 - 10:10', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '6', time: '10:10 - 10:45', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '7', time: '10:45 - 11:20', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
  ];

  // helper to set subject
  const setSub = (day: keyof ScheduleItem, slots: number[], mapel: string) => {
    slots.forEach(slotIdx => {
      const r = schedule.find(item => item.id === String(slotIdx));
      if (r) {
        (r as any)[day] = mapel;
      }
    });
  };

  // Fill specialized subjects to avoid overlap across different grades as much as possible
  // PJOK and PAIBP distributed across Mon-Thu perfectly to prevent overlaps
  if (grade === 1) {
    setSub('tuesday', [1, 2, 3], 'PJOK');
    setSub('wednesday', [4, 5, 6], 'PAIBP');
  } else if (grade === 2) {
    setSub('wednesday', [1, 2, 3], 'PJOK');
    setSub('thursday', [4, 5, 6], 'PAIBP');
  } else if (grade === 3) {
    setSub('thursday', [1, 2, 3], 'PJOK');
    setSub('monday', [2, 3, 4], 'PAIBP');
  } else if (grade === 4) {
    setSub('tuesday', [4, 5, 6], 'PJOK');
    setSub('wednesday', [1, 2, 3], 'PAIBP');
  } else if (grade === 5) {
    setSub('wednesday', [4, 5, 6], 'PJOK');
    setSub('thursday', [1, 2, 3], 'PAIBP');
  } else if (grade === 6) {
    setSub('thursday', [4, 5, 6], 'PJOK');
    setSub('monday', [5, 6, 7], 'PAIBP');
  }

  // Guru Mengaji diset hari Jumat jam ke-2 & ke-3 serempak untuk semua kelas (karena guru mengaji ada lebih dari 6 orang)
  setSub('friday', [2, 3], 'Guru Mengaji');

  const days: (keyof ScheduleItem)[] = schoolDays === 5 
    ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  let kokoList = ['Kokurikuler (GTKAIH)'];
  if (startYear >= 2024) {
    kokoList = [
      'Bangun pagi dan tidur cepat',
      'Beribadah',
      'Berolahraga',
      'Makan sehat dan bergizi',
      'Gemar Belajar',
      'Bermasyarakat'
    ];
  }

  // Pre-fill Ekskul first so it doesn't get taken by Kokurikuler
  if (schoolDays === 6) {
    setSub('saturday', [4, 5], 'Ekstrakurikuler / Pramuka');
  } else {
    setSub('friday', [4, 5], 'Ekstrakurikuler / Pramuka');
  }

  // Place each Kokurikuler exactly once in the week
  kokoList.forEach((koko, index) => {
    // Distribute them cyclically across the days
    const targetDay = days[index % days.length];
    
    let placed = false;
    const isBangunPagi = koko.includes('Bangun pagi');

    // For Bangun Pagi, try finding the earliest empty slot (1 to 6).
    // For others, prefer the last available slot (from 6 down to 1).
    const preferredSlots = isBangunPagi ? [1, 2, 3, 4, 5, 6] : [6, 5, 4, 3, 2, 1];

    for (const slotIdx of preferredSlots) {
      if (targetDay === 'monday' && slotIdx === 1) continue; // Upacara
      
      const r = schedule.find(item => item.id === String(slotIdx));
      if (r && !(r as any)[targetDay]) {
        (r as any)[targetDay] = koko;
        placed = true;
        break;
      }
    }

    // fallback: if somehow a day is completely full (very unlikely), just find any empty slot anywhere in the week
    if (!placed) {
      for (const d of days) {
        for (const slotIdx of preferredSlots) {
          if (d === 'monday' && slotIdx === 1) continue;
          const r = schedule.find(item => item.id === String(slotIdx));
          if (r && !(r as any)[d]) {
            (r as any)[d] = koko;
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
  });

  // Fill remainders generically with other subjects
  const genericMapels = ['Bahasa Indonesia', 'Matematika', 'Pendidikan Pancasila', 'Seni Budaya', 'Mulok/ Bahasa Sunda'];
  let genericIdx = 0;
  
  days.forEach(day => {
    [1, 2, 3, 4, 5, 6].forEach(slotIdx => {
      if (day === 'monday' && slotIdx === 1) return; // Upacara
      
      const r = schedule.find(item => item.id === String(slotIdx));
      if (r && !(r as any)[day]) {
        (r as any)[day] = genericMapels[genericIdx % genericMapels.length];
        genericIdx++;
        if (genericIdx % 3 === 0) genericIdx++; // arbitrary mix to avoid obvious repeating patterns
      }
    });
  });

  // Clear slot 7 if empty, or just leave as "-"
  schedule.forEach(r => {
    days.forEach(day => {
      if (!(r as any)[day] && r.id !== 'break1') {
          (r as any)[day] = '-';
      }
    });
  });

  return schedule;
}
