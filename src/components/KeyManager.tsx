
import { useState, useEffect } from "react";
import { Key, useKeys } from "@/context/KeysContext";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Search, Plus, Pencil, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

const KeyManager = () => {
  const { keys, addKey, updateKey, deleteKey } = useKeys();
  const { isLoggedIn, user } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isConfirmDeleteDialogOpen, setIsConfirmDeleteDialogOpen] = useState(false);
  const [selectedKey, setSelectedKey] = useState<Key | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    isAvailable: true
  });

  // Перевіряємо, чи користувач авторизований та є адміністратором
  const isAuthorized = isLoggedIn && user?.isAdmin;

  // Фільтруємо ключі за пошуковим запитом
  const filteredKeys = keys.filter(key => 
    key.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    key.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ініціалізуємо форму для редагування
  useEffect(() => {
    if (selectedKey) {
      setFormData({
        name: selectedKey.name,
        description: selectedKey.description,
        isAvailable: selectedKey.isAvailable
      });
    } else {
      resetForm();
    }
  }, [selectedKey]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      isAvailable: true
    });
  };

  const handleOpenAdd = () => {
    setSelectedKey(null);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (key: Key) => {
    setSelectedKey(key);
    setIsDialogOpen(true);
  };

  const handleOpenDelete = (key: Key) => {
    setSelectedKey(key);
    setIsConfirmDeleteDialogOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Валідація форми
    if (!formData.name.trim() || !formData.description.trim()) {
      toast.error("Будь ласка, заповніть усі поля");
      return;
    }

    if (selectedKey) {
      // Оновлюємо існуючий ключ
      updateKey({
        ...selectedKey,
        name: formData.name,
        description: formData.description,
        isAvailable: formData.isAvailable
      });
    } else {
      // Додаємо новий ключ
      addKey({
        name: formData.name,
        description: formData.description,
        isAvailable: true
      });
    }

    setIsDialogOpen(false);
    resetForm();
  };

  const handleDelete = () => {
    if (selectedKey) {
      deleteKey(selectedKey.id);
      setIsConfirmDeleteDialogOpen(false);
    }
  };

  // Якщо користувач неавторизований, повертаємо повідомлення про необхідність авторизації
  if (!isAuthorized) {
    return (
      <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-800">
        <h3 className="text-lg font-medium">Доступ обмежено</h3>
        <p className="mt-1">Для керування ключами необхідно увійти як адміністратор.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Label htmlFor="search-keys" className="sr-only">Пошук ключів</Label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search-keys"
              placeholder="Пошук по назві або опису"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 w-[300px]"
            />
          </div>
        </div>
        <Button onClick={handleOpenAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Додати ключ
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Назва</TableHead>
              <TableHead>Опис</TableHead>
              <TableHead>Статус</TableHead>
              <TableHead className="text-right">Дії</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredKeys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  Ключі не знайдені
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
                    <div className="flex justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => handleOpenEdit(key)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="text-destructive"
                        onClick={() => handleOpenDelete(key)}
                        disabled={!key.isAvailable}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Діалог додавання/редагування ключа */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedKey ? "Редагувати ключ" : "Додати новий ключ"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Назва</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Опис</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                Скасувати
              </Button>
              <Button type="submit">
                {selectedKey ? "Оновити" : "Додати"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Діалог підтвердження видалення */}
      <Dialog open={isConfirmDeleteDialogOpen} onOpenChange={setIsConfirmDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Видалити ключ</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Ви впевнені, що хочете видалити ключ <strong>{selectedKey?.name}</strong>?</p>
            <p className="text-sm text-muted-foreground mt-2">Ця дія не може бути скасована. Всі записи про видачу цього ключа залишаться в історії.</p>
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

export default KeyManager;
