import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, PageBreak, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { TeacherIdentity, Holiday, ScheduleItem, CurriculumSubject } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, isWithinInterval, parseISO, isSameDay, getDay } from 'date-fns';
import { id } from 'date-fns/locale';
import { calculateHBEPerDay } from './calendarUtils';

export const exportTeacherWord = async (
  identity: TeacherIdentity,
  startYear: number,
  holidays: Holiday[],
  grade: number,
  schedule: ScheduleItem[],
  curriculum: CurriculumSubject[],
  schoolDays: 5 | 6,
  paperSize: 'A4' | 'F4'
) => {
  const width = 11906;
  const height = paperSize === 'A4' ? 16838 : 18709;

  // Improved helper for holiday detection
  const getHolidayForDate = (date: Date) => {
    // 1. Get holidays (teacher report might also need grade-specific ones if passed, but currently it's just 'holidays')
    // We'll keep it simple for now as 'holidays' is already passed as the class-specific one for teachers in the app logic
    return holidays.find(h => {
      const start = parseISO(h.date);
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

        // Find holidays falling into this month
        const monthStart = startOfMonth(monthDate);
        const monthEnd = endOfMonth(monthDate);
        const monthHolidays = holidays.filter(h => {
          const start = parseISO(h.date);
          const end = h.endDate ? parseISO(h.endDate) : start;
          const startOnly = new Date(start.getFullYear(), start.getMonth(), start.getDate());
          const endOnly = new Date(end.getFullYear(), end.getMonth(), end.getDate());
          return startOnly <= monthEnd && endOnly >= monthStart;
        }).sort((a, b) => parseISO(a.date).getTime() - parseISO(b.date).getTime());

        const holidayParagraphs = monthHolidays.map((h, idx) => {
          const isMultiDday = h.endDate && h.endDate !== h.date;
          let dateStr = "";
          const hStart = parseISO(h.date);
          
          if (isMultiDday) {
            const hEnd = parseISO(h.endDate as string);
            if (hStart.getMonth() === hEnd.getMonth()) {
               dateStr = `${format(hStart, 'd')}-${format(hEnd, 'd')} ${format(hStart, 'MMM', { locale: id })}`;
            } else {
               dateStr = `${format(hStart, 'd')} ${format(hStart, 'MMM', { locale: id })} - ${format(hEnd, 'd')} ${format(hEnd, 'MMM', { locale: id })}`;
            }
          } else {
            dateStr = `${format(hStart, 'd MMM yyyy', { locale: id })}`;
          }

          return new Paragraph({
            children: [
              new TextRun({ text: `${idx + 1}. `, size: 16 }),
              new TextRun({ text: `${dateStr}: `, size: 16, bold: true }),
              new TextRun({ text: h.description, size: 16 })
            ],
            spacing: { before: 40, after: 0 }
          });
        });

        rowCells.push(
          new TableCell({
            children: [
              new Paragraph({
                text: format(monthDate, 'MMMM yyyy', { locale: id }),
                alignment: AlignmentType.CENTER,
                heading: HeadingLevel.HEADING_3,
                spacing: { after: 100 }
              }),
              createMonthTable(monthDate),
              new Paragraph({ spacing: { before: 80 } }),
              ...holidayParagraphs
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

  const createHBEAnalysis = (semester: 1 | 2) => {
    const months = semester === 1
      ? Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1))
      : Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1));

    const data = months.map(monthDate => {
      const start = startOfMonth(monthDate);
      const end = endOfMonth(monthDate);
      const days = eachDayOfInterval({ start, end });
      const counts = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

      days.forEach(day => {
        const dayOfWeek = getDay(day);
        if (dayOfWeek >= 1 && dayOfWeek <= schoolDays) {
          if (!getHolidayForDate(day)) {
            counts[dayOfWeek as keyof typeof counts]++;
          }
        }
      });

      const total = Object.values(counts).reduce((a, b) => a + b, 0);
      let monthName = format(monthDate, 'MMM-yy', { locale: id });
      monthName = monthName.replace('Agt', 'Agust').replace('Nov', 'Nop');

      return { name: monthName, counts, total };
    });

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

    const headerCells = [
      new TableCell({ children: [new Paragraph({ text: "Bulan", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Senin", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Selasa", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Rabu", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Kamis", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Jum'at", alignment: AlignmentType.CENTER, bold: true })] }),
    ];
    if (schoolDays === 6) {
      headerCells.push(new TableCell({ children: [new Paragraph({ text: "Sabtu", alignment: AlignmentType.CENTER, bold: true })] }));
    }
    headerCells.push(new TableCell({ children: [new Paragraph({ text: "Jumlah", alignment: AlignmentType.CENTER, bold: true })] }));

    const rows = [new TableRow({ children: headerCells })];

    data.forEach((row) => {
      const rowCells = [
        new TableCell({ children: [new Paragraph({ text: row.name })] }),
        new TableCell({ children: [new Paragraph({ text: row.counts[1].toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: row.counts[2].toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: row.counts[3].toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: row.counts[4].toString(), alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: row.counts[5].toString(), alignment: AlignmentType.CENTER })] }),
      ];
      if (schoolDays === 6) {
        rowCells.push(new TableCell({ children: [new Paragraph({ text: row.counts[6] > 0 ? row.counts[6].toString() : '', alignment: AlignmentType.CENTER })], shading: { fill: "B5A67E" } }));
      }
      rowCells.push(new TableCell({ children: [new Paragraph({ text: row.total.toString(), alignment: AlignmentType.CENTER, bold: true })] }));
      rows.push(new TableRow({ children: rowCells }));
    });

    const totalCells = [
      new TableCell({ children: [new Paragraph({ text: "Jumlah", bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: totals[1].toString(), alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: totals[2].toString(), alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: totals[3].toString(), alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: totals[4].toString(), alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: totals[5].toString(), alignment: AlignmentType.CENTER, bold: true })] }),
    ];
    if (schoolDays === 6) {
      totalCells.push(new TableCell({ children: [new Paragraph({ text: totals[6] > 0 ? totals[6].toString() : '', alignment: AlignmentType.CENTER, bold: true })], shading: { fill: "B5A67E" } }));
    }
    totalCells.push(new TableCell({ children: [new Paragraph({ text: totals.total.toString(), alignment: AlignmentType.CENTER, bold: true })] }));
    rows.push(new TableRow({ children: totalCells }));

    return new Table({
      rows: rows,
      width: { size: 100, type: WidthType.PERCENTAGE },
    });
  };

  const createCurriculumTable = () => {
    const headerCells = [
      new TableCell({ children: [new Paragraph({ text: "NO", alignment: AlignmentType.CENTER, bold: true })], width: { size: 10, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: "Muatan Pelajaran", alignment: AlignmentType.CENTER, bold: true })], width: { size: 70, type: WidthType.PERCENTAGE } }),
      new TableCell({ children: [new Paragraph({ text: "Jampel / per minggu", alignment: AlignmentType.CENTER, bold: true })], width: { size: 20, type: WidthType.PERCENTAGE } }),
    ];
    const rows = [new TableRow({ children: headerCells })];

    let totalHours = 0;
    curriculum.forEach(subject => {
      totalHours += subject.hoursPerWeek;
      rows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: subject.no, alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: subject.name })] }),
          new TableCell({ children: [new Paragraph({ text: subject.hoursPerWeek.toString(), alignment: AlignmentType.CENTER })] }),
        ]
      }));
    });

    rows.push(new TableRow({
      children: [
        new TableCell({ children: [new Paragraph({ text: "Jumlah", alignment: AlignmentType.CENTER, bold: true })], columnSpan: 2 }),
        new TableCell({ children: [new Paragraph({ text: totalHours.toString(), alignment: AlignmentType.CENTER, bold: true })] }),
      ]
    }));

    return new Table({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  };

  const createScheduleTable = () => {
    const headerCells = [
      new TableCell({ children: [new Paragraph({ text: "Waktu", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Senin", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Selasa", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Rabu", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Kamis", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Jumat", alignment: AlignmentType.CENTER, bold: true })] }),
    ];
    if (schoolDays === 6) {
      headerCells.push(new TableCell({ children: [new Paragraph({ text: "Sabtu", alignment: AlignmentType.CENTER, bold: true })] }));
    }
    const rows = [new TableRow({ children: headerCells })];

    schedule.forEach(item => {
      const rowCells = [
        new TableCell({ children: [new Paragraph({ text: item.time, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.monday, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.tuesday, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.wednesday, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.thursday, alignment: AlignmentType.CENTER })] }),
        new TableCell({ children: [new Paragraph({ text: item.friday, alignment: AlignmentType.CENTER })] }),
      ];
      if (schoolDays === 6) {
        rowCells.push(new TableCell({ children: [new Paragraph({ text: item.saturday || '', alignment: AlignmentType.CENTER })] }));
      }
      rows.push(new TableRow({ children: rowCells }));
    });

    return new Table({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  };

  const createTimeAllocationTable = (semester: 1 | 2) => {
    const hbePerDay = calculateHBEPerDay(startYear, semester, holidays, schoolDays);
    const scheduleCounts: Record<string, Record<number, number>> = {};
    const daysToIterate = schoolDays === 5 ? [1, 2, 3, 4, 5] : [1, 2, 3, 4, 5, 6];
    const dayKeys: Record<number, keyof ScheduleItem> = {
      1: 'monday', 2: 'tuesday', 3: 'wednesday', 4: 'thursday', 5: 'friday', 6: 'saturday'
    };
    const dayNames: Record<number, string> = {
      1: 'Senin', 2: 'Selasa', 3: 'Rabu', 4: 'Kamis', 5: "Jum'at", 6: 'Sabtu'
    };
    
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

    const headerCells = [
      new TableCell({ children: [new Paragraph({ text: "No", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Mapel", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Jam/mg", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Hari (dijadwal)", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Jml HBE", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Jam pel", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Total Jampel", alignment: AlignmentType.CENTER, bold: true })] }),
      new TableCell({ children: [new Paragraph({ text: "Keterangan", alignment: AlignmentType.CENTER, bold: true })] }),
    ];
    const rows = [new TableRow({ children: headerCells })];

    curriculum.forEach(subject => {
      const upperName = subject.name.trim().toUpperCase();
      const occurrences = scheduleCounts[upperName] || {};
      const daysScheduled = Object.keys(occurrences).map(Number).sort((a, b) => a - b);
      
      const details = daysScheduled.map(dayNum => {
        const jmlHBE = hbePerDay[dayNum as keyof typeof hbePerDay];
        const jamPel = occurrences[dayNum];
        return { dayNum, dayName: dayNames[dayNum], jmlHBE, jamPel, total: jmlHBE * jamPel };
      });

      const rowSpan = details.length > 0 ? details.length : 1;
      const firstDetail = details.length > 0 ? details[0] : { dayName: '', jmlHBE: '', jamPel: '', total: '' };

      rows.push(new TableRow({
        children: [
          new TableCell({ children: [new Paragraph({ text: subject.no, alignment: AlignmentType.CENTER })], rowSpan }),
          new TableCell({ children: [new Paragraph({ text: subject.name })], rowSpan }),
          new TableCell({ children: [new Paragraph({ text: subject.hoursPerWeek.toString(), alignment: AlignmentType.CENTER })], rowSpan }),
          new TableCell({ children: [new Paragraph({ text: firstDetail.dayName, alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: firstDetail.jmlHBE.toString(), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: firstDetail.jamPel.toString(), alignment: AlignmentType.CENTER })] }),
          new TableCell({ children: [new Paragraph({ text: firstDetail.total.toString(), alignment: AlignmentType.CENTER, bold: true })] }),
          new TableCell({ children: [new Paragraph({ text: "" })], rowSpan, shading: { fill: "D1D5DB" } }),
        ]
      }));

      for (let i = 1; i < details.length; i++) {
        rows.push(new TableRow({
          children: [
            new TableCell({ children: [new Paragraph({ text: details[i].dayName, alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: details[i].jmlHBE.toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: details[i].jamPel.toString(), alignment: AlignmentType.CENTER })] }),
            new TableCell({ children: [new Paragraph({ text: details[i].total.toString(), alignment: AlignmentType.CENTER, bold: true })] }),
          ]
        }));
      }
    });

    return new Table({ rows: rows, width: { size: 100, type: WidthType.PERCENTAGE } });
  };

  const months = [
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1)),
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1))
  ];

  const createSignatures = () => {
    return new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
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
                new Paragraph({ text: `${identity.city}, 15 Juli ${startYear}`, alignment: AlignmentType.CENTER }),
                new Paragraph({ text: `Guru Kelas ${grade}`, alignment: AlignmentType.CENTER, spacing: { after: 1200 } }),
                new Paragraph({ text: identity.name, alignment: AlignmentType.CENTER, bold: true }),
                new Paragraph({ text: `NIP. ${identity.nip || '-'}`, alignment: AlignmentType.CENTER })
              ],
              width: { size: 50, type: WidthType.PERCENTAGE }
            })
          ]
        })
      ]
    });
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
        page: {
          size: { width, height },
          margin: { top: 720, right: 720, bottom: 720, left: 720 },
          pageNumbers: { start: 1, formatType: "DECIMAL" }
        }
      },
      children: [
        // Title
        new Paragraph({
          children: [new TextRun({ text: "ADMINISTRASI GURU KELAS", bold: true, size: 32 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: identity.schoolName.toUpperCase(), bold: true, size: 28 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 100 }
        }),
        new Paragraph({
          children: [new TextRun({ text: `Tahun Pelajaran ${startYear}/${startYear + 1}`, size: 24 })],
          alignment: AlignmentType.CENTER,
          spacing: { after: 400 }
        }),

        // Calendar Semester 1
        new Paragraph({ children: [new TextRun({ text: "KALENDER PENDIDIKAN SEMESTER 1", bold: true, size: 24 })], spacing: { before: 200, after: 200 } }),
        createSemesterLayout(months.slice(0, 6)),

        // Calendar Semester 2
        new Paragraph({ children: [new TextRun({ text: "KALENDER PENDIDIKAN SEMESTER 2", bold: true, size: 24 })], spacing: { before: 400, after: 200 } }),
        createSemesterLayout(months.slice(6, 12)),

        new Paragraph({ children: [new PageBreak()] }),

        // HBE Analysis Semester 1
        new Paragraph({ children: [new TextRun({ text: `ANALISIS HARI EFEKTIF BELAJAR KELAS ${grade} SEMESTER 1`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createHBEAnalysis(1),
        new Paragraph({ children: [], spacing: { after: 400 } }),

        // HBE Analysis Semester 2
        new Paragraph({ children: [new TextRun({ text: `ANALISIS HARI EFEKTIF BELAJAR KELAS ${grade} SEMESTER 2`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createHBEAnalysis(2),

        new Paragraph({ children: [new PageBreak()] }),

        // Curriculum Structure
        new Paragraph({ children: [new TextRun({ text: `STRUKTUR KURIKULUM KELAS ${grade}`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createCurriculumTable(),

        new Paragraph({ children: [new PageBreak()] }),

        // Schedule
        new Paragraph({ children: [new TextRun({ text: `JADWAL PELAJARAN KELAS ${grade}`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createScheduleTable(),

        new Paragraph({ children: [new PageBreak()] }),

        // Time Allocation Semester 1
        new Paragraph({ children: [new TextRun({ text: `ALOKASI WAKTU SEMESTER 1`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createTimeAllocationTable(1),
        new Paragraph({ children: [], spacing: { after: 400 } }),

        // Time Allocation Semester 2
        new Paragraph({ children: [new TextRun({ text: `ALOKASI WAKTU SEMESTER 2`, bold: true, size: 24 })], alignment: AlignmentType.CENTER, spacing: { after: 200 } }),
        createTimeAllocationTable(2),

        createSignatures()
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `Administrasi_Guru_Kelas_${grade}_${startYear}.docx`);
};
