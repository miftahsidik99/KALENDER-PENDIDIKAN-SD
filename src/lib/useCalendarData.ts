import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { SchoolIdentity, TeacherIdentity, Holiday, ScheduleItem, CurriculumSubject } from '../types';
import { getDefaultHolidays, defaultCurriculum, defaultScheduleItems } from './defaultData';
import { getRecommendedSchedule } from './scheduleGenerator';

export function useSchoolCalendarData(startYear: number) {
  const [schoolDays, setSchoolDays] = useState<5 | 6>(6);
  const [identity, setIdentity] = useState<SchoolIdentity>({
    name: 'SMAN 1 Contoh',
    npsn: '20212345',
    address: 'Jl. Pendidikan No. 1',
    principalName: 'Dr. H. Guru Teladan, M.Pd.',
    principalNip: '19700101 199512 1 001',
    city: 'Kota Bandung'
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth.currentUser) {
      setHolidays(getDefaultHolidays(startYear));
      setIsLoading(false);
      return;
    }

    const docRef = doc(db, `users/${auth.currentUser.uid}/schoolSettings/${startYear}`);
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setSchoolDays(data.schoolDays);
        setIdentity(data.identity);
        setHolidays(data.holidays);
      } else {
        setHolidays(getDefaultHolidays(startYear));
      }
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching school data:", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [startYear, auth.currentUser]);

  const sanitizeData = (data: any) => {
    return JSON.parse(JSON.stringify(data));
  };

  const saveSchoolData = async () => {
    if (!auth.currentUser) {
      alert("Silakan masuk (login) terlebih dahulu untuk menyimpan pengaturan.");
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/schoolSettings/${startYear}`);
      await setDoc(docRef, sanitizeData({
        uid: auth.currentUser.uid,
        startYear,
        schoolDays,
        identity,
        holidays,
        updatedAt: new Date().toISOString()
      }));
      alert("Pengaturan kalender sekolah berhasil disimpan!");
    } catch (error) {
      console.error("Error saving school data:", error);
      alert(`Gagal menyimpan pengaturan: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const syncHolidaysToAllClasses = async () => {
    if (!auth.currentUser) {
      alert("Silakan masuk (login) terlebih dahulu.");
      return;
    }
    
    const confirmSync = window.confirm("Apakah Anda yakin ingin menyinkronkan pengaturan libur ke semua kalender kelas (Kelas 1 - 6)? Ini akan menyeimbangkan penandaan hari libur di kalender kelas.");
    if (!confirmSync) return;

    setIsSaving(true);
    try {
      // Ensure the school data is saved first
      const schoolRef = doc(db, `users/${auth.currentUser.uid}/schoolSettings/${startYear}`);
      await setDoc(schoolRef, sanitizeData({
        uid: auth.currentUser.uid,
        startYear,
        schoolDays,
        identity,
        holidays,
        updatedAt: new Date().toISOString()
      }));

      // Update all 6 classes
      for (let i = 1; i <= 6; i++) {
        const classRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${i}`);
        const classSnap = await getDoc(classRef);
        
        if (classSnap.exists()) {
          await setDoc(classRef, sanitizeData({
            ...classSnap.data(),
            holidays: holidays,
            schoolDays: schoolDays,
            updatedAt: new Date().toISOString()
          }), { merge: true });
        }
      }
      alert("Sinkronisasi hari libur dan konfigurasi hari kerja ke seluruh kalender guru kelas (1-6) berhasil!");
    } catch (error) {
      console.error("Error syncing holidays:", error);
      alert(`Gagal menyalin pengaturan ke kelas: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  const generateAllSchedules = async () => {
    if (!auth.currentUser) {
      alert("Silakan masuk (login) terlebih dahulu.");
      return;
    }

    setIsSaving(true);
    try {
      // Load school settings to use as a fallback base for empty class settings
      let baseSchoolDays = schoolDays;
      let baseHolidays = holidays;
      let baseIdentity = identity;

      for (let i = 1; i <= 6; i++) {
        const classRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${i}`);
        const classSnap = await getDoc(classRef);
        const rec = getRecommendedSchedule(i, baseSchoolDays, startYear);
        
        let writeData: any = {
          startYear,
          grade: i,
          uid: auth.currentUser.uid,
          schedule: rec,
          updatedAt: new Date().toISOString()
        };

        if (classSnap.exists()) {
          // If the document exists, we just overwrite the schedule via merge
          await setDoc(classRef, sanitizeData(writeData), { merge: true });
        } else {
          // If the document does not exist, we must provide ALL required fields to satisfy Firestore Rules
          writeData = {
            ...writeData,
            schoolDays: baseSchoolDays,
            identity: {
              name: 'Nama Guru, S.Pd.',
              nip: '19800101 200501 1 002',
              schoolName: baseIdentity.name || 'Sekolah Contoh',
              className: `Kelas ${i}`,
              principalName: baseIdentity.principalName || '',
              principalNip: baseIdentity.principalNip || '',
              city: baseIdentity.city || ''
            },
            holidays: baseHolidays,
            curriculum: defaultCurriculum,
          };
          await setDoc(classRef, sanitizeData(writeData));
        }
      }
      alert("Rekomendasi jadwal berhasil dihasilkan dan didistribusikan ke semua kelas 1 - 6!");
    } catch (error) {
      console.error("Error generating schedules:", error);
      alert(`Gagal mendistribusikan jadwal: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return { schoolDays, setSchoolDays, identity, setIdentity, holidays, setHolidays, saveSchoolData, syncHolidaysToAllClasses, generateAllSchedules, isSaving, isLoading };
}

export function useClassCalendarData(startYear: number, grade: number) {
  const [schoolDays, setSchoolDays] = useState<5 | 6>(6);
  const [identity, setIdentity] = useState<TeacherIdentity>({
    name: 'Nama Guru, S.Pd.',
    nip: '19800101 200501 1 002',
    schoolName: 'Sekolah Contoh',
    className: `Kelas ${grade}`,
    principalName: 'Dr. H. Guru Teladan, M.Pd.',
    principalNip: '19700101 199512 1 001',
    city: 'Kota Bandung'
  });
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [schedule, setSchedule] = useState<ScheduleItem[]>(defaultScheduleItems);
  const [curriculum, setCurriculum] = useState<CurriculumSubject[]>(defaultCurriculum);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      if (!auth.currentUser) {
        setHolidays(getDefaultHolidays(startYear));
        setIsLoading(false);
        return;
      }

      try {
        const classDocRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${grade}`);
        const classDocSnap = await getDoc(classDocRef);

        if (classDocSnap.exists()) {
          const data = classDocSnap.data();
          setSchoolDays(data.schoolDays);
          setIdentity(data.identity);
          setHolidays(data.holidays);
          setSchedule(data.schedule);
          setCurriculum(data.curriculum);
        } else {
          // If no class data, inherit from school data
          const schoolDocRef = doc(db, `users/${auth.currentUser.uid}/schoolSettings/${startYear}`);
          const schoolDocSnap = await getDoc(schoolDocRef);
          
          if (schoolDocSnap.exists()) {
            const schoolData = schoolDocSnap.data();
            setSchoolDays(schoolData.schoolDays);
            setHolidays(schoolData.holidays);
            setIdentity(prev => ({
              ...prev,
              schoolName: schoolData.identity.name,
              principalName: schoolData.identity.principalName,
              principalNip: schoolData.identity.principalNip,
              city: schoolData.identity.city
            }));
          } else {
            setHolidays(getDefaultHolidays(startYear));
          }
        }
      } catch (error) {
        console.error("Error loading class data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [startYear, grade, auth.currentUser]);

  const sanitizeData = (data: any) => {
    return JSON.parse(JSON.stringify(data));
  };

  const saveClassData = async () => {
    if (!auth.currentUser) {
      alert("Silakan masuk (login) terlebih dahulu untuk menyimpan pengaturan.");
      return;
    }
    setIsSaving(true);
    try {
      const docRef = doc(db, `users/${auth.currentUser.uid}/classSettings/${startYear}_${grade}`);
      await setDoc(docRef, sanitizeData({
        uid: auth.currentUser.uid,
        startYear,
        grade,
        schoolDays,
        identity,
        holidays,
        schedule,
        curriculum,
        updatedAt: new Date().toISOString()
      }));
      alert(`Pengaturan kalender kelas ${grade} berhasil disimpan!`);
    } catch (error) {
      console.error("Error saving class data:", error);
      alert(`Gagal menyimpan pengaturan: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsSaving(false);
    }
  };

  return { 
    schoolDays, setSchoolDays, 
    identity, setIdentity, 
    holidays, setHolidays, 
    schedule, setSchedule, 
    curriculum, setCurriculum, 
    saveClassData, isSaving, isLoading 
  };
}
