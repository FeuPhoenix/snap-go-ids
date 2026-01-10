import { useState } from "react";
import { LandingPage } from "@/components/LandingPage";
import { PhotoCapture } from "@/components/PhotoCapture";
import { DocumentTypeSelection } from "@/components/DocumentTypeSelection";
import { PhotoVariations } from "@/components/PhotoVariations";
import { DeliveryConfirmation } from "@/components/DeliveryConfirmation";
import { SuccessPage } from "@/components/SuccessPage";

export type DocumentType = "passport" | "visa" | "id";

export interface AppState {
  step: number;
  capturedPhoto: string | null;
  documentType: DocumentType | null;
  selectedVariation: number | null;
  wantsPrint: boolean;
  deliveryAddress: string;
}

const Index = () => {
  const [state, setState] = useState<AppState>({
    step: 0,
    capturedPhoto: null,
    documentType: null,
    selectedVariation: null,
    wantsPrint: false,
    deliveryAddress: "",
  });

  const goToStep = (step: number) => {
    setState((prev) => ({ ...prev, step }));
  };

  const setPhoto = (photo: string) => {
    setState((prev) => ({ ...prev, capturedPhoto: photo }));
  };

  const setDocumentType = (type: DocumentType) => {
    setState((prev) => ({ ...prev, documentType: type }));
  };

  const setSelectedVariation = (index: number) => {
    setState((prev) => ({ ...prev, selectedVariation: index }));
  };

  const setWantsPrint = (wants: boolean) => {
    setState((prev) => ({ ...prev, wantsPrint: wants }));
  };

  const setDeliveryAddress = (address: string) => {
    setState((prev) => ({ ...prev, deliveryAddress: address }));
  };

  const resetFlow = () => {
    setState({
      step: 0,
      capturedPhoto: null,
      documentType: null,
      selectedVariation: null,
      wantsPrint: false,
      deliveryAddress: "",
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {state.step === 0 && <LandingPage onGetStarted={() => goToStep(1)} />}
      
      {state.step === 1 && (
        <PhotoCapture
          onPhotoCapture={(photo) => {
            setPhoto(photo);
            goToStep(2);
          }}
          onBack={() => goToStep(0)}
        />
      )}
      
      {state.step === 2 && (
        <DocumentTypeSelection
          onSelect={(type) => {
            setDocumentType(type);
            goToStep(3);
          }}
          onBack={() => goToStep(1)}
        />
      )}
      
      {state.step === 3 && (
        <PhotoVariations
          documentType={state.documentType!}
          originalPhoto={state.capturedPhoto!}
          onSelectVariation={(index) => {
            setSelectedVariation(index);
            goToStep(4);
          }}
          onBack={() => goToStep(2)}
        />
      )}
      
      {state.step === 4 && (
        <DeliveryConfirmation
          selectedVariation={state.selectedVariation!}
          wantsPrint={state.wantsPrint}
          setWantsPrint={setWantsPrint}
          deliveryAddress={state.deliveryAddress}
          setDeliveryAddress={setDeliveryAddress}
          onConfirm={() => goToStep(5)}
          onBack={() => goToStep(3)}
        />
      )}
      
      {state.step === 5 && (
        <SuccessPage
          wantsPrint={state.wantsPrint}
          onStartOver={resetFlow}
        />
      )}
    </div>
  );
};

export default Index;
