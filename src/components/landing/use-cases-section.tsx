import { Card } from "@/components/ui/card";
import { landing } from "@/lib/translations/landing";
import Image from "next/image";
import { motion } from "framer-motion";

const useCases = [
  {
    title: landing["useCases.personalProductivity.title"],
    features: [
      landing["useCases.personalProductivity.taskManagement"],
      landing["useCases.personalProductivity.goalTracking"],
      landing["useCases.personalProductivity.personalProjects"]
    ],
    image: "/use-cases/personal-productivity.png",
    imageAlt: "Personal Use",
    color: "from-blue-500/20 to-blue-600/20",
    icon: "/icons/personal.svg"
  },
  {
    title: landing["useCases.professionalWork.title"],
    features: [
      landing["useCases.professionalWork.projectManagement"],
      landing["useCases.professionalWork.teamCollaboration"],
      landing["useCases.professionalWork.timeTracking"]
    ],
    image: "/use-cases/professional-work.png",
    imageAlt: "Professional Use",
    color: "from-purple-500/20 to-purple-600/20",
    icon: "/icons/professional.svg"
  },
  {
    title: landing["useCases.academic.title"],
    features: [
      landing["useCases.academic.researchProjects"],
      landing["useCases.academic.studyPlanning"],
      landing["useCases.academic.assignmentTracking"]
    ],
    image: "/use-cases/academic-use.png",
    imageAlt: "Academic Use",
    color: "from-green-500/20 to-green-600/20",
    icon: "/icons/academic.svg"
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

export function UseCasesSection() {
  return (
    <section className="py-24 bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-primary/5 to-transparent" />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4">{landing["useCases.title"]}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Discover how our platform adapts to your unique needs and workflow.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {useCases.map((useCase, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="group relative h-full overflow-hidden hover:shadow-xl transition-shadow duration-300">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${useCase.color} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                
                {/* Content */}
                <div className="relative z-10 p-6">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="p-2 rounded-xl bg-primary/10">
                      <Image
                        src={useCase.icon}
                        alt={useCase.title}
                        width={32}
                        height={32}
                        className="group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="text-xl font-semibold">{useCase.title}</h3>
                  </div>

                  <div className="aspect-video relative rounded-lg overflow-hidden mb-6">
                    <Image
                      src={useCase.image}
                      alt={useCase.imageAlt}
                      fill
                      className="object-cover transform group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                  </div>

                  <ul className="space-y-3">
                    {useCase.features.map((feature, featureIndex) => (
                      <motion.li 
                        key={featureIndex} 
                        className="flex items-center gap-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        transition={{ delay: featureIndex * 0.1 }}
                      >
                        <svg className="w-5 h-5 text-primary flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-muted-foreground">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
