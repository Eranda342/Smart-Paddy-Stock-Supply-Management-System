import { Wrench } from "lucide-react";

export default function MaintenancePage() {
  return (
    <div className="min-h-screen bg-card text-foreground flex flex-col items-center justify-center p-6 text-center">
      <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-8 animate-pulse">
        <Wrench className="w-12 h-12 text-primary" />
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold mb-4 tracking-tight">System Under Maintenance</h1>
      <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed">
        AgroBridge is currently undergoing scheduled upgrades to improve your experience. Services are temporarily paused to protect active market data.
      </p>
      
      <div className="px-8 py-4 bg-muted border border-border rounded-xl">
        <p className="text-sm font-semibold mb-1">Please try again shortly</p>
        <p className="text-xs text-muted-foreground">Admin routing remains operational.</p>
      </div>
    </div>
  );
}
