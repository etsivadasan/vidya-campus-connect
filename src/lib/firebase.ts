import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  onSnapshot, 
  getDocs, 
  getDoc,
  setDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  getDocFromServer,
  Firestore,
  onSnapshot as firestoreOnSnapshot
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { StaffMember, Department, ActivityLog } from '../types';
import { INITIAL_DEPARTMENTS, INITIAL_STAFF } from './directory-mock-data';

// Determine if we have a valid, active Firebase configuration (not the placeholder)
const hasRealFirebase = 
  firebaseConfig && 
  firebaseConfig.apiKey && 
  !firebaseConfig.apiKey.includes('please-run-firebase-setup') && 
  firebaseConfig.apiKey !== 'mock-api-key-please-run-firebase-setup';

let appInstance: any = null;
let authInstance: Auth | null = null;
let dbInstance: Firestore | null = null;
let isRealFirebaseActive = false;

if (hasRealFirebase) {
  try {
    appInstance = initializeApp(firebaseConfig);
    authInstance = getAuth(appInstance);
    // Explicitly configure with databaseId if provided
    dbInstance = getFirestore(appInstance, (firebaseConfig as any).firestoreDatabaseId || '(default)');
    isRealFirebaseActive = true;
    console.log('Firebase successfully initialized with active project:', firebaseConfig.projectId);
  } catch (error) {
    console.warn('Firebase initialization failed. Falling back to Live Simulator:', error);
    isRealFirebaseActive = false;
  }
} else {
  console.log('Firebase configuration not completed yet. Bootstrapping high-fidelity simulated database.');
}

export const auth = authInstance;
export const db = dbInstance;
export const isFirebaseActive = isRealFirebaseActive;

// Error structures as per standard firebase-integration guidelines
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
    },
    operationType,
    path
  };
  console.error('Firestore Action Failed: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// --------------------------------------------------------------------
// LOCAL SIMULATION STORAGE ENGINE (Fallback mode)
// --------------------------------------------------------------------
const LOCAL_STORAGE_STAFF_KEY = 'campus_directory_staff';
const LOCAL_STORAGE_DEPTS_KEY = 'campus_directory_departments';
const LOCAL_STORAGE_LOGS_KEY = 'campus_directory_logs';
const SIMULATED_SYNC_EVENT = 'campus_directory_sync';

function initLocalStorageData() {
  if (!localStorage.getItem(LOCAL_STORAGE_DEPTS_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_DEPTS_KEY, JSON.stringify(INITIAL_DEPARTMENTS));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_STAFF_KEY)) {
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(INITIAL_STAFF));
  }
  if (!localStorage.getItem(LOCAL_STORAGE_LOGS_KEY)) {
    const initialLogs: ActivityLog[] = [
      {
        id: 'log-1',
        staffId: 'staff-1',
        staffName: 'Dr. Alan McTuring',
        action: 'Updated office contact hours',
        timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString()
      },
      {
        id: 'log-2',
        staffId: 'staff-2',
        staffName: 'Sarah Lovelace',
        action: 'Modified office room information',
        timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString()
      }
    ];
    localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(initialLogs));
  }
}

// Ensure local storage is seeded
initLocalStorageData();

// Get simulated current user from LocalStorage to represent authenticated staff state
const SIMULATED_USER_KEY = 'campus_directory_sim_user';
export function getSimulatedUser(): { email: string; name: string; staffId?: string } | null {
  const data = localStorage.getItem(SIMULATED_USER_KEY);
  return data ? JSON.parse(data) : null;
}

export function setSimulatedUser(user: { email: string; name: string; staffId?: string } | null) {
  if (user) {
    localStorage.setItem(SIMULATED_USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SIMULATED_USER_KEY);
  }
  // Dispatch local storage change event or custom event for UI updates
  window.dispatchEvent(new Event('storage'));
<<<<<<< HEAD
  window.dispatchEvent(new Event('campus_directory_auth_change'));
=======
>>>>>>> a1c2b38fac6c803cb627620a10b473419f55613f
}

