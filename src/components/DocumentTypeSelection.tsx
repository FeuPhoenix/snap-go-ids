import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/StepHeader";
import type { DocumentType } from "@/pages/Index";

interface DocumentTypeSelectionProps {
  onSelect: (type: DocumentType) => void;
  onBack: () => void;
}

const documentTypes = [
  {
    id: "passport" as DocumentType,
    title: "Passport Photo",
    size: "35mm × 45mm",
    description: "Standard passport photo for international travel documents. White or light gray background required.",
    requirements: [
      "Face centered and visible",
      "Neutral expression",
      "No glasses or headwear",
      "White/light gray background",
    ],
  },
  {
    id: "visa" as DocumentType,
    title: "Visa Photo",
    size: "50mm × 50mm",
    description: "Square format photo for visa applications. Background and expression requirements vary by country.",
    requirements: [
      "Full face, front view",
      "Eyes open and visible",
      "Plain white background",
      "Recent photo (within 6 months)",
    ],
  },
  {
    id: "id" as DocumentType,
    title: "ID Card Photo",
    size: "35mm × 45mm",
    description: "Photo for national ID cards, driver's licenses, and other official identification documents.",
    requirements: [
      "Clear facial features",
      "Proper lighting",
      "Solid background",
      "No shadows on face",
    ],
  },
];

export const DocumentTypeSelection = ({ onSelect, onBack }: DocumentTypeSelectionProps) => {
  return (
    <div className="min-h-screen bg-background">
      <StepHeader
        step={2}
        totalSteps={4}
        title="Select Document Type"
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <p className="text-center text-muted-foreground mb-8">
            Choose the type of document you need the photo for. Each has specific size and format requirements.
          </p>

          <div className="space-y-4">
            {documentTypes.map((doc) => (
              <button
                key={doc.id}
                onClick={() => onSelect(doc.id)}
                className="w-full bg-card rounded-2xl p-6 shadow-card hover:shadow-card-lg transition-all duration-300 text-left group hover:scale-[1.01] active:scale-[0.99]"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-display text-xl font-semibold text-foreground group-hover:text-secondary transition-colors">
                      {doc.title}
                    </h3>
                    <span className="inline-block mt-1 px-3 py-1 bg-blue-soft/20 text-secondary rounded-full text-sm font-medium">
                      {doc.size}
                    </span>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Check className="w-5 h-5 text-primary-foreground" />
                  </div>
                </div>

                <p className="text-muted-foreground mb-4 leading-relaxed">
                  {doc.description}
                </p>

                <div className="grid grid-cols-2 gap-2">
                  {doc.requirements.map((req, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                      {req}
                    </div>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
