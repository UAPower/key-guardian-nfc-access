
import { useState } from "react";
import { Key, Employee, useKeys } from "@/context/KeysContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeySquare, Search } from "lucide-react";

interface KeysListProps {
  selectedEmployee: Employee | null;
  onKeySelect: (key: Key) => void;
}

const KeysList = ({ selectedEmployee, onKeySelect }: KeysListProps) => {
  const { keys } = useKeys();
  const [searchTerm, setSearchTerm] = useState("");

  const filteredKeys = keys.filter(key => 
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    key.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <KeySquare className="h-5 w-5" />
        <h2 className="text-xl font-semibold">Доступні ключі</h2>
      </div>

      <div className="flex items-end gap-2">
        <div className="flex-1">
          <Label htmlFor="search-keys" className="sr-only">Пошук ключів</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-keys"
              placeholder="Пошук по назві або опису"
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
              <TableHead>Назва</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дія</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Ключі не знайдено
                </TableCell>
              </TableRow>
            ) : (
              filteredKeys.map((key) => (
                <TableRow key={key.id}>
                  <TableCell className="font-medium">{key.name}</TableCell>
                  <TableCell>{key.description}</TableCell>
                  <TableCell>
                    {key.isAvailable ? (
                      <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                        Доступний
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">
                        Виданий
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      size="sm" 
                      variant="outline"
                      disabled={!key.isAvailable || !selectedEmployee}
                      onClick={() => onKeySelect(key)}
                    >
                      Видати
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default KeysList;
