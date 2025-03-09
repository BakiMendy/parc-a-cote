import { Equipment } from '@/data/equipments';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EquipmentSelectorProps {
  equipment: Equipment;
  selected: boolean;
  onToggle: (id: string) => void;
}

export function EquipmentSelector({ 
  equipment, 
  selected, 
  onToggle 
}: EquipmentSelectorProps) {
  const Icon = equipment.icon;
  
  return (
    <Button
      type="button"
      variant="outline"
      className={cn(
        "h-auto py-4 px-3 flex flex-col items-center gap-2 hover:border-secondary transition-all",
        selected && "border-secondary bg-secondary/10"
      )}
      onClick={() => onToggle(equipment.id)}
    >
      <Icon className={cn(
        "h-6 w-6",
        selected ? "text-secondary" : "text-muted-foreground"
      )} />
      <span className="text-xs text-center">{equipment.label}</span>
    </Button>
  );
}