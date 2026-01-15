import { useState, useRef, useCallback, useEffect } from "react";
import { Camera, RotateCcw, Check, AlertCircle, Lightbulb, Focus, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { StepHeader } from "@/components/StepHeader";

interface PhotoCaptureProps {
  onPhotoCapture: (photo: string) => void;
  onBack: () => void;
}

interface ValidationState {
  faceDetected: boolean;
  centered: boolean;
  lighting: boolean;
}

export const PhotoCapture = ({ onPhotoCapture, onBack }: PhotoCaptureProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [validation, setValidation] = useState<ValidationState>({
    faceDetected: false,
    centered: false,
    lighting: false,
  });

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: 640, height: 480 },
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  }, [stream]);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  // Simulate face detection validation
  useEffect(() => {
    if (!stream || capturedImage) return;

    const interval = setInterval(() => {
      // Simulated validation - in production, use real face detection
      setValidation({
        faceDetected: Math.random() > 0.2,
        centered: Math.random() > 0.3,
        lighting: Math.random() > 0.25,
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [stream, capturedImage]);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    setIsCapturing(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    if (ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0);
      const imageData = canvas.toDataURL("image/jpeg", 0.95);
      setCapturedImage(imageData);
      stopCamera();
    }
    setIsCapturing(false);
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      setCapturedImage(result);
      stopCamera();
    };
    reader.readAsDataURL(file);
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const confirmPhoto = () => {
    if (capturedImage) {
      onPhotoCapture(capturedImage);
    }
  };

  const allValid = validation.faceDetected && validation.centered && validation.lighting;

  const validationItems = [
    { key: "faceDetected", label: "Face detected", icon: Focus, valid: validation.faceDetected },
    { key: "centered", label: "Face centered", icon: Focus, valid: validation.centered },
    { key: "lighting", label: "Good lighting", icon: Lightbulb, valid: validation.lighting },
  ];

  return (
    <div className="min-h-screen bg-background">
      <StepHeader
        step={1}
        totalSteps={4}
        title="Capture Your Photo"
        onBack={onBack}
      />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Camera/Preview Area */}
          <div className="relative bg-card rounded-3xl overflow-hidden shadow-card-lg mb-8">
            <div className="aspect-[3/4] relative">
              {!capturedImage ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                  {/* Face guide overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className={`w-48 h-60 border-4 rounded-full transition-colors duration-300 ${
                      allValid ? "border-blue-muted" : "border-accent"
                    }`}>
                      <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-sm font-medium text-card-foreground bg-card/90 px-3 py-1 rounded-full">
                        Position your face here
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <img
                  src={capturedImage}
                  alt="Captured photo"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <canvas ref={canvasRef} className="hidden" />
          </div>

          {/* Validation Status */}
          {!capturedImage && (
            <div className="bg-card rounded-2xl p-6 shadow-card mb-8 animate-fade-in">
              <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-secondary" />
                Photo Requirements
              </h3>
              <div className="space-y-3">
                {validationItems.map((item) => (
                  <div
                    key={item.key}
                    className={`flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      item.valid ? "bg-blue-soft/20" : "bg-accent/10"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                        item.valid ? "bg-blue-muted text-secondary-foreground" : "bg-accent/20 text-accent"
                      }`}
                    >
                      {item.valid ? (
                        <Check className="w-4 h-4" />
                      ) : (
                        <item.icon className="w-4 h-4" />
                      )}
                    </div>
                    <span className={`font-medium ${item.valid ? "text-foreground" : "text-muted-foreground"}`}>
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-4">
            {!capturedImage ? (
              <>
                <div className="flex gap-4">
                  <Button
                    variant="hero"
                    size="xl"
                    className="flex-1"
                    onClick={capturePhoto}
                    disabled={isCapturing}
                  >
                    <Camera className="w-5 h-5 mr-2" />
                    Capture Photo
                  </Button>
                </div>
                <div className="relative flex items-center">
                  <div className="flex-1 border-t border-border"></div>
                  <span className="px-4 text-sm text-muted-foreground">or</span>
                  <div className="flex-1 border-t border-border"></div>
                </div>
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full"
                  onClick={triggerFileUpload}
                >
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Photo
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </>
            ) : (
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="lg"
                  className="flex-1"
                  onClick={retakePhoto}
                >
                  <RotateCcw className="w-5 h-5 mr-2" />
                  Retake
                </Button>
                <Button
                  variant="hero"
                  size="lg"
                  className="flex-1"
                  onClick={confirmPhoto}
                >
                  <Check className="w-5 h-5 mr-2" />
                  Use This Photo
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
