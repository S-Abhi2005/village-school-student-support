import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types';
import { DEMO_USERS } from '../mock/schoolData';

interface AuthContextType {
  user: User | null;
  role: UserRole;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string, selectedRole?: UserRole) => Promise<boolean>;
  logout: () => void;
  switchRole: (newRole: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [role, setRole] = useState<UserRole>(() => {
    const savedRole = localStorage.getItem('village_school_current_role') as UserRole;
    return savedRole || 'SUPER_ADMIN';
  });

  const [user, setUser] = useState<User | null>(() => {
    const savedRole = localStorage.getItem('village_school_current_role') as UserRole || 'SUPER_ADMIN';
    return DEMO_USERS[savedRole] || DEMO_USERS.SUPER_ADMIN;
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('village_school_token') || 'demo-jwt-village-token-2026';
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('village_school_auth') !== 'false';
  });

  // Switch role helper for evaluation and demo
  const switchRole = (newRole: UserRole) => {
    setRole(newRole);
    const targetUser = DEMO_USERS[newRole];
    if (targetUser) {
      setUser(targetUser);
      setIsAuthenticated(true);
      setToken(`demo-jwt-${newRole.toLowerCase()}-token`);
      localStorage.setItem('village_school_current_role', newRole);
      localStorage.setItem('village_school_auth', 'true');
    }
  };

  const login = async (username: string, password: string, selectedRole?: UserRole): Promise<boolean> => {
    // Basic validation
    if (!username.trim() || !password.trim()) {
      return false;
    }

    // Role detection based on input or selected role
    let matchedRole: UserRole = selectedRole || 'SUPER_ADMIN';
    const lowerUser = username.toLowerCase();

    if (lowerUser.includes('teacher') || lowerUser.includes('savitri') || lowerUser.includes('9845098765')) {
      matchedRole = 'TEACHER';
    } else if (lowerUser.includes('parent') || lowerUser.includes('ramesh') || lowerUser.includes('9900112233')) {
      matchedRole = 'PARENT';
    } else if (lowerUser.includes('student') || lowerUser.includes('kavya') || lowerUser.includes('9900112234')) {
      matchedRole = 'STUDENT';
    } else if (lowerUser.includes('admin') || lowerUser.includes('headmaster') || lowerUser.includes('9845012345')) {
      matchedRole = 'SUPER_ADMIN';
    }

    // Successful login simulation
    switchRole(matchedRole);
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setToken(null);
    localStorage.removeItem('village_school_token');
    localStorage.setItem('village_school_auth', 'false');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        token,
        isAuthenticated,
        login,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
