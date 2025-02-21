import { persian } from "@/lib/persian";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqItems = [
  {
    question: persian["faq.question1"],
    answer: persian["faq.answer1"]
  },
  {
    question: persian["faq.question2"],
    answer: persian["faq.answer2"]
  },
  {
    question: persian["faq.question3"],
    answer: persian["faq.answer3"]
  },
  {
    question: persian["faq.question4"],
    answer: persian["faq.answer4"]
  },
  {
    question: persian["faq.question5"],
    answer: persian["faq.answer5"]
  },
  {
    question: persian["faq.question6"],
    answer: persian["faq.answer6"]
  }
];

export function FaqSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">{persian["faq.title"]}</h2>
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
