import { Camera, FileCheck, Printer, ArrowRight, Shield, Clock, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage = ({ onGetStarted }: LandingPageProps) => {
  const steps = [
    {
      icon: Camera,
      title: "Take Your Photo",
      description: "Use your device camera with our smart face detection for the perfect shot.",
    },
    {
      icon: FileCheck,
      title: "Choose Document Type",
      description: "Select passport, visa, or ID – each with official sizing requirements.",
    },
    {
      icon: Printer,
      title: "Get Your Photos",
      description: "Download instantly or have professional prints delivered to your door.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Official Compliance",
      description: "Photos meet all government requirements",
    },
    {
      icon: Clock,
      title: "Ready in Minutes",
      description: "No waiting, no appointments needed",
    },
    {
      icon: Award,
      title: "Guaranteed Acceptance",
      description: "AI-verified to pass inspection",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-hero text-primary-foreground relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        
        <div className="container mx-auto px-4 py-20 lg:py-32 relative">
          <div className="max-w-3xl mx-auto text-center animate-slide-up">
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Professional ID Photos
              <span className="block text-blue-soft">From Your Device</span>
            </h1>
            <p className="text-lg md:text-xl text-blue-soft mb-10 max-w-2xl mx-auto leading-relaxed">
              Create passport, visa, and ID photos that meet official requirements. 
              No studio visit needed – our AI ensures perfect compliance every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button variant="hero" size="xl" onClick={onGetStarted}>
                Get Started
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="heroOutline" size="xl" className="border-blue-soft text-blue-soft hover:bg-blue-soft hover:text-primary">
                Learn More
              </Button>
            </div>
          </div>
        </div>

        {/* Wave decoration */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 120L60 110C120 100 240 80 360 75C480 70 600 80 720 85C840 90 960 90 1080 85C1200 80 1320 70 1380 65L1440 60V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="hsl(43 67% 91%)"/>
          </svg>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              Get your official photos in three simple steps
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-card-lg transition-all duration-300 group"
              >
                <div className="absolute -top-4 -left-4 w-10 h-10 bg-gradient-accent rounded-full flex items-center justify-center text-accent-foreground font-bold text-lg shadow-accent">
                  {index + 1}
                </div>
                <div className="w-16 h-16 bg-blue-soft/20 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="w-8 h-8 text-secondary" />
                </div>
                <h3 className="font-display text-xl font-semibold text-foreground mb-3">
                  {step.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-cream-dark/50">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {features.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center flex-shrink-0">
                  <feature.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground mb-1">{feature.title}</h4>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-hero rounded-3xl p-10 md:p-16 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(102,155,188,0.2),transparent_70%)]" />
            <div className="relative">
              <h2 className="font-display text-3xl md:text-4xl font-bold text-primary-foreground mb-4">
                Ready to Get Started?
              </h2>
              <p className="text-blue-soft text-lg mb-8 max-w-xl mx-auto">
                Create professional ID photos in minutes. No appointment needed.
              </p>
              <Button variant="hero" size="xl" onClick={onGetStarted}>
                Take Your Photo Now
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} PhotoID Pro. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
