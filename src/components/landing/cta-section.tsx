import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface CtaSectionProps {
  isLoggedIn?: boolean;
}

export function CtaSection({ isLoggedIn }: CtaSectionProps) {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4 text-center">
        <h2 className="text-3xl font-bold mb-6">Start Getting Things Done Today</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          14-day free trial, no credit card required
        </p>
        {!isLoggedIn && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">Start Free Trial</Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              Schedule Demo
            </Button>
          </div>
        )}
        <div className="mt-8 flex justify-center gap-8">
          <Badge variant="secondary">256-bit Encryption</Badge>
          <Badge variant="secondary">ISO 27001</Badge>
          <Badge variant="secondary">GDPR Compliant</Badge>
        </div>
      </div>
    </section>
  );
}
