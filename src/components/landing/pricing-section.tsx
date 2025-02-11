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
    description: "15 days of Professional features",
    features: [
      "Unlimited projects during trial",
      "Advanced analytics dashboard",
      "Priority email support",
      "Team collaboration tools",
      "Converts to Free plan after trial"
    ],
    buttonText: "Start 15-Day Trial",
    buttonVariant: "default" as const
  },
  {
    name: "Personal",
    price: "$9",
    description: "per month",
    features: [
      "Up to 10 projects",
      "Basic analytics dashboard",
      "Priority email support",
      "Unlimited tasks and contexts",
      "Project time tracking",
      "Custom tags and filters"
    ],
    buttonText: "Choose Personal",
    buttonVariant: "default" as const
  },
  {
    name: "Professional",
    price: "$19",
    description: "per month",
    features: [
      "Unlimited projects",
      "Advanced analytics & reporting",
      "Priority support with SLA",
      "Team collaboration features",
      "Project dependencies",
      "Advanced time tracking",
      "Custom dashboards"
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
      "Custom project limits",
      "Dedicated support manager",
      "Custom integrations",
      "SLA guarantees",
      "Advanced security features",
      "User role management",
      "Training & onboarding"
    ],
    buttonText: "Contact Sales",
    buttonVariant: "outline" as const
  }
];

export function PricingSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-4">Simple, Transparent Pricing</h2>
        <p className="text-center text-muted-foreground mb-16">
          Start with a 15-day free trial of our Professional plan. No credit card required.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {pricingTiers.map((tier, index) => (
            <Card key={index} className={`p-6 relative ${tier.popular ? "border-primary" : ""}`}>
              {tier.popular && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
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
          All plans include: SSL security, automatic backups, and regular updates.
        </p>
      </div>
    </section>
  );
}
