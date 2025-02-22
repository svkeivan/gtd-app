import { landing } from "@/lib/translations/landing";

const steps = [
  {
    number: 1,
    title: landing["howItWorks.capture.title"],
    description: landing["howItWorks.capture.description"]
  },
  {
    number: 2,
    title: landing["howItWorks.organize.title"],
    description: landing["howItWorks.organize.description"]
  },
  {
    number: 3,
    title: landing["howItWorks.review.title"],
    description: landing["howItWorks.review.description"]
  },
  {
    number: 4,
    title: landing["howItWorks.takeAction.title"],
    description: landing["howItWorks.takeAction.description"]
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">{landing["howItWorks.title"]}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
