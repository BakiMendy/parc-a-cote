import { equipments } from '@/data/equipments';
import { EquipmentSelector } from './EquipmentSelector';

interface EquipmentSectionProps {
  selectedEquipments: string[];
  onEquipmentToggle: (id: string) => void;
}

export function EquipmentSection({
  selectedEquipments,
  onEquipmentToggle
}: EquipmentSectionProps) {
  const categories = {
    play: 'Jeux',
    comfort: 'Confort',
    safety: 'Sécurité',
    accessibility: 'Accessibilité'
  };

  return (
    <div className="space-y-6">
      {(Object.entries(categories) as [keyof typeof categories, string][]).map(([category, label]) => (
        <div key={category}>
          <h3 className="font-medium mb-3">{label}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {equipments
              .filter(eq => eq.category === category)
              .map(equipment => (
                <EquipmentSelector
                  key={equipment.id}
                  equipment={equipment}
                  selected={selectedEquipments.includes(equipment.id)}
                  onToggle={onEquipmentToggle}
                />
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}