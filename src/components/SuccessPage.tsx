import { CheckCircle, Download, Package, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SuccessPageProps {
  wantsPrint: boolean;
  onStartOver: () => void;
}

export const SuccessPage = ({ wantsPrint, onStartOver }: SuccessPageProps) => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center animate-slide-up">
          {/* Success icon */}
          <div className="w-24 h-24 rounded-full bg-gradient-accent mx-auto mb-8 flex items-center justify-center shadow-accent animate-pulse-soft">
            <CheckCircle className="w-12 h-12 text-accent-foreground" />
          </div>

          <h1 className="font-display text-3xl font-bold text-foreground mb-4">
            All Done!
          </h1>

          <p className="text-muted-foreground mb-8 leading-relaxed">
            {wantsPrint
              ? "Your order has been confirmed. You'll receive a confirmation email shortly with tracking information."
              : "Your professional ID photo is ready for download. Check your email for the high-resolution files."}
          </p>

          {/* Status cards */}
          <div className="space-y-4 mb-10">
            <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4 text-left">
              <div className="w-12 h-12 rounded-xl bg-blue-soft/20 flex items-center justify-center flex-shrink-0">
                <Download className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Digital Copy Ready</h3>
                <p className="text-sm text-muted-foreground">
                  Download link sent to your email
                </p>
              </div>
            </div>

            {wantsPrint && (
              <div className="bg-card rounded-2xl p-5 shadow-card flex items-center gap-4 text-left">
                <div className="w-12 h-12 rounded-xl bg-gradient-accent flex items-center justify-center flex-shrink-0">
                  <Package className="w-6 h-6 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">Prints on the Way</h3>
                  <p className="text-sm text-muted-foreground">
                    Estimated delivery: 3-5 business days
                  </p>
                </div>
              </div>
            )}
          </div>

          <Button variant="hero" size="xl" onClick={onStartOver}>
            Create Another Photo
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
};
