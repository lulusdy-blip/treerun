import { initializeApp, getApps, getApp } from 'firebase/app';
import { getFirestore, doc, getDoc, setDoc, onSnapshot, type Unsubscribe } from 'firebase/firestore';
import type { StudentRecord } from './types';
import firebaseConfigRaw from '../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigRaw.apiKey,
  authDomain: firebaseConfigRaw.authDomain,
  projectId: firebaseConfigRaw.projectId,
  storageBucket: firebaseConfigRaw.storageBucket,
  messagingSenderId: firebaseConfigRaw.messagingSenderId,
  appId: firebaseConfigRaw.appId,
};

// Initialize Firebase App
export const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore with custom databaseId if present, otherwise default
export const db = firebaseConfigRaw.firestoreDatabaseId
  ? getFirestore(app, firebaseConfigRaw.firestoreDatabaseId)
  : getFirestore(app);

export const DEFAULT_INITIAL_RECORD: Omit<StudentRecord, 'studentCode' | 'nickname'> = {
  currentStage: 1,
  totalScore: 0,
  earthTemp: 15.2, // 기준 지구 평균기온 (°C)
  forestArea: 50.0, // 태초 마을 산림 면적 50
  warmingGauge: 100, // 지구 온난화 게이지 (100)
  seeds: 5, // 기본 씨앗 5개로 시작
  maxHearts: 2, // 기본 하트 2개
  gachaTickets: 1, // 첫 시작 축하 뽑기권 1개
  treesPlanted: 0,
  equippedWeaponId: 'fist',
  equippedSkinId: 'default',
  unlockedWeapons: ['fist'],
  unlockedSkins: ['default'],
  lastPlayedAt: new Date().toISOString(),
};

/**
 * Load student record by 관리코드
 */
export async function loadStudentRecord(studentCode: string): Promise<StudentRecord | null> {
  const cleanCode = studentCode.trim();
  if (!cleanCode) return null;

  try {
    const docRef = doc(db, 'student_records', cleanCode);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return snap.data() as StudentRecord;
    }
  } catch (err) {
    console.warn('Firestore load failed, checking localStorage fallback:', err);
  }

  // Fallback to localStorage if offline
  const local = localStorage.getItem(`namurun_${cleanCode}`);
  if (local) {
    try {
      return JSON.parse(local) as StudentRecord;
    } catch {
      // ignore
    }
  }

  return null;
}

/**
 * Save student record to Firestore with 관리코드 as document ID
 */
export async function saveStudentRecord(record: StudentRecord): Promise<void> {
  const cleanCode = record.studentCode.trim();
  if (!cleanCode) return;

  const dataToSave: StudentRecord = {
    ...record,
    lastPlayedAt: new Date().toISOString(),
  };

  // Always keep localStorage updated
  localStorage.setItem(`namurun_${cleanCode}`, JSON.stringify(dataToSave));

  try {
    const docRef = doc(db, 'student_records', cleanCode);
    await setDoc(docRef, dataToSave, { merge: true });
  } catch (err) {
    console.warn('Firestore save failed (will sync locally):', err);
  }
}

/**
 * Real-time listener for student record
 */
export function subscribeStudentRecord(
  studentCode: string,
  onUpdate: (record: StudentRecord) => void
): Unsubscribe {
  const cleanCode = studentCode.trim();
  const docRef = doc(db, 'student_records', cleanCode);

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data() as StudentRecord;
        localStorage.setItem(`namurun_${cleanCode}`, JSON.stringify(data));
        onUpdate(data);
      }
    },
    (error) => {
      console.warn('Real-time listener warning:', error);
    }
  );
}
