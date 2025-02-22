import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { landing } from "@/lib/translations/landing";

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

export function FaqSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">{landing["faq.title"]}</h2>
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
