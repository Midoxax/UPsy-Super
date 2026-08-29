import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

const DashboardErrorFallback = () => (
  <div className="min-h-[60vh] flex items-center justify-center p-6">
    <div className="max-w-md w-full glass-card p-8 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-14 h-14 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-7 h-7 text-destructive" />
        </div>
      </div>
      <h2 className="text-h2 text-foreground mb-3">Dashboard unavailable</h2>
      <p className="text-body text-muted-foreground mb-6">
        Something went wrong loading your space. Please try again.
      </p>
      <Button onClick={() => window.location.reload()}>Reload</Button>
    </div>
  </div>
);

export default DashboardErrorFallback;
