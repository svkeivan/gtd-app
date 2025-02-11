import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: "How is this different from other task managers?",
    answer: "Our app is built specifically around GTD principles with intelligent task organization, multi-language support including Farsi, and Shamsi calendar integration. We focus on reducing friction in your workflow while maintaining flexibility."
  },
  {
    question: "Can I import data from other tools?",
    answer: "Yes! We support importing from popular task managers and productivity tools. Our import wizard will help you migrate your data seamlessly."
  },
  {
    question: "Is my data secure?",
    answer: "We take security seriously. Your data is encrypted both in transit and at rest, and we're ISO 27001 certified. We never share your data with third parties."
  },
  {
    question: "What happens after the trial?",
    answer: "After your 14-day trial, you can choose to upgrade to one of our paid plans or continue with a limited free account. We'll notify you before your trial ends."
  },
  {
    question: "Do you offer support?",
    answer: "Yes! All users have access to our help center and community forums. Professional and Enterprise plans include priority email support and dedicated account management."
  },
  {
    question: "Can I use it on mobile?",
    answer: "Yes! We have native mobile apps for iOS and Android, providing a seamless experience across all your devices. Your data syncs automatically in real-time."
  }
];

export function FaqSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Frequently Asked Questions</h2>
        <div className="max-w-3xl mx-auto">
          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger>{item.question}</AccordionTrigger>
                <AccordionContent>{item.answer}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
}
