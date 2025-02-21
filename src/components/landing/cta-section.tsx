import { persian } from "@/lib/persian";
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
        <h2 className="text-3xl font-bold mb-6">{persian["cta.title"]}</h2>
        <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
          {persian["cta.description"]}
        </p>
        {!isLoggedIn && (
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="w-full sm:w-auto">{persian["cta.startFreeTrial"]}</Button>
            </Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto">
              {persian["cta.scheduleDemo"]}
            </Button>
          </div>
        )}
        <div className="mt-8 flex justify-center gap-8">
          <Badge variant="secondary">{persian["cta.encryption"]}</Badge>
          <Badge variant="secondary">{persian["cta.isoCertified"]}</Badge>
          <Badge variant="secondary">{persian["cta.gdprCompliant"]}</Badge>
        </div>
      </div>
    </section>
  );
}
