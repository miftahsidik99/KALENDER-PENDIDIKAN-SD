import { ScheduleItem, CurriculumSubject } from '../types';

export function getRecommendedSchedule(grade: number, schoolDays: 5 | 6, startYear: number = 2024, curriculum: CurriculumSubject[] = []): ScheduleItem[] {
  // standard time slots
  const schedule: ScheduleItem[] = [
    { id: '1', time: '07:00 - 07:35', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '2', time: '07:35 - 08:10', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '3', time: '08:10 - 08:45', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: 'break1', time: '08:45 - 09:00', monday: 'ISTIRAHAT', tuesday: 'ISTIRAHAT', wednesday: 'ISTIRAHAT', thursday: 'ISTIRAHAT', friday: 'ISTIRAHAT', saturday: 'ISTIRAHAT' },
    { id: '4', time: '09:00 - 09:35', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '5', time: '09:35 - 10:10', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '6', time: '10:10 - 10:45', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: 'break2', time: '10:45 - 11:00', monday: 'ISTIRAHAT', tuesday: 'ISTIRAHAT', wednesday: 'ISTIRAHAT', thursday: 'ISTIRAHAT', friday: 'ISTIRAHAT', saturday: 'ISTIRAHAT' },
    { id: '7', time: '11:00 - 11:35', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '8', time: '11:35 - 12:10', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '9', time: '12:10 - 12:45', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '10', time: '12:45 - 13:20', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '11', time: '13:20 - 13:55', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
    { id: '12', time: '13:55 - 14:30', monday: '', tuesday: '', wednesday: '', thursday: '', friday: '', saturday: '' },
  ];

  const days: (keyof ScheduleItem)[] = schoolDays === 5 
    ? ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'] 
    : ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

  // Identify subjects and their needed hours from the curriculum
  const requiredHours: Record<string, number> = {};
  curriculum.forEach(sub => {
    const hrs = Number(sub.hoursPerWeek) || 0;
    if (hrs > 0 && sub.name) {
      if (startYear >= 2024 && sub.name.toUpperCase().includes('KOKURIKULER') && !sub.isSubItem) return;
      if (startYear < 2024 && sub.isSubItem) return;
      
      requiredHours[sub.name.trim()] = hrs;
    }
  });

  // fallback if curriculum is empty
  if (Object.keys(requiredHours).length === 0) {
      // Basic fallback
      requiredHours['Pendidikan Pancasila'] = 4;
      requiredHours['Bahasa Indonesia'] = 7;
      requiredHours['Matematika'] = 4;
      requiredHours['Seni Budaya'] = 3;
      requiredHours['Mulok/ Bahasa Sunda'] = 2;
      requiredHours['PJOK'] = 3;
      requiredHours['PAIBP'] = 3;
      requiredHours['Guru Mengaji'] = 2;
      requiredHours['Ekstrakurikuler / Pramuka'] = 2;
      requiredHours['Upacara'] = 1;

      if (startYear >= 2024) {
        requiredHours['Bangun pagi dan tidur cepat'] = 1;
        requiredHours['Beribadah'] = 1;
        requiredHours['Berolahraga'] = 1;
        requiredHours['Makan sehat dan bergizi'] = 1;
        requiredHours['Gemar Belajar'] = 1;
        requiredHours['Bermasyarakat'] = 1;
      } else {
        requiredHours['Kokurikuler (GTKAIH)'] = 1; // dummy 1 fallback
      }
  }

  // helper to read cell
  const getSub = (day: keyof ScheduleItem, slotIdx: number) => {
    const r = schedule.find(item => item.id === String(slotIdx));
    return r ? (r as any)[day] : '';
  }

  // helper to set subject and deduct from pool
  const setSub = (day: keyof ScheduleItem, slots: number[], mapel: string) => {
    slots.forEach(slotIdx => {
      const r = schedule.find(item => item.id === String(slotIdx));
      if (r && !(r as any)[day]) {
        (r as any)[day] = mapel;
        // find case-insensitive key in requiredHours
        const realKey = Object.keys(requiredHours).find(k => k.toUpperCase() === mapel.toUpperCase());
        if (realKey && requiredHours[realKey] > 0) {
          requiredHours[realKey]--;
        }
      }
    });
  };

  // 1. Upacara
  setSub('monday', [1], Object.keys(requiredHours).find(k => k.toUpperCase().includes('UPACARA')) || 'Upacara');

  // 2. Ekskul
  const ekskulKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('EKSKUL') || k.toUpperCase().includes('PRAMUKA') || k.toUpperCase().includes('EKSTRAKURIKULER'));
  if (ekskulKey) {
    if (schoolDays === 6) {
      setSub('saturday', [4, 5], ekskulKey);
    } else {
      setSub('friday', [4, 5], ekskulKey);
    }
  }

  // 3. Guru Mengaji
  const ngajiKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('MENGAJI'));
  if (ngajiKey) {
    setSub('friday', [2, 3], ngajiKey);
  }

  // 4. PJOK and PAIBP distributed across Mon-Thu strictly to avoid overlaps, ONLY up to their required hours
  const pjokKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('PJOK'));
  const paibpKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('PAIBP') || k.toUpperCase().includes('PENDIDIKAN AGAMA ISLAM'));
  const sbKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('SENI BUDAYA'));

  const placeSpecial = (mapel: string, preferredDay: keyof ScheduleItem, preferredSlots: number[]) => {
    if (!mapel || !requiredHours[mapel]) return;
    
    let placedCount = 0;
    let targetCount = requiredHours[mapel];
    const slotsToUse: number[] = [];
    
    for(let i = 0; i < preferredSlots.length; i++) {
        if (placedCount >= targetCount) break;
        const slotId = preferredSlots[i];
        const r = schedule.find(item => item.id === String(slotId));
        if (r && !(r as any)[preferredDay]) {
            slotsToUse.push(slotId);
            placedCount++;
        }
    }
    
    if (slotsToUse.length > 0) {
      setSub(preferredDay, slotsToUse, mapel);
    }
  }

  // Interleave PJOK, PAIBP, and Seni Budaya heavily across days specifically to prevent clashes between parallel classes
  const blockA = [1, 2, 3, 4, 5, 6];
  const blockB = [5, 6, 7, 8, 9, 10]; // Allow flexible overlap, placeSpecial will pick first available

  if (grade === 1) {
    if (pjokKey) placeSpecial(pjokKey, 'tuesday', blockA);
    if (paibpKey) placeSpecial(paibpKey, 'wednesday', blockB);
    if (sbKey) placeSpecial(sbKey, 'thursday', blockA);
  } else if (grade === 2) {
    if (pjokKey) placeSpecial(pjokKey, 'wednesday', blockA);
    if (paibpKey) placeSpecial(paibpKey, 'thursday', blockB);
    if (sbKey) placeSpecial(sbKey, 'monday', blockB);
  } else if (grade === 3) {
    if (pjokKey) placeSpecial(pjokKey, 'thursday', blockA);
    if (paibpKey) placeSpecial(paibpKey, 'monday', blockB);
    if (sbKey) placeSpecial(sbKey, 'tuesday', blockA);
  } else if (grade === 4) {
    if (pjokKey) placeSpecial(pjokKey, 'tuesday', blockB);
    if (paibpKey) placeSpecial(paibpKey, 'wednesday', blockA);
    if (sbKey) placeSpecial(sbKey, 'thursday', blockB);
  } else if (grade === 5) {
    if (pjokKey) placeSpecial(pjokKey, 'wednesday', blockB);
    if (paibpKey) placeSpecial(paibpKey, 'thursday', blockA);
    if (sbKey) placeSpecial(sbKey, 'monday', blockA);
  } else if (grade === 6) {
    if (pjokKey) placeSpecial(pjokKey, 'thursday', blockB);
    if (paibpKey) placeSpecial(paibpKey, 'monday', blockA);
    if (sbKey) placeSpecial(sbKey, 'tuesday', blockB);
  }

  // 5. Kokurikuler placement
  const kokoSubstrings = ['Bangun pagi', 'Beribadah', 'Berolahraga', 'Makan sehat', 'Gemar Belajar', 'Bermasyarakat'];
  kokoSubstrings.forEach((kokoStr, index) => {
    const kokoKey = Object.keys(requiredHours).find(k => k.includes(kokoStr));
    if (!kokoKey || requiredHours[kokoKey] <= 0) return;

    // Distribute across days cyclically
    const targetDay = days[index % days.length];
    
    let placed = false;
    const preferredSlots = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]; // Fall into the earliest natural hole to prevent schedule gaps

    for (const slotIdx of preferredSlots) {
      if (!getSub(targetDay, slotIdx)) {
        setSub(targetDay, [slotIdx], kokoKey);
        placed = true;
        break;
      }
    }

    if (!placed) {
      for (const d of days) {
        for (const slotIdx of preferredSlots) {
          if (!getSub(d, slotIdx)) {
            setSub(d, [slotIdx], kokoKey);
            placed = true;
            break;
          }
        }
        if (placed) break;
      }
    }
  });

  // Older Kokurikuler handling if not 2024
  const oldKokoKey = Object.keys(requiredHours).find(k => k.toUpperCase().includes('KOKURIKULER') && !k.includes(':'));
  if (oldKokoKey && requiredHours[oldKokoKey] > 0) {
    for (let i = 0; i < requiredHours[oldKokoKey]; i++) {
        for (const d of days) {
            let placed = false;
            for (let slotIdx = 6; slotIdx >= 1; slotIdx--) {
              if (!getSub(d, slotIdx)) {
                  setSub(d, [slotIdx], oldKokoKey);
                  placed = true;
                  break;
              }
            }
            if (placed) break;
        }
    }
  }

  // 6. Fill the rest of the required hours generically
  let remainingSubjects: string[] = [];
  Object.keys(requiredHours).forEach(subj => {
    for (let i = 0; i < requiredHours[subj]; i++) {
        remainingSubjects.push(subj);
    }
  });

  // Sort vaguely to interleave subjects
  let interleaved: string[] = [];
  while (remainingSubjects.length > 0) {
      const distinct = [...new Set(remainingSubjects)];
      distinct.forEach(sub => {
          interleaved.push(sub);
          const i = remainingSubjects.indexOf(sub);
          if (i > -1) remainingSubjects.splice(i, 1);
      });
  }

  let genericIdx = 0;
  // Fill horizontally row-by-row to guarantee evenly balanced end times ("jam pulang") across all days
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].forEach(slotIdx => {
    days.forEach(day => {
      if (genericIdx >= interleaved.length) return; // All required hours are scheduled!
      
      const r = schedule.find(item => item.id === String(slotIdx));
      if (r && !getSub(day, slotIdx)) {
          setSub(day, [slotIdx], interleaved[genericIdx]);
          genericIdx++;
      }
    });
  });

  // Just to be safe, if we still have remaining interleaved subjects, force them into any empty slots
  while (genericIdx < interleaved.length) {
      let placed = false;
      for (let slotIdx = 1; slotIdx <= 12; slotIdx++) {
          for (const day of days) {
              if (!getSub(day, slotIdx)) {
                  setSub(day, [slotIdx], interleaved[genericIdx]);
                  genericIdx++;
                  placed = true;
                  break;
              }
          }
          if (placed) break;
      }
      if (!placed) break; // literally no more cells
  }

  // Clear remaining empties to "-"
  schedule.forEach(r => {
    days.forEach(day => {
      if (!(r as any)[day] && r.id !== 'break1' && r.id !== 'break2') {
          (r as any)[day] = '-';
      }
    });
  });

  return schedule;
}
