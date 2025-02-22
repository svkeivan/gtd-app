import { Card } from "@/components/ui/card";
import { landing } from "@/lib/translations/landing";
import Image from "next/image";

const useCases = [
  {
    title: landing["useCases.personalProductivity.title"],
    features: [
      landing["useCases.personalProductivity.taskManagement"],
      landing["useCases.personalProductivity.goalTracking"],
      landing["useCases.personalProductivity.personalProjects"]
    ],
    image: "/window.svg",
    imageAlt: "Personal Use"
  },
  {
    title: landing["useCases.professionalWork.title"],
    features: [
      landing["useCases.professionalWork.projectManagement"],
      landing["useCases.professionalWork.teamCollaboration"],
      landing["useCases.professionalWork.timeTracking"]
    ],
    image: "/window.svg",
    imageAlt: "Professional Use"
  },
  {
    title: landing["useCases.academic.title"],
    features: [
      landing["useCases.academic.researchProjects"],
      landing["useCases.academic.studyPlanning"],
      landing["useCases.academic.assignmentTracking"]
    ],
    image: "/window.svg",
    imageAlt: "Academic Use"
  }
];

export function UseCasesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">{landing["useCases.title"]}</h2>
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
