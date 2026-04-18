import { Holiday, CurriculumSubject, ScheduleItem } from "../types";

export const defaultCurriculum: CurriculumSubject[] = [
  { id: '1', no: '1', name: 'PAIBP', hoursPerWeek: 3 },
  { id: '2', no: '2', name: 'Pendidikan Pancasila', hoursPerWeek: 4 },
  { id: '3', no: '3', name: 'Bahasa Indonesia', hoursPerWeek: 7 },
  { id: '4', no: '4', name: 'Matematika', hoursPerWeek: 4 },
  { id: '5', no: '5', name: 'PJOK', hoursPerWeek: 3 },
  { id: '6', no: '6', name: 'Seni Budaya', hoursPerWeek: 3 },
  { id: '7', no: '7', name: 'Mulok/ Bahasa Sunda', hoursPerWeek: 2 },
  { id: '8', no: '8', name: 'Kokurikuler (GTKAIH)', hoursPerWeek: '' },
  { id: '8.1', no: '1.', name: 'Bangun pagi dan tidur cepat', hoursPerWeek: 1, isSubItem: true },
  { id: '8.2', no: '2.', name: 'Beribadah', hoursPerWeek: 1, isSubItem: true },
  { id: '8.3', no: '3.', name: 'Berolahraga', hoursPerWeek: 1, isSubItem: true },
  { id: '8.4', no: '4.', name: 'Makan sehat dan bergizi', hoursPerWeek: 1, isSubItem: true },
  { id: '8.5', no: '5.', name: 'Gemar Belajar', hoursPerWeek: 1, isSubItem: true },
  { id: '8.6', no: '6.', name: 'Bermasyarakat', hoursPerWeek: 1, isSubItem: true },
  { id: '9', no: '9', name: 'Guru Mengaji', hoursPerWeek: 2 },
  { id: '10', no: '10', name: 'Ekstrakurikuler / Pramuka', hoursPerWeek: 2 },
  { id: '11', no: '11', name: 'Upacara', hoursPerWeek: 1 },
];

