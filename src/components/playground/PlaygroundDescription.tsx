interface PlaygroundDescriptionProps {
  description: string;
}

export function PlaygroundDescription({ description }: PlaygroundDescriptionProps) {
  return (
    <div>
      <h3 className="font-semibold mb-2">Description</h3>
      <p className="text-muted-foreground">{description}</p>
    </div>
  );
}