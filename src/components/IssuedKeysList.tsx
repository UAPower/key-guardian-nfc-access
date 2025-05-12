
import { useState, useMemo } from "react";
import { KeyLog, Employee, useKeys } from "@/context/KeysContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileKey, Search } from "lucide-react";

interface IssuedKeysListProps {
  selectedEmployee: Employee | null;
  onKeyReturn: (keyId: string) => void;
}

const IssuedKeysList = ({ selectedEmployee, onKeyReturn }: IssuedKeysListProps) => {
  const { keyLogs, keys, getKeyById } = useKeys();
  const [searchTerm, setSearchTerm] = useState("");

  // Знаходимо ключі, які все ще видані (не повернуті)
  const issuedKeys = useMemo(() => {
    // Створюємо копію логів та сортуємо їх за часом (від найновіших до найстаріших)
    const sortedLogs = [...keyLogs].sort((a, b) => b.timestamp - a.timestamp);
    
    // Об'єкт для зберігання останньої дії для кожного ключа
    const lastActionByKey: Record<string, KeyLog> = {};
    
    // Знаходимо останню дію для кожного ключа
    sortedLogs.forEach(log => {
      if (!lastActionByKey[log.keyId]) {
        lastActionByKey[log.keyId] = log;
      }
    });
    
    // Фільтруємо за ключами, які наразі видані
    return Object.values(lastActionByKey).filter(log => {
      // Перевіряємо, чи цей ключ видано вибраному працівнику
      if (selectedEmployee && log.employeeId !== selectedEmployee.id) {
        return false;
      }
      
      return log.action === "taken";
    });
  }, [keyLogs, selectedEmployee]);

  // Фільтруємо видані ключі за пошуковим запитом
  const filteredIssuedKeys = useMemo(() => {
    if (!searchTerm) return issuedKeys;
    
    return issuedKeys.filter(log => {
      const key = getKeyById(log.keyId);
      if (!key) return false;
      
      return key.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             key.description.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [issuedKeys, searchTerm, getKeyById]);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <FileKey className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Видані ключі</h2>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="search-issued-keys" className="sr-only">Пошук виданих ключів</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-issued-keys"
              placeholder="Пошук по назві або опису ключа"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ключ</TableHead>
              <TableHead>Видано</TableHead>
              <TableHead className="text-right">Дія</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredIssuedKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="h-24 text-center">
                  {selectedEmployee 
                    ? `У співробітника ${selectedEmployee.name} немає виданих ключів`
                    : "Немає виданих ключів для відображення"}
                </TableCell>
              </TableRow>
            ) : (
              filteredIssuedKeys.map((log) => {
                const key = getKeyById(log.keyId);
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      <div className="font-medium">{key?.name}</div>
                      <div className="text-sm text-muted-foreground">{key?.description}</div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(log.timestamp), "PPP 'о' HH:mm", { locale: uk })}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onKeyReturn(log.keyId)}
                      >
                        Повернути
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default IssuedKeysList;
