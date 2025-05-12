
import { useState, useEffect } from "react";
import { Employee, useKeys } from "@/context/KeysContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Search, Plus, UserPlus, UserMinus, Pencil } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const EmployeeManager = () => {
  const { employees, addEmployee, updateEmployee, deleteEmployee } = useKeys();
  const { isLoggedIn, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    cardId: "",
    department: ""
  });

  // Перевіряємо, чи користувач авторизований та є адміністратором
  const isAuthorized = isLoggedIn && user?.isAdmin;

  // Фільтруємо співробітників за пошуковим запитом
  const filteredEmployees = employees.filter(emp => 
    emp.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.cardId.toLowerCase().includes(searchTerm.toLowerCase()) || 
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ініціалізуємо форму для редагування
  useEffect(() => {
    if (selectedEmployee) {
      setFormData({
        name: selectedEmployee.name,
        cardId: selectedEmployee.cardId,
        department: selectedEmployee.department
      });
    } else {
      resetForm();
    }
  }, [selectedEmployee]);

  const resetForm = () => {
    setFormData({
      name: "",
      cardId: "",
      department: ""
    });
  };

  const handleOpenAdd = () => {
    setSelectedEmployee(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (employee: Employee) => {
    setSelectedEmployee(employee);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валідація форми
    if (!formData.name.trim() || !formData.cardId.trim() || !formData.department.trim()) {
      toast.error("Будь ласка, заповніть усі поля");
      return;
    }

    // Перевірка на дублікат ID картки
    const duplicateCardId = employees.find(
      emp => emp.cardId === formData.cardId && emp.id !== (selectedEmployee?.id || "")
    );
    if (duplicateCardId) {
      toast.error("Співробітник з таким ID картки вже існує");
      return;
    }

    if (selectedEmployee) {
      // Оновлюємо існуючого співробітника
      updateEmployee({
        ...selectedEmployee,
        name: formData.name,
        cardId: formData.cardId,
        department: formData.department
      });
    } else {
      // Додаємо нового співробітника
      addEmployee({
        name: formData.name,
        cardId: formData.cardId,
        department: formData.department
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedEmployee) {
      deleteEmployee(selectedEmployee.id);
      setIsConfirmDeleteDialogOpen(false);
    }
  };

  // Якщо користувач неавторизований, повертаємо повідомлення про необхідність авторизації
  if (!isAuthorized) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        <h3 className="text-lg font-medium">Доступ обмежено</h3>
        <p className="mt-1">Для керування співробітниками необхідно увійти як адміністратор.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="search-employees" className="sr-only">Пошук співробітників</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-employees"
              placeholder="Пошук по імені, ID картки або відділу"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={handleOpenAdd}>
          <UserPlus className="mr-2 h-4 w-4" />
          Додати співробітника
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ім'я</TableHead>
              <TableHead>ID картки</TableHead>
              <TableHead>Відділ</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredEmployees.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Співробітники не знайдені
                </TableCell>
              </TableRow>
            ) : (
              filteredEmployees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.name}</TableCell>
                  <TableCell>{employee.cardId}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(employee)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" className="text-destructive" onClick={() => handleOpenDelete(employee)}>
                        <UserMinus className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Діалог додавання/редагування співробітника */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedEmployee ? "Редагувати співробітника" : "Додати нового співробітника"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ім'я співробітника</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cardId">ID картки</Label>
                <Input
                  id="cardId"
                  value={formData.cardId}
                  onChange={(e) => setFormData({ ...formData, cardId: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Відділ</Label>
                <Input
                  id="department"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit">
                {selectedEmployee ? "Оновити" : "Додати"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Діалог підтвердження видалення */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити співробітника</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Ви впевнені, що хочете видалити співробітника <strong>{selectedEmployee?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">Ця дія не може бути скасована. Всі записи про видачу ключів цьому співробітнику залишаться в історії.</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmDeleteDialogOpen(false)}>
              Скасувати
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Видалити
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EmployeeManager;