// --------------------------------------------------------------------
// CORE DB SERVICE ACTIONS (Supports Transparent Dual Mode)
// --------------------------------------------------------------------

// TEST Firestore Connection (as mandated by firebase-integration skill)
if (isRealFirebaseActive && db) {
  const testConnection = async () => {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
    } catch (error: any) {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error("Please check your Firebase configuration or network status.");
      }
    }
  };
  testConnection();
}

/**
 * Seed cloud database if it is empty and auth is active.
 * Excellent helper for first-time use of cloud databases!
 */
export async function seedCloudDatabase() {
  if (!isRealFirebaseActive || !db) return;
  try {
    const deptsSnap = await getDocs(collection(db, 'departments'));
    if (deptsSnap.empty) {
      console.log('Seeding cloud departments collection...');
      for (const dept of INITIAL_DEPARTMENTS) {
        await setDoc(doc(db, 'departments', dept.id), dept);
      }
    }
    const staffSnap = await getDocs(collection(db, 'staff'));
    if (staffSnap.empty) {
      console.log('Seeding cloud staff collection...');
      for (const s of INITIAL_STAFF) {
        await setDoc(doc(db, 'staff', s.id), {
          ...s,
          updatedAt: new Date().toISOString()
        });
      }
    }
  } catch (error) {
    console.error('Error seeding Cloud database:', error);
  }
}

/**
 * Subscribe to all departments.
 */
export function subscribeDepartments(onUpdate: (departments: Department[]) => void): () => void {
  if (isRealFirebaseActive && db) {
    const unsub = onSnapshot(collection(db, 'departments'), (snapshot) => {
      const depts: Department[] = [];
      snapshot.forEach((doc) => {
        depts.push(doc.data() as Department);
      });
      // Sort alphabetically
      depts.sort((a, b) => a.name.localeCompare(b.name));
      onUpdate(depts);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'departments');
    });
    return unsub;
  } else {
    // Local simulation subscription
    const syncData = () => {
      const dataStr = localStorage.getItem(LOCAL_STORAGE_DEPTS_KEY);
      const depts = dataStr ? JSON.parse(dataStr) : INITIAL_DEPARTMENTS;
      depts.sort((a: Department, b: Department) => a.name.localeCompare(b.name));
      onUpdate(depts);
    };

    // Trigger initial
    syncData();

    // Listen for storage events (allows instant real-time sync across separate tabs/iframes!)
    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_DEPTS_KEY || e.key === null) {
        syncData();
      }
    };
    // Also listen to custom events dispatched within the same tab
    const handleLocalSync = () => syncData();

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);
    };
  }
}

/**
 * Subscribe to all staff members (Real-time updates!).
 */
export function subscribeStaff(onUpdate: (staff: StaffMember[]) => void): () => void {
  if (isRealFirebaseActive && db) {
    const unsub = onSnapshot(collection(db, 'staff'), (snapshot) => {
      const list: StaffMember[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as StaffMember);
      });
      onUpdate(list);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, 'staff');
    });
    return unsub;
  } else {
    const syncData = () => {
      const dataStr = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
      const staffList = dataStr ? JSON.parse(dataStr) : INITIAL_STAFF;
      onUpdate(staffList);
    };

    // Initial load
    syncData();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_STAFF_KEY || e.key === null) {
        syncData();
      }
    };
    const handleLocalSync = () => syncData();

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);
    };
  }
}

/**
 * Subscribe to live activity updates
 */
