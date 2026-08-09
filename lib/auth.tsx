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
  // Base64 data URL, stored directly in localStorage alongside everything
  // else in this mock auth layer. Real apps upload images to object storage
  // and store a URL instead — this only works because avatars stay small
  // and this never has to survive outside one browser's localStorage.
  avatar?: string;
};

type ProfileUpdate = {
  name?: string;
  email?: string;
  avatar?: string;
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
  return { id: user.id, name: user.name, email: user.email, avatar: user.avatar };
}

type Auth = {
  user: User | null;
  signUp: (name: string, email: string, password: string) => AuthResult;
  logIn: (email: string, password: string) => AuthResult;
  logOut: () => void;
  updateProfile: (updates: ProfileUpdate) => AuthResult;
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

  const updateProfile: Auth["updateProfile"] = useCallback(
    (updates) => {
      if (!user) {
        return { ok: false, error: "You must be logged in." };
      }
      const users = loadUsers();
      const index = users.findIndex((u) => u.id === user.id);
      if (index === -1) {
        return { ok: false, error: "Your account could not be found." };
      }

      const current = users[index];
      const nextName = updates.name !== undefined ? updates.name.trim() : current.name;
      const nextEmail =
        updates.email !== undefined ? updates.email.trim().toLowerCase() : current.email;
      const nextAvatar = updates.avatar !== undefined ? updates.avatar : current.avatar;

      if (!nextName || !nextEmail) {
        return { ok: false, error: "Name and email can't be empty." };
      }
      if (users.some((u, i) => i !== index && u.email === nextEmail)) {
        return { ok: false, error: "An account with that email already exists." };
      }

      const updatedUser: StoredUser = {
        ...current,
        name: nextName,
        email: nextEmail,
        avatar: nextAvatar,
      };
      const nextUsers = [...users];
      nextUsers[index] = updatedUser;
      saveUsers(nextUsers);
      writeSession(toSession(updatedUser));
      return { ok: true };
    },
    [user]
  );

  const value = useMemo(
    () => ({ user, signUp, logIn, logOut, updateProfile }),
    [user, signUp, logIn, logOut, updateProfile]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthCtx);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
