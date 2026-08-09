"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
} from "react";

// Mock auth for the demo: there is no backend. Accounts and sessions are
// both stored in localStorage, in plaintext, with no hashing or server-side
// verification. This is only convincing enough for a live demo — never
// reuse this pattern for real user data.

export type User = {
  id: string;
  name: string;
  email: string;
};

type StoredUser = User & { password: string };

type AuthResult = { ok: true } | { ok: false; error: string };

const USERS_KEY = "khlasni_users";
const SESSION_KEY = "khlasni_session";

// The session is read through useSyncExternalStore so React stays in sync
// with localStorage (including same-tab writes from signUp/logIn/logOut)
// without the hydration flash a mount effect + setState would cause.
const sessionListeners = new Set<() => void>();

function notifySessionChange() {
  for (const listener of sessionListeners) listener();
}

function subscribeToSession(listener: () => void) {
  sessionListeners.add(listener);
  window.addEventListener("storage", listener);
  return () => {
    sessionListeners.delete(listener);
    window.removeEventListener("storage", listener);
  };
}

let cachedRaw: string | null = null;
let cachedSession: User | null = null;

function readSessionSnapshot(): User | null {
  const raw = localStorage.getItem(SESSION_KEY);
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedSession = raw ? (JSON.parse(raw) as User) : null;
    } catch {
      cachedSession = null;
    }
  }
  return cachedSession;
}

function readServerSessionSnapshot(): User | null {
  return null;
}

function writeSession(user: User | null) {
  if (user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(SESSION_KEY);
  }
  notifySessionChange();
}

function loadUsers(): StoredUser[] {
  try {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? (JSON.parse(raw) as StoredUser[]) : [];
  } catch {
    return [];
  }
}

function saveUsers(users: StoredUser[]) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function genUserId() {
  return `u_${Math.random().toString(36).slice(2, 10)}`;
}

function toSession(user: StoredUser): User {
  return { id: user.id, name: user.name, email: user.email };
}

type Auth = {
  user: User | null;
  signUp: (name: string, email: string, password: string) => AuthResult;
  logIn: (email: string, password: string) => AuthResult;
  logOut: () => void;
};

const AuthCtx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(
    subscribeToSession,
    readSessionSnapshot,
    readServerSessionSnapshot
  );

  const signUp: Auth["signUp"] = useCallback((name, email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || !password) {
      return { ok: false, error: "Fill in your name, email, and password." };
    }
    const users = loadUsers();
    if (users.some((u) => u.email === normalizedEmail)) {
      return { ok: false, error: "An account with that email already exists." };
    }
    const newUser: StoredUser = {
      id: genUserId(),
      name: name.trim(),
      email: normalizedEmail,
      password,
    };
    saveUsers([...users, newUser]);
    writeSession(toSession(newUser));
    return { ok: true };
  }, []);

  const logIn: Auth["logIn"] = useCallback((email, password) => {
    const normalizedEmail = email.trim().toLowerCase();
    const found = loadUsers().find(
      (u) => u.email === normalizedEmail && u.password === password
    );
    if (!found) {
      return { ok: false, error: "Incorrect email or password." };
    }
    writeSession(toSession(found));
    return { ok: true };
  }, []);

  const logOut = useCallback(() => {
    writeSession(null);
  }, []);

  const value = useMemo(
    () => ({ user, signUp, logIn, logOut }),
    [user, signUp, logIn, logOut]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
