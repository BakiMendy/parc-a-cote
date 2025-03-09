import { Badge } from '@/components/ui/badge';

interface PlaygroundFeaturesProps {
  features: string[];
}

export function PlaygroundFeatures({ features }: PlaygroundFeaturesProps) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold">Caractéristiques</h3>
      <div className="flex flex-wrap gap-2">
        {features && features.length > 0 ? (
          features.map((feature, index) => (
            <Badge key={index} variant="secondary">
              {feature}
            </Badge>
          ))
        ) : (
          <p className="text-sm text-muted-foreground">Aucune caractéristique spécifiée</p>
        )}
      </div>
    </div>
  );
}