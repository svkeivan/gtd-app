import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landing } from "@/lib/translations/landing";
import { motion } from "framer-motion";

const faqItems = [
  {
    question: landing["faq.question1"],
    answer: landing["faq.answer1"]
  },
  {
    question: landing["faq.question2"],
    answer: landing["faq.answer2"]
  },
  {
    question: landing["faq.question3"],
    answer: landing["faq.answer3"]
  },
  {
    question: landing["faq.question4"],
    answer: landing["faq.answer4"]
  },
  {
    question: landing["faq.question5"],
    answer: landing["faq.answer5"]
  },
  {
    question: landing["faq.question6"],
    answer: landing["faq.answer6"]
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
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

export function FaqSection() {
  return (
    <section className="py-24 bg-primary/5 relative overflow-hidden">
      {/* Background decoration */}
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
          <h2 className="text-3xl font-bold mb-4">{landing["faq.title"]}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Find answers to commonly asked questions about our platform.
          </p>
        </motion.div>

        <motion.div 
          className="max-w-3xl mx-auto bg-card rounded-xl shadow-lg p-6"
          variants={itemVariants}
        >
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqItems.map((item, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                custom={index}
              >
                <AccordionItem 
                  value={`item-${index}`}
                  className="border border-primary/10 rounded-lg px-4 mb-4 data-[state=open]:bg-primary/5 transition-colors duration-200"
                >
                  <AccordionTrigger className="hover:no-underline py-4">
                    <span className="text-left font-semibold">{item.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground pb-4">
                    {item.answer}
                  </AccordionContent>
                </AccordionItem>
              </motion.div>
            ))}
          </Accordion>
        </motion.div>

        {/* Contact support link */}
        <motion.div 
          className="text-center mt-12"
          variants={itemVariants}
        >
          <p className="text-muted-foreground">
            Still have questions?{" "}
            <a 
              href="#" 
              className="text-primary hover:underline font-medium"
            >
              Contact our support team
            </a>
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
}
