import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, HeadingLevel, PageOrientation, VerticalAlign } from 'docx';
import { saveAs } from 'file-saver';
import { SchoolIdentity, Holiday } from '../types';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, format, isWithinInterval, parseISO, isSameDay } from 'date-fns';
import { id } from 'date-fns/locale';

export const exportToWord = async (
  identity: SchoolIdentity,
  startYear: number,
  holidays: Holiday[],
  paperSize: 'A4' | 'F4'
) => {
  // Dimensions in twips (1 mm = 56.7 twips)
  const width = 11906;
  const height = paperSize === 'A4' ? 16838 : 18709;

  const getHolidayForDate = (date: Date) => {
    return holidays.find(h => {
      const start = parseISO(h.date);
      if (h.endDate) {
        const end = parseISO(h.endDate);
        return isWithinInterval(date, { start, end });
      }
      return isSameDay(date, start);
    });
  };

  const createMonthTable = (monthDate: Date) => {
    const monthStart = startOfMonth(monthDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
    const daysInInterval = eachDayOfInterval({ start: startDate, end: endDate });

    const headerRow = new TableRow({
      children: ['Mg', 'Sn', 'Sl', 'Rb', 'Km', 'Jm', 'Sb'].map((d, i) => 
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
      const holiday = getHolidayForDate(currentDay);
      
      let fill = "FFFFFF";
      let color = "000000";
      
      if (!isCurrentMonth) {
        fill = "F9FAFB";
        color = "D1D5DB";
      } else if (holiday) {
        fill = holiday.color.replace('#', '');
        color = "FFFFFF";
      } else if (isSunday) {
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
                  size: 20 // 10pt
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

  const months = [
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear, 6 + i, 1)),
    ...Array.from({ length: 6 }).map((_, i) => new Date(startYear + 1, i, 1))
  ];

  // We will arrange months in a 3-column layout per semester
  // Docx doesn't support grid easily, so we use a master table for layout
  const createSemesterLayout = (semesterMonths: Date[]) => {
    const masterRows = [];
    // 2 rows of 3 months
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

  const doc = new Document({
    styles: {
      paragraphStyles: [
        {
          id: "MonthHeader",
          name: "Month Header",
          basedOn: "Normal",
          next: "Normal",
          run: { size: 16, bold: true, color: "374151" } // 8pt
        }
      ]
    },
    sections: [{
      properties: {
        page: {
          size: { width, height },
          margin: { top: 720, right: 720, bottom: 720, left: 720 }, // 0.5 inch margins
          pageNumbers: { start: 1, formatType: "DECIMAL" }
        }
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
        
        // Semester 1
        new Paragraph({
          children: [new TextRun({ text: "SEMESTER 1", bold: true, size: 24 })],
          spacing: { before: 200, after: 200 }
        }),
        createSemesterLayout(months.slice(0, 6)),

        // Semester 2
        new Paragraph({
          children: [new TextRun({ text: "SEMESTER 2", bold: true, size: 24 })],
          spacing: { before: 400, after: 200 }
        }),
        createSemesterLayout(months.slice(6, 12)),

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

        // Signatures
        new Paragraph({
          children: [],
          spacing: { before: 600 }
        }),
        new Table({
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
                    new Paragraph({ text: "Guru / Wali Kelas", alignment: AlignmentType.CENTER, spacing: { after: 1200 } }),
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
  saveAs(blob, `Kalender_Pendidikan_${identity.name.replace(/\s+/g, '_')}_${startYear}.docx`);
};