export function subscribeActivityLogs(onUpdate: (logs: ActivityLog[]) => void): () => void {
  if (isRealFirebaseActive && db) {
    const logsQuery = query(collection(db, 'logs'), orderBy('timestamp', 'desc'));
    const unsub = onSnapshot(logsQuery, (snapshot) => {
      const list: ActivityLog[] = [];
      snapshot.forEach((doc) => {
        list.push(doc.data() as ActivityLog);
      });
      onUpdate(list.slice(0, 50)); // cap at 50 logs
    }, (error) => {
      // Create collection on the fly when snapshot starts if not exists, so handle gracefully
      console.warn('Real logs subscription failed, falling back to empty. Error details or missing index may apply.');
      onUpdate([]);
    });
    return unsub;
  } else {
    const syncData = () => {
      const dataStr = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      const logs = dataStr ? JSON.parse(dataStr) : [];
      // Sort newest first
      logs.sort((a: ActivityLog, b: ActivityLog) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      onUpdate(logs.slice(0, 30));
    };

    syncData();

    const handleStorageEvent = (e: StorageEvent) => {
      if (e.key === LOCAL_STORAGE_LOGS_KEY || e.key === null) {
        syncData();
      }
    };
    const handleLocalSync = () => syncData();

    window.addEventListener('storage', handleStorageEvent);
    window.addEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);

    return () => {
      window.removeEventListener('storage', handleStorageEvent);
      window.removeEventListener(SIMULATED_SYNC_EVENT, handleLocalSync);
    };
  }
}

/**
 * Write/Update a staff member.
 */
export async function updateStaffMember(staff: StaffMember, actionText?: string): Promise<void> {
  const roundedTimestamp = new Date().toISOString();
  
  // Try to determine of who modified it
  let activeModifierEmail = 'system@campus.edu';
  if (isRealFirebaseActive && auth?.currentUser?.email) {
    activeModifierEmail = auth.currentUser.email;
  } else {
    const simUser = getSimulatedUser();
    if (simUser?.email) {
      activeModifierEmail = simUser.email;
    }
  }

  const updatedStaff: StaffMember = {
    ...staff,
    updatedAt: roundedTimestamp,
    updatedBy: activeModifierEmail
  };

  // Safe Firestore Serialization: Remove any 'undefined' fields before setDoc
  Object.keys(updatedStaff).forEach((key) => {
    if ((updatedStaff as any)[key] === undefined) {
      delete (updatedStaff as any)[key];
    }
  });

  if (isRealFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'staff', staff.id), updatedStaff);
      
      // Optionally add a log document
      if (actionText) {
        const logId = 'log-' + Math.random().toString(36).substr(2, 9);
        const logPayload = {
          id: logId,
          staffId: staff.id,
          staffName: staff.name,
          action: actionText,
          timestamp: roundedTimestamp
        };
        // Remove any undefined properties from log payload just in case
        Object.keys(logPayload).forEach((key) => {
          if ((logPayload as any)[key] === undefined) {
            delete (logPayload as any)[key];
          }
        });
        await setDoc(doc(db, 'logs', logId), logPayload);
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `staff/${staff.id}`);
    }
  } else {
    // Simulation store write
    const currentStaffStr = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    const staffList: StaffMember[] = currentStaffStr ? JSON.parse(currentStaffStr) : [...INITIAL_STAFF];
    
    const index = staffList.findIndex(s => s.id === staff.id);
    if (index !== -1) {
      staffList[index] = updatedStaff;
    } else {
      staffList.push(updatedStaff);
    }
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staffList));

    // Log the event
    if (actionText) {
      const currentLogsStr = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
      const logs: ActivityLog[] = currentLogsStr ? JSON.parse(currentLogsStr) : [];
      const newLog: ActivityLog = {
        id: 'log-' + Date.now(),
        staffId: staff.id,
        staffName: staff.name,
        action: actionText,
        timestamp: roundedTimestamp
      };
      logs.unshift(newLog); // prepend
      localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));
    }

    // Trigger local and multi-frame react reload
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SIMULATED_SYNC_EVENT));
  }
}

/**
 * Triggers a simulated active campus update.
 */
