import { Card } from "@/components/ui/card";
import { landing } from "@/lib/translations/landing";
import Image from "next/image";
import { motion } from "framer-motion";

const features = [
  {
    icon: "/icons/task-management.svg",
    title: landing["features.taskManagement.title"],
    description: landing["features.taskManagement.description"],
    image: "/features/task-organization.png",
    imageAlt: "Task Organization Demo",
    color: "from-blue-500/20 to-blue-600/20"
  },
  {
    icon: "/icons/project.svg",
    title: landing["features.projectManagement.title"],
    description: landing["features.projectManagement.description"],
    image: "/features/project-hierarchy.png",
    imageAlt: "Project Hierarchy",
    color: "from-purple-500/20 to-purple-600/20"
  },
  {
    icon: "/icons/productivity.svg",
    title: landing["features.productivity.title"],
    description: landing["features.productivity.description"],
    image: "/features/analytics-dashboard.png",
    imageAlt: "Analytics Dashboard",
    color: "from-green-500/20 to-green-600/20"
  },
  {
    icon: "/icons/globe.svg",
    title: landing["features.globalProductivity.title"],
    description: landing["features.globalProductivity.description"],
    image: "/features/language-support.png",
    imageAlt: "Language Support",
    color: "from-orange-500/20 to-orange-600/20"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.5
    }
  }
};

export function FeaturesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />
      
      <motion.div 
        className="container mx-auto px-4 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.h2 
          className="text-3xl font-bold text-center mb-16"
          variants={itemVariants}
        >
          {landing["features.title"]}
        </motion.h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6 h-full hover:shadow-lg transition-all duration-300 group relative overflow-hidden">
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Image 
                        src={feature.icon} 
                        alt={feature.title} 
                        width={24} 
                        height={24}
                        className="group-hover:scale-110 transition-transform duration-300" 
                      />
                    </div>
                    <h3 className="text-xl font-semibold">{feature.title}</h3>
                  </div>
                  <p className="text-muted-foreground mb-6">
                    {feature.description}
                  </p>
                  <div className="aspect-video relative rounded-lg overflow-hidden bg-muted">
                    <Image
                      src={feature.image}
                      alt={feature.imageAlt}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
