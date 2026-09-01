import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut,
  onAuthStateChanged,
  type User,
} from 'firebase/auth';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import type { Workflow, AgentMemoryItem, ThemeSettings } from '../types';
import firebaseConfigJson from '../../firebase-applet-config.json';

const firebaseConfig = firebaseConfigJson || {
  projectId: 'project-61d56b90-b88d-414a-a18',
  appId: '1:1087394525209:web:78a1cdd57b0b3090a33a88',
  apiKey: 'AIzaSyDWTg_Eb4IRQN7wH4phSGOMBUrC74vkxoE',
  authDomain: 'project-61d56b90-b88d-414a-a18.firebaseapp.com',
  firestoreDatabaseId: 'ai-studio-d1f2c642-d3cd-4fbb-aebd-edb9b721c317',
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(
  app,
  firebaseConfig.firestoreDatabaseId || '(default)'
);
export const googleProvider = new GoogleAuthProvider();

// Sign in with Google
export async function loginWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (err) {
    console.warn('Google sign-in popup error, falling back to guest session:', err);
    const guest = await signInAnonymously(auth);
    return guest.user;
  }
}

// Sign in as Guest
export async function loginAsGuest(): Promise<User> {
  const result = await signInAnonymously(auth);
  return result.user;
}

// Sign out
export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

// Save Workflow to Firestore
export async function saveWorkflowToCloud(workflow: Workflow, userId?: string): Promise<void> {
  try {
    const ref = doc(db, 'workflows', workflow.id);
    await setDoc(
      ref,
      {
        ...workflow,
        userId: userId || 'anonymous',
        updatedAt: Date.now(),
        serverUpdatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (e) {
    console.error('Failed to save workflow to Firestore:', e);
    // Also save in localStorage as resilient backup
    localStorage.setItem(`antigravity_wf_${workflow.id}`, JSON.stringify(workflow));
  }
}

// Load Workflows for User
export async function loadUserWorkflows(userId?: string): Promise<Workflow[]> {
  try {
    const colRef = collection(db, 'workflows');
    const q = userId
      ? query(colRef, where('userId', '==', userId))
      : query(colRef, orderBy('updatedAt', 'desc'));
    
    const snapshot = await getDocs(q);
    const workflows: Workflow[] = [];
    snapshot.forEach((docSnap) => {
      workflows.push(docSnap.data() as Workflow);
    });
    return workflows;
  } catch (e) {
    console.warn('Could not fetch workflows from Firestore, using local cache:', e);
    const localKeys = Object.keys(localStorage).filter(k => k.startsWith('antigravity_wf_'));
    return localKeys.map(k => JSON.parse(localStorage.getItem(k) || '{}'));
  }
}

// Delete Workflow from Cloud
export async function deleteWorkflowFromCloud(workflowId: string): Promise<void> {
  try {
    await deleteDoc(doc(db, 'workflows', workflowId));
  } catch (e) {
    console.warn('Error deleting workflow from cloud:', e);
  }
  localStorage.removeItem(`antigravity_wf_${workflowId}`);
}

// Agent Memories Storage
export async function saveAgentMemoryToCloud(memory: AgentMemoryItem, userId?: string): Promise<void> {
  try {
    const ref = doc(db, 'memories', memory.id);
    await setDoc(ref, { ...memory, userId: userId || 'anonymous' }, { merge: true });
  } catch (e) {
    console.warn('Memory cloud sync warning:', e);
  }
}

export async function loadAgentMemories(userId?: string): Promise<AgentMemoryItem[]> {
  try {
    const colRef = collection(db, 'memories');
    const q = userId ? query(colRef, where('userId', '==', userId)) : colRef;
    const snap = await getDocs(q as any);
    const items: AgentMemoryItem[] = [];
    snap.forEach((d) => items.push(d.data() as AgentMemoryItem));
    return items;
  } catch (e) {
    return [];
  }
}

// User Settings Storage
export async function saveUserSettingsToCloud(userId: string, settings: ThemeSettings): Promise<void> {
  try {
    const ref = doc(db, 'users', userId);
    await setDoc(ref, { settings, updatedAt: Date.now() }, { merge: true });
  } catch (e) {
    localStorage.setItem('antigravity_settings', JSON.stringify(settings));
  }
}

export async function loadUserSettings(userId: string): Promise<ThemeSettings | null> {
  try {
    const ref = doc(db, 'users', userId);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data()?.settings) {
      return snap.data().settings as ThemeSettings;
    }
  } catch (e) {
    const local = localStorage.getItem('antigravity_settings');
    if (local) return JSON.parse(local);
  }
  return null;
}
