
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";

interface User {
  id: string;
  username: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Моковані користувачі - в реальному застосунку це прийде з бази даних
const MOCK_USERS = [
  { id: "1", username: "admin", password: "admin123", isAdmin: true },
  { id: "2", username: "user", password: "user123", isAdmin: false }
];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (username: string, password: string): boolean => {
    const foundUser = MOCK_USERS.find(
      (u) => u.username === username && u.password === password
    );

    if (foundUser) {
      const { password, ...userWithoutPassword } = foundUser;
      setUser(userWithoutPassword);
      toast.success("Успішний вхід");
      return true;
    } else {
      toast.error("Невірне ім'я користувача або пароль");
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    toast.success("Ви вийшли з системи");
  };

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
