
import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Scan, Nfc } from "lucide-react";
import { useKeys, Employee } from "@/context/KeysContext";
import { toast } from "sonner";

const CardScanner = ({ onEmployeeIdentified }: { onEmployeeIdentified: (employee: Employee) => void }) => {
  const [isScanning, setIsScanning] = useState(false);
  const [manualCardId, setManualCardId] = useState("");
  const { getEmployeeByCardId } = useKeys();
  
  // Симуляція сканування карт
  const startScan = () => {
    setIsScanning(true);
    toast.info("Сканування розпочато. Піднесіть карту до зчитувача.");
    
    // Симуляція успішного сканування через 3 секунди
    setTimeout(() => {
      const mockCardIds = ["A12345", "B67890", "C54321"];
      const randomCardId = mockCardIds[Math.floor(Math.random() * mockCardIds.length)];
      handleCardScanned(randomCardId);
    }, 3000);
  };
  
  const stopScan = () => {
    setIsScanning(false);
    toast.info("Сканування зупинено.");
  };
  
  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleCardScanned(manualCardId);
    setManualCardId("");
  };
  
  const handleCardScanned = (cardId: string) => {
    setIsScanning(false);
    
    const employee = getEmployeeByCardId(cardId);
    if (employee) {
      toast.success(`Картка розпізнана: ${employee.name}`);
      onEmployeeIdentified(employee);
    } else {
      toast.error(`Картка з ID ${cardId} не знайдена в системі.`);
    }
  };
  
  // Перевірка доступності Web NFC API (лише для демонстрації, повноцінне сканування за наявності обладнання)
  const isNfcSupported = typeof window !== 'undefined' && 'NDEFReader' in window;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Nfc className="h-5 w-5" />
          Сканування перепустки
        </CardTitle>
        <CardDescription>
          Піднесіть карту працівника до зчитувача або введіть ID карти вручну
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={isScanning ? stopScan : startScan} 
          className={isScanning ? "bg-destructive hover:bg-destructive/90" : ""} 
          disabled={isScanning && !isNfcSupported}
        >
          <Scan className="mr-2 h-4 w-4" />
          {isScanning ? "Зупинити сканування" : "Почати сканування"}
        </Button>
        
        {isScanning && (
          <div className="flex items-center justify-center p-4">
            <div className="animate-pulse flex flex-col items-center">
              <Nfc className="h-12 w-12 text-primary mb-2" />
              <p>Очікування картки...</p>
            </div>
          </div>
        )}
        
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Або введіть ID карти вручну
            </span>
          </div>
        </div>
        
        <form onSubmit={handleManualSubmit} className="space-y-2">
          <Label htmlFor="cardId">ID картки</Label>
          <div className="flex gap-2">
            <Input
              id="cardId"
              value={manualCardId}
              onChange={(e) => setManualCardId(e.target.value)}
              placeholder="Наприклад, A12345"
            />
            <Button type="submit" disabled={!manualCardId}>Перевірити</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};

export default CardScanner;
