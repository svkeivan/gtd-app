import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { landing } from "@/lib/translations/landing";
import { motion } from "framer-motion";

interface HeroSectionProps {
  isLoggedIn?: boolean;
}

export function HeroSection({ isLoggedIn }: HeroSectionProps) {
  return (
    <section className="relative bg-gradient-to-b from-primary/10 to-background pt-24 pb-32 overflow-hidden">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto px-4"
      >
        <div className="flex flex-col items-center text-center lg:text-left lg:flex-row lg:justify-between lg:gap-12">
          <motion.div 
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="max-w-2xl lg:w-1/2"
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl mb-6 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {landing["hero.header"]}
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {landing["hero.description"]}
            </p>
            <motion.div 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8"
            >
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg shadow-lg"
              >
                <div className="text-2xl font-bold text-primary">50%</div>
                <div className="text-sm text-muted-foreground">{landing["hero.lessTime"]}</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg shadow-lg"
              >
                <div className="text-2xl font-bold text-primary">30%</div>
                <div className="text-sm text-muted-foreground">{landing["hero.higherCompletion"]}</div>
              </motion.div>
              <motion.div 
                whileHover={{ scale: 1.05 }}
                className="text-center p-4 bg-background/50 backdrop-blur-sm rounded-lg shadow-lg"
              >
                <div className="text-2xl font-bold text-primary">1000+</div>
                <div className="text-sm text-muted-foreground">{landing["hero.productiveUsers"]}</div>
              </motion.div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.6, duration: 0.6 }}
              className="flex flex-col sm:flex-row gap-4"
            >
              {isLoggedIn ? (
                <Link href="/dashboard" className="w-full sm:w-auto">
                  <Button size="lg" className="w-full">{landing["hero.goToDashboard"]}</Button>
                </Link>
              ) : (
                <>
                  <Link href="/register" className="w-full sm:w-auto">
                    <Button size="lg" className="w-full relative overflow-hidden group">
                      <span className="relative z-10">{landing["hero.startFreeTrial"]}</span>
                      <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/40 transform translate-x-full group-hover:translate-x-0 transition-transform duration-300" />
                    </Button>
                  </Link>
                  <Button variant="outline" size="lg" className="w-full sm:w-auto group">
                    <span className="group-hover:scale-105 transition-transform duration-200 inline-block">
                      {landing["hero.watchDemo"]}
                    </span>
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
          
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="hidden lg:block lg:w-1/2"
          >
            <div className="relative">
              <motion.div
                animate={{ 
                  rotate: [0, 2, 0, -2, 0],
                  y: [0, -5, 0, -5, 0]
                }}
                transition={{ 
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
                className="relative z-10"
              >
                <Image
                  src="/hero-dashboard.png"
                  alt="Task Management Dashboard"
                  width={600}
                  height={400}
                  className="rounded-xl shadow-2xl"
                  priority
                />
              </motion.div>
              <div className="absolute -top-4 -right-4 w-full h-full bg-primary/10 rounded-xl" />
              <div className="absolute -bottom-4 -left-4 w-full h-full bg-primary/5 rounded-xl" />
            </div>
          </motion.div>
        </div>
      </motion.div>
      
      {/* Decorative elements */}
      <div className="absolute top-0 left-0 w-full overflow-hidden">
        <svg className="relative w-full h-20" preserveAspectRatio="none" viewBox="0 0 1440 54">
          <path
            fill="currentColor"
            fillOpacity="0.05"
            d="M0 22L120 16.7C240 11 480 1.00001 720 0.700012C960 1.00001 1200 11 1320 16.7L1440 22V54H1320C1200 54 960 54 720 54C480 54 240 54 120 54H0V22Z"
          />
        </svg>
      </div>
    </section>
  );
}
