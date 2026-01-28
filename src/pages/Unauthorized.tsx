import { Button } from "@/components/ui/button";

const Unauthorized = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted px-4">
      <div className="w-full max-w-md rounded-2xl bg-card p-6 shadow-card">
        <h1 className="mb-2 text-2xl font-semibold">Unauthorized</h1>
        <p className="mb-6 text-muted-foreground">
          You don&apos;t have access to this preview. Please use the tester link provided to you.
        </p>
        <div className="flex gap-3">
          <Button asChild variant="default" className="w-full">
            <a href="/">Return to Home</a>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
