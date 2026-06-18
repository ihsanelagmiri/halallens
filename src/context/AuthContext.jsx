import React, { createContext, useState, useEffect } from 'react';
import { auth } from '../firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';

// Keys used in localStorage
const USER_KEY = 'halal_user';
const USERS_KEY = 'halal_users';

export const AuthContext = createContext({
  currentUser: null,
  isAuthenticated: false,
  login: () => {},
  register: () => {},
  logout: () => {},
  updateUser: () => {}
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Listen to Firebase Auth state on mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // map Firebase user to our currentUser format
        const userData = { email: user.email, name: user.displayName || user.email.split('@')[0], uid: user.uid };
        setCurrentUser(userData);
        persistUser(userData);
      } else {
        setCurrentUser(null);
        persistUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const persistUser = (user) => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_KEY);
    }
  };

  const getAllUsers = () => {
    const raw = localStorage.getItem(USERS_KEY);
    return raw ? JSON.parse(raw) : [];
  };

  const setAllUsers = (arr) => {
    localStorage.setItem(USERS_KEY, JSON.stringify(arr));
  };

  const login = (email, password) => {
    const users = getAllUsers();
    const match = users.find(u => u.email === email && u.password === password);
    if (match) {
      setCurrentUser({ email: match.email, name: match.name, createdAt: match.createdAt });
      persistUser({ email: match.email, name: match.name, createdAt: match.createdAt });
      return { success: true };
    }
    return { success: false, message: 'Invalid credentials' };
  };

  const register = (name, email, password) => {
    const users = getAllUsers();
    if (users.some(u => u.email === email)) {
      return { success: false, message: 'Email already registered' };
    }
    const createdAt = new Date().toISOString();
    const newUser = { name, email, password, createdAt };
    users.push(newUser);
    setAllUsers(users);
    // Auto-login after registration
    setCurrentUser({ name, email, createdAt });
    persistUser({ name, email, createdAt });
    return { success: true };
  };

  const changePassword = (currentPassword, newPassword) => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    // Retrieve all users
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex === -1) return { success: false, message: 'User not found' };
    const user = users[userIndex];
    if (user.password !== currentPassword) return { success: false, message: 'Current password incorrect' };
    // Update password
    users[userIndex].password = newPassword;
    setAllUsers(users);
    // Update current session (no password stored in session)
    // Persist user data without password (optional to keep password out of session)
    // Here we keep same user object
    return { success: true };
  };

  const updateUser = (newName) => {
    if (!currentUser) return;
    
    // Update all users list
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.email === currentUser.email);
    if (userIndex !== -1) {
      users[userIndex].name = newName;
      setAllUsers(users);
    }
    
    // Update current session
    const updatedUser = { ...currentUser, name: newName };
    setCurrentUser(updatedUser);
    persistUser(updatedUser);
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout error:", error);
    }
    setCurrentUser(null);
    persistUser(null);
  };

  const deleteAccount = () => {
    if (!currentUser) return { success: false, message: 'Not logged in' };
    const users = getAllUsers();
    const updatedUsers = users.filter(u => u.email !== currentUser.email);
    setAllUsers(updatedUsers);
    localStorage.removeItem(`halal_history_${currentUser.email}`);
    logout();
    return { success: true };
  };

  const value = {
    currentUser,
    isAuthenticated: !!currentUser,
    login,
    register,
    logout,
    updateUser,
    changePassword,
    deleteAccount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
