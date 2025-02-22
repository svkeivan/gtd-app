import { Badge } from "@/components/ui/badge";
import { landing } from "@/lib/translations/landing";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

interface PricingTier {
  name: string;
  price: string;
  description: string;
  features: string[];
  buttonText: string;
  buttonVariant: "default" | "outline";
  popular?: boolean;
}

const pricingTiers: PricingTier[] = [
  {
    name: landing["pricing.freeTrial.name"],
    price: "$0",
    description: landing["pricing.freeTrial.description"],
    features: [
      landing["pricing.freeTrial.feature1"],
      landing["pricing.freeTrial.feature2"],
      landing["pricing.freeTrial.feature3"],
      landing["pricing.freeTrial.feature4"],
      landing["pricing.freeTrial.feature5"]
    ],
    buttonText: landing["pricing.freeTrial.buttonText"],
    buttonVariant: "default" as const
  },
  {
    name: landing["pricing.personal.name"],
    price: "$9",
    description: landing["pricing.personal.description"],
    features: [
      landing["pricing.personal.feature1"],
      landing["pricing.personal.feature2"],
      landing["pricing.personal.feature3"],
      landing["pricing.personal.feature4"],
      landing["pricing.personal.feature5"],
      landing["pricing.personal.feature6"]
    ],
    buttonText: landing["pricing.personal.buttonText"],
    buttonVariant: "default" as const
  },
  {
    name: landing["pricing.professional.name"],
    price: "$19",
    description: landing["pricing.professional.description"],
    features: [
      landing["pricing.professional.feature1"],
      landing["pricing.professional.feature2"],
      landing["pricing.professional.feature3"],
      landing["pricing.professional.feature4"],
      landing["pricing.professional.feature5"],
      landing["pricing.professional.feature6"],
      landing["pricing.professional.feature7"]
    ],
    buttonText: landing["pricing.professional.buttonText"],
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: landing["pricing.enterprise.name"],
    price: "Custom",
    description: landing["pricing.enterprise.description"],
    features: [
      landing["pricing.enterprise.feature1"],
      landing["pricing.enterprise.feature2"],
      landing["pricing.enterprise.feature3"],
      landing["pricing.enterprise.feature4"],
      landing["pricing.enterprise.feature5"],
      landing["pricing.enterprise.feature6"],
      landing["pricing.enterprise.feature7"]
    ],
    buttonText: landing["pricing.enterprise.buttonText"],
    buttonVariant: "outline" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{landing["pricing.title"]}</h2>
        <p className="text-center text-muted-foreground mb-16">
          {landing["pricing.description"]}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`p-6 relative ${tier.popular ? "border-primary" : ""}`}>
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{landing["pricing.mostPopular"]}</Badge>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold mb-2">{tier.price}</div>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-primary"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              {tier.buttonVariant === "default" ? (
                <Link href="/register" className="block">
                  <Button className="w-full">{tier.buttonText}</Button>
                </Link>
              ) : (
                <Button variant={tier.buttonVariant} className="w-full">
                  {tier.buttonText}
                </Button>
              )}
            </Card>
          ))}
        </div>
        <p className="text-center text-sm text-muted-foreground mt-8">
          {landing["pricing.allPlansInclude"]}
        </p>
      </div>
    </section>
  );
}
