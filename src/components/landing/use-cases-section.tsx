import { Card } from "@/components/ui/card";
import Image from "next/image";

const useCases = [
  {
    title: "Personal Productivity",
    features: [
      "Task management",
      "Goal tracking",
      "Personal projects"
    ],
    image: "/window.svg",
    imageAlt: "Personal Use"
  },
  {
    title: "Professional Work",
    features: [
      "Project management",
      "Team collaboration",
      "Time tracking"
    ],
    image: "/window.svg",
    imageAlt: "Professional Use"
  },
  {
    title: "Academic",
    features: [
      "Research projects",
      "Study planning",
      "Assignment tracking"
    ],
    image: "/window.svg",
    imageAlt: "Academic Use"
  }
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Perfect For Every Need</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <Card key={index} className="p-6">
              <h3 className="text-xl font-semibold mb-4">{useCase.title}</h3>
              <ul className="space-y-2 mb-4">
                {useCase.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <Image
                  src={useCase.image}
                  alt={useCase.imageAlt}
                  fill
                  className="object-cover"
                />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
