
import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

export interface Key {
  id: string;
  name: string;
  description: string;
  isAvailable: boolean;
}

export interface KeyLog {
  id: string;
  keyId: string;
  employeeId: string;
  action: "taken" | "returned";
  timestamp: number;
}

export interface Employee {
  id: string;
  name: string;
  cardId: string;
  department: string;
}

interface KeysContextType {
  keys: Key[];
  keyLogs: KeyLog[];
  employees: Employee[];
  addKey: (key: Omit<Key, "id">) => void;
  updateKey: (key: Key) => void;
  deleteKey: (keyId: string) => void;
  addEmployee: (employee: Omit<Employee, "id">) => void;
  updateEmployee: (employee: Employee) => void;
  deleteEmployee: (employeeId: string) => void;
  takeKey: (keyId: string, employeeId: string) => void;
  returnKey: (keyId: string, employeeId: string) => void;
  getKeyById: (keyId: string) => Key | undefined;
  getEmployeeById: (employeeId: string) => Employee | undefined;
  getEmployeeByCardId: (cardId: string) => Employee | undefined;
}

// Моковані дані
const MOCK_KEYS: Key[] = [
  { id: "1", name: "Офіс 101", description: "Ключ від кімнати 101", isAvailable: true },
  { id: "2", name: "Склад", description: "Ключ від складського приміщення", isAvailable: false },
  { id: "3", name: "Серверна", description: "Ключ від серверної кімнати", isAvailable: true }
];

const MOCK_EMPLOYEES: Employee[] = [
  { id: "1", name: "Петро Іваненко", cardId: "A12345", department: "IT" },
  { id: "2", name: "Марія Петренко", cardId: "B67890", department: "Бухгалтерія" },
  { id: "3", name: "Олександр Сидоренко", cardId: "C54321", department: "Охорона" }
];

const MOCK_KEY_LOGS: KeyLog[] = [
  { id: "1", keyId: "2", employeeId: "1", action: "taken", timestamp: Date.now() - 86400000 },
];

const KeysContext = createContext<KeysContextType | undefined>(undefined);

export const KeysProvider = ({ children }: { children: ReactNode }) => {
  const [keys, setKeys] = useState<Key[]>(MOCK_KEYS);
  const [keyLogs, setKeyLogs] = useState<KeyLog[]>(MOCK_KEY_LOGS);
  const [employees, setEmployees] = useState<Employee[]>(MOCK_EMPLOYEES);

  const addKey = (key: Omit<Key, "id">) => {
    const newKey = { ...key, id: uuidv4() };
    setKeys([...keys, newKey]);
    toast.success(`Ключ "${key.name}" додано успішно`);
  };

  const updateKey = (updatedKey: Key) => {
    setKeys(keys.map(key => key.id === updatedKey.id ? updatedKey : key));
    toast.success(`Ключ "${updatedKey.name}" оновлено успішно`);
  };

  const deleteKey = (keyId: string) => {
    const keyToDelete = keys.find(k => k.id === keyId);
    if (keyToDelete) {
      setKeys(keys.filter(key => key.id !== keyId));
      toast.success(`Ключ "${keyToDelete.name}" видалено успішно`);
    }
  };

  const addEmployee = (employee: Omit<Employee, "id">) => {
    const newEmployee = { ...employee, id: uuidv4() };
    setEmployees([...employees, newEmployee]);
    toast.success(`Співробітника "${employee.name}" додано успішно`);
  };

  const updateEmployee = (updatedEmployee: Employee) => {
    setEmployees(employees.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp));
    toast.success(`Дані співробітника "${updatedEmployee.name}" оновлено успішно`);
  };

  const deleteEmployee = (employeeId: string) => {
    const employeeToDelete = employees.find(e => e.id === employeeId);
    if (employeeToDelete) {
      setEmployees(employees.filter(emp => emp.id !== employeeId));
      toast.success(`Співробітника "${employeeToDelete.name}" видалено успішно`);
    }
  };

  const takeKey = (keyId: string, employeeId: string) => {
    const key = keys.find(k => k.id === keyId);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!key || !employee) {
      toast.error("Ключ або співробітник не знайдені");
      return;
    }
    
    if (!key.isAvailable) {
      toast.error("Ключ недоступний для видачі");
      return;
    }
    
    // Оновлюємо статус ключа
    updateKey({ ...key, isAvailable: false });
    
    // Додаємо запис до журналу
    const newLog: KeyLog = {
      id: uuidv4(),
      keyId,
      employeeId,
      action: "taken",
      timestamp: Date.now()
    };
    
    setKeyLogs([...keyLogs, newLog]);
    toast.success(`Ключ "${key.name}" видано ${employee.name}`);
  };

  const returnKey = (keyId: string, employeeId: string) => {
    const key = keys.find(k => k.id === keyId);
    const employee = employees.find(e => e.id === employeeId);
    
    if (!key || !employee) {
      toast.error("Ключ або співробітник не знайдені");
      return;
    }
    
    if (key.isAvailable) {
      toast.error("Цей ключ вже повернуто");
      return;
    }
    
    // Перевіряємо, чи саме цей співробітник брав ключ
    const lastLog = [...keyLogs]
      .filter(log => log.keyId === keyId)
      .sort((a, b) => b.timestamp - a.timestamp)[0];
      
    if (lastLog && lastLog.employeeId !== employeeId) {
      toast.error(`Цей ключ був виданий іншому співробітнику`);
      return;
    }
    
    // Оновлюємо статус ключа
    updateKey({ ...key, isAvailable: true });
    
    // Додаємо запис до журналу
    const newLog: KeyLog = {
      id: uuidv4(),
      keyId,
      employeeId,
      action: "returned",
      timestamp: Date.now()
    };
    
    setKeyLogs([...keyLogs, newLog]);
    toast.success(`Ключ "${key.name}" повернуто від ${employee.name}`);
  };

  const getKeyById = (keyId: string) => {
    return keys.find(key => key.id === keyId);
  };

  const getEmployeeById = (employeeId: string) => {
    return employees.find(emp => emp.id === employeeId);
  };

  const getEmployeeByCardId = (cardId: string) => {
    return employees.find(emp => emp.cardId === cardId);
  };

  return (
    <KeysContext.Provider 
      value={{ 
        keys, 
        keyLogs, 
        employees, 
        addKey, 
        updateKey, 
        deleteKey, 
        addEmployee, 
        updateEmployee, 
        deleteEmployee, 
        takeKey, 
        returnKey,
        getKeyById,
        getEmployeeById,
        getEmployeeByCardId
      }}
    >
      {children}
    </KeysContext.Provider>
  );
};

export const useKeys = () => {
  const context = useContext(KeysContext);
  if (context === undefined) {
    throw new Error('useKeys must be used within a KeysProvider');
  }
  return context;
};
