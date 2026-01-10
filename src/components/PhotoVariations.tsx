import { useState, useEffect } from "react";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/StepHeader";
import type { DocumentType } from "@/pages/Index";

interface PhotoVariationsProps {
  documentType: DocumentType;
  originalPhoto: string;
  onSelectVariation: (index: number) => void;
  onBack: () => void;
}

export const PhotoVariations = ({
  documentType,
  originalPhoto,
  onSelectVariation,
  onBack,
}: PhotoVariationsProps) => {
  const [loading, setLoading] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [variations, setVariations] = useState<string[]>([]);

  // Simulate AI processing - in production, this would call n8n workflow
  useEffect(() => {
    const timer = setTimeout(() => {
      // For demo, we'll use the original photo with slight variations (simulated)
      setVariations([originalPhoto, originalPhoto, originalPhoto, originalPhoto]);
      setLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, [originalPhoto]);

  const documentLabels: Record<DocumentType, string> = {
    passport: "Passport",
    visa: "Visa",
    id: "ID Card",
  };

  return (
    <div className="min-h-screen bg-background">
      <StepHeader
        step={3}
        totalSteps={4}
        title="Choose Your Photo"
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center mb-6 animate-pulse-soft">
                <Loader2 className="w-10 h-10 text-accent-foreground animate-spin" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Processing Your Photo
              </h3>
              <p className="text-muted-foreground text-center max-w-md">
                Our AI is generating {documentLabels[documentType].toLowerCase()} photo variations 
                optimized for official requirements...
              </p>
            </div>
          ) : (
            <div className="animate-slide-up">
              <p className="text-center text-muted-foreground mb-8">
                Select the variation you prefer. All photos meet {documentLabels[documentType]} requirements.
              </p>

              <div className="grid grid-cols-2 gap-4 md:gap-6 mb-8">
                {variations.map((variation, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedIndex(index)}
                    className={`relative aspect-[3/4] rounded-2xl overflow-hidden transition-all duration-300 ${
                      selectedIndex === index
                        ? "ring-4 ring-accent scale-[1.02] shadow-accent"
                        : "shadow-card hover:shadow-card-lg hover:scale-[1.01]"
                    }`}
                  >
                    <img
                      src={variation}
                      alt={`Variation ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Variation number badge */}
                    <div className="absolute top-3 left-3 w-8 h-8 rounded-full bg-card/90 backdrop-blur-sm flex items-center justify-center text-sm font-semibold text-foreground">
                      {index + 1}
                    </div>

                    {/* Selected indicator */}
                    {selectedIndex === index && (
                      <div className="absolute top-3 right-3 w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center">
                        <Check className="w-5 h-5 text-accent-foreground" />
                      </div>
                    )}

                    {/* Overlay gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent transition-opacity ${
                      selectedIndex === index ? "opacity-100" : "opacity-0"
                    }`} />
                  </button>
                ))}
              </div>

              <Button
                variant="hero"
                size="xl"
                className="w-full"
                onClick={() => selectedIndex !== null && onSelectVariation(selectedIndex)}
                disabled={selectedIndex === null}
              >
                Continue with Selection
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
