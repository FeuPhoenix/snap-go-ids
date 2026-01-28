import { useState, useEffect } from "react";
import { Check, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/StepHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import type { DocumentType } from "@/pages/Index";

type ProcessPhotoVariation = { imageBase64: string; mimeType?: string };
type ProcessPhotoResponse = { success?: boolean; variations?: ProcessPhotoVariation[] };

const getTesterToken = (): string | null => {
  try {
    const raw = localStorage.getItem('tester_auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { token?: string; expiresAt?: number };
    if (!parsed?.token || !parsed?.expiresAt) return null;
    if (Date.now() > parsed.expiresAt) {
      localStorage.removeItem('tester_auth');
      return null;
    }
    return parsed.token;
  } catch {
    return null;
  }
};

const isMockAiEnabled = (): boolean => {
  try {
    return localStorage.getItem('use_mock_ai') === 'true';
  } catch {
    return false;
  }
};

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
  const [error, setError] = useState<string | null>(null);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [variations, setVariations] = useState<string[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const processPhoto = async () => {
      try {
        setLoading(true);
        setError(null);

        const testerToken = getTesterToken();
        if (!testerToken) {
          window.location.assign('/unauthorized');
          return;
        }

        // Extract base64 data from data URL if present
        let imageBase64 = originalPhoto;
        let mimeType = 'image/png';
        
        if (originalPhoto.startsWith('data:')) {
          const matches = originalPhoto.match(/^data:([^;]+);base64,(.+)$/);
          if (matches) {
            mimeType = matches[1];
            imageBase64 = matches[2];
          }
        }

        // Map document type to photo type label
        const photoTypeMap: Record<DocumentType, string> = {
          passport: 'Passport (40x60mm)',
          visa: 'Visa Photo',
          id: 'ID Card Photo',
        };

        const requestBody = { 
          image: imageBase64,
          photoType: photoTypeMap[documentType],
          includeShoulders: true,
          mimeType,
        };

        const mockEnabled = isMockAiEnabled();
        const data: ProcessPhotoResponse | null = mockEnabled
          ? await (async () => {
              const res = await fetch('/api/process-photo', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  'x-tester-auth': testerToken,
                },
                body: JSON.stringify(requestBody),
              });

              if (res.status === 401) {
                window.location.assign('/unauthorized');
                return null;
              }
              if (res.status === 429) {
                const msg = 'Too many requests. Please wait a minute and try again.';
                setError(msg);
                toast({
                  title: 'Rate limit reached',
                  description: msg,
                  variant: 'destructive',
                });
                return null;
              }
              if (!res.ok) {
                const text = await res.text();
                throw new Error(text || 'Failed to process photo');
              }

              return (await res.json()) as ProcessPhotoResponse;
            })()
          : await (async () => {
              const { data: fnData, error: fnError } = await supabase.functions.invoke('process-photo', {
                headers: {
                  'x-tester-auth': testerToken,
                },
                body: requestBody,
              });

              if (fnError) {
                console.error('Edge function error:', fnError);
                const status = (fnError as unknown as { status?: number })?.status;
                if (status === 401) {
                  window.location.assign('/unauthorized');
                  return null;
                }
                if (status === 429) {
                  const msg = 'Too many requests. Please wait a minute and try again.';
                  setError(msg);
                  toast({
                    title: 'Rate limit reached',
                    description: msg,
                    variant: 'destructive',
                  });
                  return null;
                }
                throw new Error(fnError.message || 'Failed to process photo');
              }

              return fnData as ProcessPhotoResponse;
            })();

        if (data === null) {
          return;
        }

        // Handle n8n response format with variations array
        if (data?.success && data?.variations && Array.isArray(data.variations)) {
          const variationUrls = data.variations.map((v: { imageBase64: string; mimeType?: string }) => {
            // Convert base64 back to data URL for display
            return `data:${v.mimeType || 'image/png'};base64,${v.imageBase64}`;
          });
          setVariations(variationUrls);
        } else {
          // Fallback: use original photo as all 4 variations (for testing)
          console.warn('No variations returned from n8n, using original photo');
          setVariations([originalPhoto, originalPhoto, originalPhoto, originalPhoto]);
        }
      } catch (err) {
        console.error('Error processing photo:', err);
        setError(err instanceof Error ? err.message : 'Failed to process photo');
        // Fallback to original photo for demo purposes
        setVariations([originalPhoto, originalPhoto, originalPhoto, originalPhoto]);
        toast({
          title: "Using preview mode",
          description: "Could not connect to n8n workflow. Showing original photo as preview.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };

    processPhoto();
  }, [originalPhoto, documentType, toast]);

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
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-6">
                <AlertCircle className="w-10 h-10 text-muted-foreground" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground mb-2">
                Can&apos;t process right now
              </h3>
              <p className="text-muted-foreground text-center max-w-md mb-6">{error}</p>
              <Button variant="outline" onClick={onBack}>
                Go back
              </Button>
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
