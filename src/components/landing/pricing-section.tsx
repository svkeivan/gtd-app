import { persian } from "@/lib/persian";
import { Badge } from "@/components/ui/badge";
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
    name: persian["pricing.freeTrial.name"],
    price: "$0",
    description: persian["pricing.freeTrial.description"],
    features: [
      persian["pricing.freeTrial.feature1"],
      persian["pricing.freeTrial.feature2"],
      persian["pricing.freeTrial.feature3"],
      persian["pricing.freeTrial.feature4"],
      persian["pricing.freeTrial.feature5"]
    ],
    buttonText: persian["pricing.freeTrial.buttonText"],
    buttonVariant: "default" as const
  },
  {
    name: persian["pricing.personal.name"],
    price: "$9",
    description: persian["pricing.personal.description"],
    features: [
      persian["pricing.personal.feature1"],
      persian["pricing.personal.feature2"],
      persian["pricing.personal.feature3"],
      persian["pricing.personal.feature4"],
      persian["pricing.personal.feature5"],
      persian["pricing.personal.feature6"]
    ],
    buttonText: persian["pricing.personal.buttonText"],
    buttonVariant: "default" as const
  },
  {
    name: persian["pricing.professional.name"],
    price: "$19",
    description: persian["pricing.professional.description"],
    features: [
      persian["pricing.professional.feature1"],
      persian["pricing.professional.feature2"],
      persian["pricing.professional.feature3"],
      persian["pricing.professional.feature4"],
      persian["pricing.professional.feature5"],
      persian["pricing.professional.feature6"],
      persian["pricing.professional.feature7"]
    ],
    buttonText: persian["pricing.professional.buttonText"],
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: persian["pricing.enterprise.name"],
    price: "Custom",
    description: persian["pricing.enterprise.description"],
    features: [
      persian["pricing.enterprise.feature1"],
      persian["pricing.enterprise.feature2"],
      persian["pricing.enterprise.feature3"],
      persian["pricing.enterprise.feature4"],
      persian["pricing.enterprise.feature5"],
      persian["pricing.enterprise.feature6"],
      persian["pricing.enterprise.feature7"]
    ],
    buttonText: persian["pricing.enterprise.buttonText"],
    buttonVariant: "outline" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">{persian["pricing.title"]}</h2>
        <p className="text-center text-muted-foreground mb-16">
          {persian["pricing.description"]}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`p-6 relative ${tier.popular ? "border-primary" : ""}`}>
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">{persian["pricing.mostPopular"]}</Badge>
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
          {persian["pricing.allPlansInclude"]}
        </p>
      </div>
    </section>
  );
}
