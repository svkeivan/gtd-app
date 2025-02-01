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
    name: "Free Trial",
    price: "$0",
    description: "14 days of premium features",
    features: [
      "Basic task management",
      "3 projects",
      "Basic analytics"
    ],
    buttonText: "Start Free Trial",
    buttonVariant: "default" as const
  },
  {
    name: "Personal",
    price: "$9",
    description: "per month",
    features: [
      "Unlimited tasks",
      "10 projects",
      "Full analytics"
    ],
    buttonText: "Choose Personal",
    buttonVariant: "default" as const
  },
  {
    name: "Professional",
    price: "$19",
    description: "per month",
    features: [
      "Everything in Personal",
      "Unlimited projects",
      "Priority support"
    ],
    buttonText: "Choose Professional",
    buttonVariant: "default" as const,
    popular: true
  },
  {
    name: "Enterprise",
    price: "Custom",
    description: "For large teams",
    features: [
      "Everything in Professional",
      "Custom integration",
      "Dedicated support"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Simple, Transparent Pricing</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`p-6 relative ${tier.popular ? "border-primary" : ""}`}>
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Popular</Badge>
              )}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-2">{tier.name}</h3>
                <div className="text-3xl font-bold mb-2">{tier.price}</div>
                <p className="text-muted-foreground">{tier.description}</p>
              </div>
              <ul className="space-y-2 mb-8">
                {tier.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
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
      </div>
    </section>
  );
}
