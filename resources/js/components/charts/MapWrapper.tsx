import { useEffect, useState } from 'react';

interface MapWrapperProps {
  children: React.ReactNode;
}

export default function MapWrapper({ children }: MapWrapperProps) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="flex h-96 items-center justify-center rounded-lg border bg-card">
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    );
  }

  return <>{children}</>;
}
