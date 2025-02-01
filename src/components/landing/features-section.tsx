import { Card } from "@/components/ui/card";
import Image from "next/image";

const features = [
  {
    icon: "/file.svg",
    title: "Intelligent Task Management",
    description: "Automatically categorizes and prioritizes your tasks based on GTD principles",
    image: "/window.svg",
    imageAlt: "Task Organization Demo"
  },
  {
    icon: "/window.svg",
    title: "Hierarchical Project Management",
    description: "Organize complex projects with unlimited sub-projects and task dependencies",
    image: "/window.svg",
    imageAlt: "Project Hierarchy"
  },
  {
    icon: "/window.svg",
    title: "Track & Analyze Your Productivity",
    description: "Built-in time tracking with detailed analytics to optimize your workflow",
    image: "/window.svg",
    imageAlt: "Analytics Dashboard"
  },
  {
    icon: "/globe.svg",
    title: "Global Productivity",
    description: "Full support for English and Farsi with Shamsi calendar integration",
    image: "/window.svg",
    imageAlt: "Language Support"
  }
];

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Key Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="mb-4">
                <Image src={feature.icon} alt={feature.title} width={40} height={40} />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground mb-4">
                {feature.description}
              </p>
              <div className="aspect-video relative bg-muted rounded-lg overflow-hidden">
                <Image
                  src={feature.image}
                  alt={feature.imageAlt}
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