export const defaultScheduleItems: ScheduleItem[] = [
  { id: '1', time: '07:00 - 07:40', monday: 'Upacara', tuesday: 'Pendidikan Pancasila', wednesday: 'Bahasa Indonesia', thursday: 'Matematika', friday: 'Senam', saturday: 'Pramuka' },
  { id: '2', time: '07:40 - 08:15', monday: 'PAIBP', tuesday: 'Pendidikan Pancasila', wednesday: 'Bahasa Indonesia', thursday: 'Matematika', friday: 'PAIBP', saturday: 'Ekskul' },
  { id: '3', time: '08:15 - 08:50', monday: 'PAIBP', tuesday: 'Bahasa Indonesia', wednesday: 'Bahasa Indonesia', thursday: 'Matematika', friday: 'PAIBP', saturday: 'Ekskul' },
  { id: '4', time: '08:50 - 09:25', monday: 'Bahasa Indonesia', tuesday: 'PJOK', wednesday: 'Seni Budaya', thursday: 'Matematika', friday: 'Mulok/ Bahasa Sunda', saturday: '-' },
  { id: '5', time: '09:25 - 10:00', monday: 'Bahasa Indonesia', tuesday: 'PJOK', wednesday: 'Seni Budaya', thursday: 'Pendidikan Pancasila', friday: 'Mulok/ Bahasa Sunda', saturday: '-' },
  { id: 'break1', time: '10:00 - 10:45', monday: 'ISTIRAHAT', tuesday: 'ISTIRAHAT', wednesday: 'ISTIRAHAT', thursday: 'ISTIRAHAT', friday: 'ISTIRAHAT', saturday: 'ISTIRAHAT' },
  { id: '6', time: '10:45 - 11:20', monday: 'Bahasa Indonesia', tuesday: 'PJOK', wednesday: 'Seni Budaya', thursday: 'Pendidikan Pancasila', friday: '-', saturday: '-' },
  { id: '7', time: '11:20 - 11:55', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
  { id: '8', time: '11:55 - 12:30', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
  { id: '9', time: '12:30 - 13:05', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
  { id: '10', time: '13:05 - 13:40', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
  { id: '11', time: '13:40 - 14:15', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
  { id: '12', time: '14:15 - 14:50', monday: '-', tuesday: '-', wednesday: '-', thursday: '-', friday: '-', saturday: '-' },
];

export const defaultColors = [
  // 100 distinct colors for calendar events
  "#ef4444", "#f97316", "#f59e0b", "#eab308", "#84cc16", "#22c55e", "#10b981", "#14b8a6", "#06b6d4", "#0ea5e9",
  "#3b82f6", "#6366f1", "#8b5cf6", "#a855f7", "#d946ef", "#ec4899", "#f43f5e", "#dc2626", "#ea580c", "#d97706",
  "#ca8a04", "#65a30d", "#16a34a", "#059669", "#0d9488", "#0891b2", "#0284c7", "#2563eb", "#4f46e5", "#7c3aed",
  "#9333ea", "#c026d3", "#db2777", "#e11d48", "#b91c1c", "#c2410c", "#b45309", "#a16207", "#4d7c0f", "#15803d",
  "#047857", "#0f766e", "#0e7490", "#0369a1", "#1d4ed8", "#4338ca", "#6d28d9", "#7e22ce", "#a21caf", "#be185d",
  "#be123c", "#991b1b", "#9a3412", "#92400e", "#854d0e", "#3f6212", "#166534", "#065f46", "#115e59", "#155e75",
  "#075985", "#1e3a8a", "#3730a3", "#5b21b6", "#6b21a8", "#86198f", "#9d174d", "#9f1239", "#7f1d1d", "#7c2d12",
  "#78350f", "#713f12", "#365314", "#14532d", "#064e3b", "#134e4a", "#164e63", "#0c4a6e", "#1e40af", "#312e81",
  "#4c1d95", "#581c87", "#701a75", "#831843", "#881337", "#fca5a5", "#fdba74", "#fcd34d", "#fde047", "#bef264",
  "#86efac", "#6ee7b7", "#5eead4", "#67e8f9", "#7dd3fc", "#93c5fd", "#a5b4fc", "#c4b5fd", "#d8b4fe", "#f0abfc"
];

export const getDefaultHolidays = (startYear: number): Holiday[] => {
  return [
    { id: "1", date: `${startYear}-07-01`, endDate: `${startYear}-07-13`, description: "Libur Akhir Tahun Pelajaran Sebelumnya", color: "#ec4899" },
    { id: "2", date: `${startYear}-07-15`, description: "Hari Pertama Masuk Sekolah", color: "#10b981" },
    { id: "3", date: `${startYear}-07-15`, endDate: `${startYear}-07-17`, description: "Masa Pengenalan Lingkungan Sekolah (MPLS)", color: "#3b82f6" },
    { id: "4", date: `${startYear}-08-17`, description: "Libur Hari Proklamasi Kemerdekaan RI", color: "#ef4444" },
    { id: "5", date: `${startYear}-12-02`, endDate: `${startYear}-12-14`, description: "Prakiraan Penilaian Akhir Semester 1", color: "#f59e0b" },
    { id: "6", date: `${startYear}-12-20`, description: "Tanggal Penetapan Rapor Semester 1", color: "#8b5cf6" },
    { id: "7", date: `${startYear}-12-23`, endDate: `${startYear + 1}-01-04`, description: "Libur Semester 1", color: "#ec4899" },
    { id: "8", date: `${startYear + 1}-01-06`, description: "Hari Pertama Masuk Sekolah Semester 2", color: "#10b981" },
    { id: "9", date: `${startYear + 1}-02-28`, endDate: `${startYear + 1}-03-02`, description: "Prakiraan Libur Awal Ramadhan", color: "#14b8a6" },
    { id: "10", date: `${startYear + 1}-03-24`, endDate: `${startYear + 1}-04-07`, description: "Prakiraan Libur Hari Raya Idul Fitri", color: "#ef4444" },
    { id: "11", date: `${startYear + 1}-06-09`, endDate: `${startYear + 1}-06-21`, description: "Prakiraan Penilaian Akhir Tahun", color: "#f59e0b" },
    { id: "12", date: `${startYear + 1}-06-27`, description: "Tanggal Penetapan Rapor Semester 2", color: "#8b5cf6" },
    { id: "13", date: `${startYear + 1}-06-30`, endDate: `${startYear + 1}-07-12`, description: "Libur Akhir Tahun Pelajaran", color: "#ec4899" },
  ];
};
