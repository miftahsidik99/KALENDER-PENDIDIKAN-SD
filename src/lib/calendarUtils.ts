import { Holiday } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval, getDay } from 'date-fns';

export const isHoliday = (date: Date, holidays: Holiday[]) => {
  return holidays.some(h => {
    const start = parseISO(h.date);
    if (h.endDate) {
      const end = parseISO(h.endDate);
      return isWithinInterval(date, { start, end });
    }
    return isSameDay(date, start);
  });
};

export const calculateHBEPerDay = (startYear: number, semester: 1 | 2, holidays: Holiday[], schoolDays: 5 | 6 = 6) => {
  const months = semester === 1
    ? Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1))
    : Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1));

  const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

  months.forEach(monthDate => {
    const start = startOfMonth(monthDate);
    const end = endOfMonth(monthDate);
    const days = eachDayOfInterval({ start, end });

    days.forEach(day => {
      const dayOfWeek = getDay(day);
      if (dayOfWeek >= 1 && dayOfWeek <= schoolDays) {
        if (!isHoliday(day, holidays)) {
          counts[dayOfWeek as keyof typeof counts]++;
        }
      }
    });
  });

  return counts;
};
