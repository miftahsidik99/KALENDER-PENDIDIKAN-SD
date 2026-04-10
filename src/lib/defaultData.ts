import { Holiday, CurriculumSubject } from "../types";

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

export const defaultColors = [
  "#ef4444", // Red (Libur Nasional)
  "#3b82f6", // Blue (Kegiatan Sekolah)
  "#10b981", // Green (Awal Masuk)
  "#f59e0b", // Yellow (Ujian/Asesmen)
  "#8b5cf6", // Purple (Pembagian Rapor)
  "#ec4899", // Pink (Libur Semester)
];

export const getDefaultHolidays = (startYear: number): Holiday[] => {
  return [
    { id: "1", date: `${startYear}-07-15`, description: "Hari Pertama Masuk Sekolah", color: "#10b981" },
    { id: "2", date: `${startYear}-07-15`, endDate: `${startYear}-07-17`, description: "Masa Pengenalan Lingkungan Sekolah (MPLS)", color: "#3b82f6" },
    { id: "3", date: `${startYear}-08-17`, description: "Libur Hari Kemerdekaan RI", color: "#ef4444" },
    { id: "4", date: `${startYear}-12-02`, endDate: `${startYear}-12-14`, description: "Prakiraan Penilaian Akhir Semester 1", color: "#f59e0b" },
    { id: "5", date: `${startYear}-12-20`, description: "Tanggal Penetapan Rapor Semester 1", color: "#8b5cf6" },
    { id: "6", date: `${startYear}-12-23`, endDate: `${startYear + 1}-01-04`, description: "Libur Semester 1", color: "#ec4899" },
    { id: "7", date: `${startYear + 1}-01-06`, description: "Hari Pertama Masuk Sekolah Semester 2", color: "#10b981" },
    { id: "8", date: `${startYear + 1}-03-31`, endDate: `${startYear + 1}-04-01`, description: "Prakiraan Libur Hari Raya Idul Fitri", color: "#ef4444" },
    { id: "9", date: `${startYear + 1}-06-09`, endDate: `${startYear + 1}-06-21`, description: "Prakiraan Penilaian Akhir Tahun", color: "#f59e0b" },
    { id: "10", date: `${startYear + 1}-06-27`, description: "Tanggal Penetapan Rapor Semester 2", color: "#8b5cf6" },
    { id: "11", date: `${startYear + 1}-06-30`, endDate: `${startYear + 1}-07-12`, description: "Libur Akhir Tahun Pelajaran", color: "#ec4899" },
  ];
};
