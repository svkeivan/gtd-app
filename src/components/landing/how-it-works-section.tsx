import { landing } from "@/lib/translations/landing";
import { motion } from "framer-motion";
import Image from "next/image";

const steps = [
  {
    number: 1,
    title: landing["howItWorks.capture.title"],
    description: landing["howItWorks.capture.description"],
    icon: "/icons/capture.svg",
    color: "from-blue-500 to-blue-600"
  },
  {
    number: 2,
    title: landing["howItWorks.organize.title"],
    description: landing["howItWorks.organize.description"],
    icon: "/icons/organize.svg",
    color: "from-purple-500 to-purple-600"
  },
  {
    number: 3,
    title: landing["howItWorks.review.title"],
    description: landing["howItWorks.review.description"],
    icon: "/icons/review.svg",
    color: "from-green-500 to-green-600"
  },
  {
    number: 4,
    title: landing["howItWorks.takeAction.title"],
    description: landing["howItWorks.takeAction.description"],
    icon: "/icons/action.svg",
    color: "from-orange-500 to-orange-600"
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

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-grid-pattern opacity-5" />
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-background to-transparent" />
        <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-background to-transparent" />
      </div>

      <motion.div 
        className="container mx-auto px-4 relative"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: "-100px" }}
        variants={containerVariants}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-3xl font-bold mb-4">{landing["howItWorks.title"]}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Follow these simple steps to boost your productivity and achieve your goals.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <motion.div 
              key={step.number}
              variants={itemVariants}
              className="relative"
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-1/2 left-full w-full h-0.5 bg-primary/20 -translate-y-1/2 z-0" />
              )}

              <div className="relative bg-card rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
                <div className="flex flex-col items-center text-center">
                  <motion.div 
                    className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Image
                      src={step.icon}
                      alt={step.title}
                      width={32}
                      height={32}
                      className="text-white"
                    />
                  </motion.div>
                  <div className="space-y-2">
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </div>

                {/* Step number indicator */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white font-bold text-sm shadow-lg">
                  {step.number}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Action button */}
        <motion.div 
          className="mt-16 text-center"
          variants={itemVariants}
        >
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-white font-semibold shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            Get Started Now
            <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </motion.button>
        </motion.div>
      </motion.div>
    </section>
  );
}
