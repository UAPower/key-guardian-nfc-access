
import { useMemo, useState } from "react";
import { KeyLog, useKeys } from "@/context/KeysContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { uk } from "date-fns/locale";
import { Search } from "lucide-react";

const KeysHistoryLog = () => {
  const { keyLogs, getKeyById, getEmployeeById } = useKeys();
  const [searchTerm, setSearchTerm] = useState("");

  // Сортуємо логи за часом (від найновіших до найстаріших)
  const sortedLogs = useMemo(() => {
    return [...keyLogs].sort((a, b) => b.timestamp - a.timestamp);
  }, [keyLogs]);

  // Фільтруємо логи за пошуковим запитом
  const filteredLogs = useMemo(() => {
    if (!searchTerm) return sortedLogs;
    
    return sortedLogs.filter(log => {
      const key = getKeyById(log.keyId);
      const employee = getEmployeeById(log.employeeId);
      
      if (!key || !employee) return false;
      
      return key.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             employee.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             employee.cardId.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [sortedLogs, searchTerm, getKeyById, getEmployeeById]);

  return (
    <div className="space-y-4">
      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="search-logs" className="sr-only">Пошук по журналу</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-logs"
              placeholder="Пошук по назві ключа, імені співробітника або ID картки"
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
              <TableHead>Дата та час</TableHead>
              <TableHead>Ключ</TableHead>
              <TableHead>Співробітник</TableHead>
              <TableHead>Дія</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredLogs.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Записи не знайдено
                </TableCell>
              </TableRow>
            ) : (
              filteredLogs.map((log) => {
                const key = getKeyById(log.keyId);
                const employee = getEmployeeById(log.employeeId);
                
                return (
                  <TableRow key={log.id}>
                    <TableCell>
                      {format(new Date(log.timestamp), "PPP 'о' HH:mm", { locale: uk })}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{key?.name}</div>
                      <div className="text-sm text-muted-foreground">{key?.description}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{employee?.name}</div>
                      <div className="text-sm text-muted-foreground">
                        ID картки: {employee?.cardId}, Відділ: {employee?.department}
                      </div>
                    </TableCell>
                    <TableCell>
                      {log.action === "taken" ? (
                        <Badge variant="outline" className="bg-info/10 text-info border-info/20">
                          Видано
                        </Badge>
                      ) : (
                        <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                          Повернуто
                        </Badge>
                      )}
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

export default KeysHistoryLog;