export function triggerSimulatedStaffChange() {
  if (isRealFirebaseActive) return; // do not pollute cloud with mock bot

  const currentStaffStr = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
  const staffList: StaffMember[] = currentStaffStr ? JSON.parse(currentStaffStr) : [...INITIAL_STAFF];
  
  // Pick a random staff member
  const randomIndex = Math.floor(Math.random() * staffList.length);
  const staff = staffList[randomIndex];

  staff.updatedAt = new Date().toISOString();
  staff.updatedBy = 'Campus Live-Update Bot';

  localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(staffList));

  // Log activity
  const currentLogsStr = localStorage.getItem(LOCAL_STORAGE_LOGS_KEY);
  const logs: ActivityLog[] = currentLogsStr ? JSON.parse(currentLogsStr) : [];
  const newLog: ActivityLog = {
    id: 'log-bot-' + Date.now(),
    staffId: staff.id,
    staffName: staff.name,
    action: `Bot Update: Verified profile accuracy`,
    timestamp: staff.updatedAt
  };
  logs.unshift(newLog);
  localStorage.setItem(LOCAL_STORAGE_LOGS_KEY, JSON.stringify(logs.slice(0, 100)));

  // Sync
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent(SIMULATED_SYNC_EVENT));

  return `${staff.name} profile verified by bot`;
}

/**
 * Create a new Department.
 */
export async function addDepartment(dept: Department): Promise<void> {
  const sanitizedDept = { ...dept };
  Object.keys(sanitizedDept).forEach((key) => {
    if ((sanitizedDept as any)[key] === undefined) {
      delete (sanitizedDept as any)[key];
    }
  });

  if (isRealFirebaseActive && db) {
    try {
      await setDoc(doc(db, 'departments', dept.id), sanitizedDept);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `departments/${dept.id}`);
    }
  } else {
    const listStr = localStorage.getItem(LOCAL_STORAGE_DEPTS_KEY);
    const depts = listStr ? JSON.parse(listStr) : [...INITIAL_DEPARTMENTS];
    const index = depts.findIndex(d => d.id === dept.id);
    if (index !== -1) {
      depts[index] = dept;
    } else {
      depts.push(dept);
    }
    localStorage.setItem(LOCAL_STORAGE_DEPTS_KEY, JSON.stringify(depts));
    
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SIMULATED_SYNC_EVENT));
  }
}

/**
 * Delete a staff member.
 */
export async function deleteStaffMember(id: string): Promise<void> {
  if (isRealFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'staff', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `staff/${id}`);
    }
  } else {
    const currentStaffStr = localStorage.getItem(LOCAL_STORAGE_STAFF_KEY);
    const staffList: StaffMember[] = currentStaffStr ? JSON.parse(currentStaffStr) : [...INITIAL_STAFF];
    const updatedList = staffList.filter(s => s.id !== id);
    localStorage.setItem(LOCAL_STORAGE_STAFF_KEY, JSON.stringify(updatedList));

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SIMULATED_SYNC_EVENT));
  }
}

/**
 * Delete a department.
 */
export async function deleteDepartment(id: string): Promise<void> {
  if (isRealFirebaseActive && db) {
    try {
      await deleteDoc(doc(db, 'departments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `departments/${id}`);
    }
  } else {
    const listStr = localStorage.getItem(LOCAL_STORAGE_DEPTS_KEY);
    const depts = listStr ? JSON.parse(listStr) : [...INITIAL_DEPARTMENTS];
    const updatedList = depts.filter(d => d.id !== id);
    localStorage.setItem(LOCAL_STORAGE_DEPTS_KEY, JSON.stringify(updatedList));

    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent(SIMULATED_SYNC_EVENT));
  }
}

/**
 * Sign in with Google (using Popup, ideal for iframe environments)
 */
export async function signInWithGoogle(): Promise<{ email: string; name: string }> {
  if (isRealFirebaseActive && authInstance) {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(authInstance, provider);
    return {
      email: result.user.email || '',
      name: result.user.displayName || result.user.email || 'Admin Staff'
    };
  } else {
    // Simulated fallback
    const dummyUser = { email: 'admin@vidya.edu', name: 'VIDYA Admin Staff', staffId: 'staff-admin' };
    setSimulatedUser(dummyUser);
    return dummyUser;
  }
}

/**
 * Sign out of current session (handles real Firebase and local simulation)
 */
export async function signOutUser(): Promise<void> {
  if (isRealFirebaseActive && authInstance) {
    await signOut(authInstance);
  } else {
    setSimulatedUser(null);
  }
}
