import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { landing } from "@/lib/translations/landing";

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-b from-primary/10 to-background pt-24 pb-32">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center text-center lg:text-left lg:flex-row lg:justify-between lg:gap-12">
          <div className="max-w-2xl lg:w-1/2">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {landing["hero.header"]}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {landing["hero.description"]}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">50%</div>
                <div className="text-sm text-muted-foreground">{landing["hero.lessTime"]}</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">30%</div>
                <div className="text-sm text-muted-foreground">{landing["hero.higherCompletion"]}</div>
              </div>
              <div className="text-center p-4 bg-background/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">{landing["hero.productiveUsers"]}</div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="w-full sm:w-auto">{landing["hero.goToDashboard"]}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/register">
                    <Button size="lg" className="w-full sm:w-auto">{landing["hero.startFreeTrial"]}</Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    {landing["hero.watchDemo"]}
                  </Button>
                  <Link href="/login">
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto">{landing["hero.signIn"]}</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="hidden lg:block lg:w-1/2">
            <div className="relative">
              <Image
                src="/window.svg"
                alt="Planito Interface"
                width={600}
                height={400}
                className="rounded-lg shadow-2xl"
                priority
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
