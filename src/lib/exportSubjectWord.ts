import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, PageOrientation, VerticalAlign, PageBreak, HeightRule } from 'docx';
import { saveAs } from 'file-saver';
import { SchoolIdentity, Holiday, ScheduleItem } from '../types';
import { startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, isWithinInterval, format, getDay, startOfWeek, endOfWeek, isSameMonth } from 'date-fns';
import { id } from 'date-fns/locale';

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

export const exportSubjectWord = async (
  subject: string,
  identity: SchoolIdentity,
  startYear: number,
  holidays: Holiday[],
  schoolDays: 5 | 6,
  schedules: Record<number, ScheduleItem[]>,
  classHolidays: Record<number, Holiday[]>,
  paperSize: 'A4' | 'F4'
) => {
  const width = 11906;
  const height = paperSize === 'A4' ? 16838 : 18709;

  const getHolidayForDate = (date: Date, grade?: number) => {
    // 1. Get class-specific holidays, or fallback to global holidays
    const activeHolidays = (grade !== undefined && classHolidays[grade] && classHolidays[grade].length > 0) ? classHolidays[grade] : holidays;
    
    return activeHolidays.find(h => {
      const start = parseISO(h.date);
      // Ensure date is compared correctly with start/end regardless of time
      const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
      
      if (h.endDate) {
        const end = parseISO(h.endDate);
        const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        return dateOnly >= startOnly && dateOnly <= endOnly;
      }
      return dateOnly.getTime() === startOnly.getTime();
    });
  };

  const isHoliday = (date: Date, grade?: number) => !!getHolidayForDate(date, grade);

  // === VISUAL CALENDAR FUNCTIONS ===
  const createMonthTable = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const headerRow = new TableRow({
      children: ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((d) => 
        new TableCell({
          children: [new Paragraph({ text: d, alignment: AlignmentType.CENTER, style: "MonthHeader" })],
          shading: { fill: "F3F4F6" },
          verticalAlign: VerticalAlign.CENTER,
        })
      )
    });

    const rows = [headerRow];
    let currentRowCells: TableCell[] = [];

    daysInInterval.forEach((currentDay, i) => {
      const isCurrentMonth = isSameMonth(currentDay, monthStart);
      const isSunday = currentDay.getDay() === 0;
      const isSaturdayDay = currentDay.getDay() === 6;
      const isNonEffective = isSunday || (schoolDays === 5 && isSaturdayDay);
      const holiday = getHolidayForDate(currentDay);
      
      let fill = "FFFFFF";
      let color = "000000";
      
      if (!isCurrentMonth) {
        fill = "F9FAFB";
        color = "D1D5DB";
      } else if (holiday) {
        fill = holiday.color.replace('#', '');
        color = "FFFFFF";
      } else if (isNonEffective) {
        color = "EF4444";
      }

      currentRowCells.push(
        new TableCell({
          children: [
            new Paragraph({
              children: [
                new TextRun({
                  text: format(currentDay, 'd'),
                  color: color,
                  bold: !!holiday,
                  size: 20
                })
              ],
              alignment: AlignmentType.CENTER,
            })
          ],
          shading: { fill: fill },
          verticalAlign: VerticalAlign.CENTER,
          margins: { top: 100, bottom: 100 }
        })
      );

      if ((i + 1) % 7 === 0) {
        rows.push(new TableRow({ children: currentRowCells }));
        currentRowCells = [];
      }
    });

    return new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        bottom: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        left: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        right: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        insideHorizontal: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
        insideVertical: { style: BorderStyle.SINGLE, size: 1, color: "E5E7EB" },
      }
    });
  };

  const createSemesterLayout = (semesterMonths: Date[]) => {
    const masterRows = [];
    for (let i = 0; i < 2; i++) {
      const rowCells = [];
      for (let j = 0; j < 3; j++) {
        const monthDate = semesterMonths[i * 3 + j];
        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                text: format(monthDate, 'MMMM yyyy', { locale: id }),
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 100 }
              }),
              createMonthTable(monthDate)
            ],
            margins: { left: 100, right: 100, top: 100, bottom: 100 },
            borders: {
              top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
              right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            }
          })
        );
      }
      masterRows.push(new TableRow({ children: rowCells }));
    }
    return new Table({
      rows: masterRows,
      width: { size: 100, type: WidthType.PERCENTAGE },
      borders: {
        top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
        insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
      }
    });
  };

  const calMonths = [
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1)),
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1))
  ];
  // === END VISUAL CALENDAR FUNCTIONS ===

  // Pre-calculate what days and periods the subject is taught for each class
  const classInfos: Record<number, { days: number[], hoursPerWeek: number, scheduleInfo: { day: number, periods: number[] }[] }> = {};
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
              daysMap.set(dayNum, Array.from(new Set(existing)));
            }
          }
        }
      });
    }
    
    classInfos[grade] = {
      days: Array.from(daysMap.keys()),
      hoursPerWeek,
      scheduleInfo: Array.from(daysMap.entries()).map(([day, periods]) => ({ day, periods: periods.sort((a,b)=>a-b) }))
    };
  }

  const calculateSemesterData = (semester: 1 | 2) => {
    const months = semester === 1
      ? Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1))
      : Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1));

    const monthData = months.map(monthDate => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });

      let monthName = format(monthDate, 'MMM-yy', { locale: id });
      // Special requested formats for month names in table
      monthName = monthName.replace('Agt', 'Agust').replace('Nov', 'Nop');

      const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
      
      for (let grade = 1; grade <= 6; grade++) {
        const daysTaught = classInfos[grade].days;
        let count = 0;
        days.forEach(day => {
          const dayOfWeek = getDay(day);
          if (daysTaught.includes(dayOfWeek) && !isHoliday(day, grade)) {
            count++;
          }
        });
        counts[grade] = count;
      }
      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      return { name: monthName, counts, total };
    });

    const totals = monthData.reduce((acc, curr) => {
      acc[1] += curr.counts[1]; acc[2] += curr.counts[2]; acc[3] += curr.counts[3];
      acc[4] += curr.counts[4]; acc[5] += curr.counts[5]; acc[6] += curr.counts[6];
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
      classStats[grade] = { hbe: totalHBE, totalHours };
    }
    return { monthData, totals, classStats };
  };

  const smt1 = calculateSemesterData(1);
  const smt2 = calculateSemesterData(2);

  const createCell = (text: string | number, bold = false, shading = "FFFFFF", align = AlignmentType.CENTER, span = 1) => {
    return new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: String(text), bold, size: 20 })], alignment: align })],
      shading: { fill: shading },
      verticalAlign: VerticalAlign.CENTER,
      columnSpan: span,
      margins: { top: 50, bottom: 50, left: 100, right: 100 }
    });
  };

  // Table 1: Analisa HBE
  const createTableAnalisaHBE = () => {
    const rows: TableRow[] = [];
    
    // Header
    const headerCols = [
      new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "HARI", bold: true, size: 20 })] }), new Paragraph({ children: [new TextRun({ text: "BULAN", bold: true, size: 20 })] })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER })
    ];
    for(let i=1; i<=6; i++) {
        headerCols.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: classInfos[i].days.map(d => dayNames[d]).join(', ') || '-', size: 18 })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: `Kelas ${i}`, bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER }));
    }
    headerCols.push(new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "TOTAL /", bold: true, size: 20 })], alignment: AlignmentType.CENTER }), new Paragraph({ children: [new TextRun({ text: "BULAN", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER }));
    rows.push(new TableRow({ children: headerCols }));

    // Smt 1
    smt1.monthData.forEach(m => {
        const rowCols = [createCell(m.name.toUpperCase(), false, "FFFFFF", AlignmentType.LEFT)];
        for(let i=1; i<=6; i++) { rowCols.push(createCell(m.counts[i] || '')); }
        rowCols.push(createCell(m.total || '', true));
        rows.push(new TableRow({ children: rowCols }));
    });
    const smt1TotalCols = [createCell("TOTAL/SEMESTER 1", true, "F3F4F6", AlignmentType.LEFT)];
    for(let i=1; i<=6; i++) { smt1TotalCols.push(createCell(smt1.totals[i] || '0', true, "F3F4F6")); }
    smt1TotalCols.push(createCell(smt1.totals.total || '0', true, "F3F4F6"));
    rows.push(new TableRow({ children: smt1TotalCols }));

    // Spacer
    const spacerCols = [createCell("", false, "FFFFFF", AlignmentType.CENTER, 8)];
    rows.push(new TableRow({ children: spacerCols, height: { value: 200, rule: HeightRule.AT_LEAST } }));

    // Smt 2
    smt2.monthData.forEach(m => {
        const rowCols = [createCell(m.name.toUpperCase(), false, "FFFFFF", AlignmentType.LEFT)];
        for(let i=1; i<=6; i++) { rowCols.push(createCell(m.counts[i] || '')); }
        rowCols.push(createCell(m.total || '', true));
        rows.push(new TableRow({ children: rowCols }));
    });
    const smt2TotalCols = [createCell("TOTAL/SEMESTER 2", true, "F3F4F6", AlignmentType.LEFT)];
    for(let i=1; i<=6; i++) { smt2TotalCols.push(createCell(smt2.totals[i] || '0', true, "F3F4F6")); }
    smt2TotalCols.push(createCell(smt2.totals.total || '0', true, "F3F4F6"));
    rows.push(new TableRow({ children: smt2TotalCols }));

    // Total 1 & 2
    const totalCols = [createCell("TOTAL SEMESTER 1 & 2", true, "E5E7EB", AlignmentType.LEFT)];
    for(let i=1; i<=6; i++) { totalCols.push(createCell(smt1.totals[i] + smt2.totals[i], true, "E5E7EB")); }
    totalCols.push(createCell(smt1.totals.total + smt2.totals.total, true, "E5E7EB"));
    rows.push(new TableRow({ children: totalCols }));

    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: "autofit" });
  };

  const createTableJampel = (smtData: any) => {
    const rows: TableRow[] = [];
    rows.push(new TableRow({ children: [
        createCell("No", true, "F3F4F6"),
        createCell("K E L A S", true, "F3F4F6"),
        createCell("Jam/mg", true, "F3F4F6"),
        createCell("Hari (dijadwal)", true, "F3F4F6"),
        createCell("Jml HBE", true, "F3F4F6"),
        createCell("Jam Pel", true, "F3F4F6"),
        createCell("Total Jam/Smt", true, "E5E7EB"),
    ]}));

    for(let i=1; i<=6; i++) {
        const info = classInfos[i];
        const stats = smtData.classStats[i];
        rows.push(new TableRow({ children: [
            createCell(i),
            createCell(toRoman(i), true, "FFFFFF", AlignmentType.LEFT),
            createCell(info.hoursPerWeek || ''),
            createCell(info.days.map(d => dayNames[d]).join(', ') || '', false, "FFFFFF", AlignmentType.LEFT),
            createCell(stats.hbe || ''),
            createCell(info.hoursPerWeek || ''),
            createCell(stats.totalHours || '', true),
        ]}));
    }
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: "autofit" });
  };

  const createTablePengaturan = () => {
    const rows: TableRow[] = [];
    rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "MAPEL", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER, rowSpan: 2 }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "JAM PELAJARAN PERMINGGU", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER, columnSpan: 6 }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "Jumlah", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER, rowSpan: 2 }),
    ]}));
    const subheader = [];
    for(let i=1; i<=6; i++) subheader.push(createCell(`KLS ${i}`, true, "F3F4F6"));
    rows.push(new TableRow({ children: subheader }));

    const dataRow = [createCell(subject, true, "FFFFFF", AlignmentType.LEFT)];
    for(let i=1; i<=6; i++) dataRow.push(createCell(classInfos[i].hoursPerWeek || ''));
    dataRow.push(createCell([1,2,3,4,5,6].reduce((acc, g) => acc + (classInfos[g].hoursPerWeek || 0), 0) || '', true));
    rows.push(new TableRow({ children: dataRow }));

    const totalRow = [createCell("TOTAL", true, "F3F4F6", AlignmentType.LEFT)];
    for(let i=1; i<=6; i++) totalRow.push(createCell(classInfos[i].hoursPerWeek || '', true, "F3F4F6"));
    totalRow.push(createCell([1,2,3,4,5,6].reduce((acc, g) => acc + (classInfos[g].hoursPerWeek || 0), 0) || '', true, "F3F4F6"));
    rows.push(new TableRow({ children: totalRow }));
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: "autofit" });
  };

  const createTableJadwal = () => {
    const rows: TableRow[] = [];
    rows.push(new TableRow({ children: [
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "KELAS", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER, rowSpan: 2 }),
        new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: "HARI/JAMPEL", bold: true, size: 20 })], alignment: AlignmentType.CENTER })], shading: { fill: "F3F4F6" }, verticalAlign: VerticalAlign.CENTER, columnSpan: 2 }),
    ]}));
    rows.push(new TableRow({ children: [
        createCell("HARI", true, "F3F4F6"), createCell("JAM KE-", true, "F3F4F6")
    ]}));

    for(let i=1; i<=6; i++) {
        const info = classInfos[i];
        rows.push(new TableRow({ children: [
            createCell(toRoman(i), true),
            createCell(info.days.map(d => dayNames[d]).join(', ') || '', false, "FFFFFF", AlignmentType.LEFT),
            createCell(info.scheduleInfo.map(si => si.periods.join(', ')).join(' | ') || ''),
        ]}));
    }
    return new Table({ rows, width: { size: 100, type: WidthType.PERCENTAGE }, layout: "autofit" });
  };

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "MonthHeader",
          name: "Month Header",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 16, bold: true, color: "374151" }
        }
      ]
    },
    sections: [{
      properties: {
        page: { size: { width, height }, margin: { top: 720, right: 720, bottom: 720, left: 720 } }
      },
      children: [
        new Paragraph({
          children: [
            new TextRun({ text: `KALENDER PENDIDIKAN TAHUN PELAJARAN ${startYear}/${startYear + 1}`, bold: true, size: 32 })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [
            new TextRun({ text: identity.name.toUpperCase(), bold: true, size: 28 })
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),
        
        // Semester 1 Master Calendar
        new Paragraph({
          children: [new TextRun({ text: "SEMESTER 1", bold: true, size: 24 })],
          spacing: { before: 200, after: 200 }
        }),
        createSemesterLayout(calMonths.slice(0, 6)),

        // Semester 2 Master Calendar
        new Paragraph({
          children: [new TextRun({ text: "SEMESTER 2", bold: true, size: 24 })],
          spacing: { before: 400, after: 200 }
        }),
        createSemesterLayout(calMonths.slice(6, 12)),

        // Keterangan / Holidays
        new Paragraph({
          children: [new TextRun({ text: "KETERANGAN HARI LIBUR / NON-EFEKTIF:", bold: true, size: 20 })],
          spacing: { before: 400, after: 200 }
        }),
        ...holidays.map(h => {
          const dateStr = h.endDate 
            ? `${format(parseISO(h.date), 'dd MMM yyyy', { locale: id })} - ${format(parseISO(h.endDate), 'dd MMM yyyy', { locale: id })}`
            : format(parseISO(h.date), 'dd MMM yyyy', { locale: id });
            
          return new Paragraph({
            children: [
              new TextRun({ text: "■ ", color: h.color.replace('#', '') }),
              new TextRun({ text: `${dateStr} : `, bold: true, size: 20 }),
              new TextRun({ text: h.description, size: 20 })
            ],
            spacing: { after: 100 }
          });
        }),

        new Paragraph({ children: [new PageBreak()] }),

        // Below are the specific subject analytics: Analisa HBE
        new Paragraph({ children: [new TextRun({ text: `Analisa HBE Semester 1 dan 2 Kls I - VI Tahun Ajaran ${startYear}-${startYear+1}`, bold: true, size: 24 })], spacing: { after: 200 } }),
        createTableAnalisaHBE(),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Jampel calculations
        new Paragraph({ children: [new TextRun({ text: `PERHITUNGAN JUMLAH JAMPEL ${subject} SEMESTER 1`, bold: true, size: 24 })], spacing: { after: 200 } }),
        createTableJampel(smt1),
        new Paragraph({ spacing: { after: 400 } }),
        
        new Paragraph({ children: [new TextRun({ text: `PERHITUNGAN JUMLAH JAMPEL ${subject} SEMESTER 2`, bold: true, size: 24 })], spacing: { after: 200 } }),
        createTableJampel(smt2),
        new Paragraph({ children: [new PageBreak()] }),
        
        // Setting allocation and schedule
        new Paragraph({ children: [new TextRun({ text: `PENGATURAN JAM PELAJARAN K-13 DAN KURMED ${subject}`, bold: true, size: 24 })], spacing: { after: 200 } }),
        createTablePengaturan(),
        new Paragraph({ spacing: { after: 400 } }),
        
        new Paragraph({ children: [new TextRun({ text: `JADWAL PELAJARAN`, bold: true, size: 24 })], spacing: { after: 200 } }),
        createTableJadwal(),

        // Signatures
        new Paragraph({
          children: [],
          spacing: { before: 600 }
        }),
        new Table({
          width: { size: 100, type: WidthType.PERCENTAGE },
          layout: "autofit",
          borders: {
            top: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            bottom: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            left: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            right: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideHorizontal: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
            insideVertical: { style: BorderStyle.NONE, size: 0, color: "FFFFFF" },
          },
          rows: [
            new TableRow({
              children: [
                new TableCell({
                  children: [
                    new Paragraph({ text: "Mengetahui,", alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: "Kepala Sekolah", alignment: AlignmentType.CENTER, spacing: { after: 1200 } }),
                    new Paragraph({ text: identity.principalName, alignment: AlignmentType.CENTER, bold: true }),
                    new Paragraph({ text: `NIP. ${identity.principalNip || '-'}`, alignment: AlignmentType.CENTER })
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                }),
                new TableCell({
                  children: [
                    new Paragraph({ text: `${identity.city || '...........................................'}, 15 Juli ${startYear}`, alignment: AlignmentType.CENTER }),
                    new Paragraph({ text: `Guru ${subject}`, alignment: AlignmentType.CENTER, spacing: { after: 1200 } }),
                    new Paragraph({ text: "...................................", alignment: AlignmentType.CENTER, bold: true }),
                    new Paragraph({ text: "NIP. ..............................", alignment: AlignmentType.CENTER })
                  ],
                  width: { size: 50, type: WidthType.PERCENTAGE }
                })
              ]
            })
          ]
        })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Administrasi_Guru_${subject}_${startYear}.docx`);
};
