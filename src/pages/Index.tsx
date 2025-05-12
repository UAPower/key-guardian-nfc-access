
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Nfc, FileKey, Key, UserRound, LogIn, LogOut } from "lucide-react";
import LoginForm from "@/components/LoginForm";
import CardScanner from "@/components/CardScanner";
import KeysList from "@/components/KeysList";
import IssuedKeysList from "@/components/IssuedKeysList";
import KeysHistoryLog from "@/components/KeysHistoryLog";
import EmployeeManager from "@/components/EmployeeManager";
import KeyManager from "@/components/KeyManager";
import { Employee, Key as KeyType, useKeys } from "@/context/KeysContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";

const Index = () => {
  const [activeTab, setActiveTab] = useState("scan");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const { user, isLoggedIn, logout } = useAuth();
  const { takeKey, returnKey } = useKeys();
  
  // Обробники для операцій з ключами
  const handleKeyIssue = (key: KeyType) => {
    if (selectedEmployee) {
      takeKey(key.id, selectedEmployee.id);
    }
  };
  
  const handleKeyReturn = (keyId: string) => {
    if (selectedEmployee) {
      returnKey(keyId, selectedEmployee.id);
    }
  };
  
  const handleEmployeeIdentified = (employee: Employee) => {
    setSelectedEmployee(employee);
    toast.success(`Співробітника ідентифіковано: ${employee.name}`);
  };
  
  const handleClearSelection = () => {
    setSelectedEmployee(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Key className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">Система обліку ключів</h1>
          </div>
          
          <div className="flex items-center gap-4">
            {selectedEmployee && (
              <div className="flex items-center gap-2 bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-100">
                <UserRound className="h-4 w-4" />
                <span>{selectedEmployee.name}</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-5 w-5 rounded-full ml-1 text-blue-700 hover:text-blue-900"
                  onClick={handleClearSelection}
                >
                  <span className="sr-only">Очистити вибір</span>
                  ×
                </Button>
              </div>
            )}
            
            {isLoggedIn ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  {user?.username} {user?.isAdmin ? "(Адмін)" : ""}
                </span>
                <Button variant="outline" size="sm" onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Вийти
                </Button>
              </div>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setActiveTab("login")}>
                <LogIn className="mr-2 h-4 w-4" />
                Увійти
              </Button>
            )}
          </div>
        </div>
      </header>
      
      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex justify-between items-center mb-6">
            <TabsList>
              <TabsTrigger value="scan" className="flex items-center gap-2">
                <Nfc className="h-4 w-4" />
                Сканування
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileKey className="h-4 w-4" />
                Журнал
              </TabsTrigger>
              <TabsTrigger value="admin" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Налаштування
              </TabsTrigger>
              {!isLoggedIn && (
                <TabsTrigger value="login" className="flex items-center gap-2">
                  <LogIn className="h-4 w-4" />
                  Вхід
                </TabsTrigger>
              )}
            </TabsList>
          </div>
          
          <TabsContent value="scan" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-1">
                <CardScanner onEmployeeIdentified={handleEmployeeIdentified} />
              </div>
              
              <div className="md:col-span-2 space-y-6">
                <Card className="p-6">
                  <KeysList selectedEmployee={selectedEmployee} onKeySelect={handleKeyIssue} />
                </Card>
                
                <Card className="p-6">
                  <IssuedKeysList selectedEmployee={selectedEmployee} onKeyReturn={handleKeyReturn} />
                </Card>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="history" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Журнал видачі ключів</h2>
              <KeysHistoryLog />
            </Card>
          </TabsContent>
          
          <TabsContent value="admin" className="space-y-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Управління ключами</h2>
              <KeyManager />
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Управління співробітниками</h2>
              <EmployeeManager />
            </Card>
          </TabsContent>
          
          <TabsContent value="login" className="flex justify-center py-6">
            <LoginForm />
          </TabsContent>
        </Tabs>
      </main>
      
      <footer className="border-t mt-auto">
        <div className="container mx-auto px-4 py-6">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Система обліку ключів. Усі права захищено.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
