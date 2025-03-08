import { Badge } from "@/components/ui/badge";
import { landing } from "@/lib/translations/landing";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import Image from "next/image";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: landing["socialProof.productManager"],
    quote: landing["socialProof.productManager.quote"],
    avatar: "/testimonials/sarah.jpg",
    company: "/companies/company1.svg"
  },
  {
    name: "Ali Reza",
    role: landing["socialProof.researcher"],
    quote: landing["socialProof.researcher.quote"],
    avatar: "/testimonials/ali.jpg",
    company: "/companies/company2.svg"
  },
  {
    name: "Michael Chen",
    role: landing["socialProof.entrepreneur"],
    quote: landing["socialProof.entrepreneur.quote"],
    avatar: "/testimonials/michael.jpg",
    company: "/companies/company3.svg"
  }
];

const trustBadges = [
  {
    text: landing["socialProof.featuredInProductHunt"],
    icon: "/badges/product-hunt.svg"
  },
  {
    text: landing["socialProof.rating"],
    icon: "/badges/star.svg"
  },
  {
    text: landing["socialProof.isoCertified"],
    icon: "/badges/iso.svg"
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

export function SocialProofSection() {
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
          <h2 className="text-3xl font-bold mb-4">{landing["socialProof.title"]}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Join thousands of satisfied users who have transformed their productivity.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <motion.div key={index} variants={itemVariants}>
              <Card className="p-6 h-full hover:shadow-xl transition-shadow duration-300 relative group">
                {/* Quote mark decoration */}
                <div className="absolute top-6 right-6 text-6xl text-primary/10 font-serif">
                  "
                </div>

                <div className="relative z-10">
                  <motion.div 
                    className="flex items-center gap-4 mb-6"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="relative w-12 h-12 rounded-full overflow-hidden">
                      <Image
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div>
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </motion.div>

                  <p className="text-muted-foreground mb-6 relative">
                    "{testimonial.quote}"
                  </p>

                  <div className="mt-auto">
                    <Image
                      src={testimonial.company}
                      alt="Company logo"
                      width={120}
                      height={30}
                      className="opacity-50 group-hover:opacity-100 transition-opacity duration-300"
                    />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        <motion.div 
          className="flex flex-wrap justify-center gap-6"
          variants={itemVariants}
        >
          {trustBadges.map((badge, index) => (
            <motion.div
              key={index}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Badge 
                variant="secondary" 
                className="text-lg py-2 px-4 flex items-center gap-2 shadow-lg hover:shadow-xl transition-shadow duration-300"
              >
                <Image
                  src={badge.icon}
                  alt=""
                  width={20}
                  height={20}
                  className="opacity-70"
                />
                {badge.text}
              </Badge>
            </motion.div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
