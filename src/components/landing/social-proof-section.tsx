import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

const testimonials = [
  {
    name: "Sarah Johnson",
    role: "Product Manager",
    quote: "This GTD app has transformed how I manage multiple projects. The intelligent organization saves me hours every week."
  },
  {
    name: "Ali Reza",
    role: "Researcher",
    quote: "The Shamsi calendar integration and Farsi support make this the perfect tool for managing my academic work."
  },
  {
    name: "Michael Chen",
    role: "Entrepreneur",
    quote: "Finally, a GTD app that actually helps me stay organized without adding complexity to my workflow."
  }
];

const trustBadges = [
  "Featured in ProductHunt",
  "4.9/5 Rating",
  "ISO 27001 Certified"
];

export function SocialProofSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">Trusted by Productive People</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="p-6">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-muted" />
                <div>
                  <div className="font-semibold">{testimonial.name}</div>
                  <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                </div>
              </div>
              <p className="text-muted-foreground">
                "{testimonial.quote}"
              </p>
            </Card>
          ))}
        </div>
        <div className="flex justify-center gap-8 flex-wrap">
          {trustBadges.map((badge, index) => (
            <Badge key={index} variant="secondary" className="text-lg py-2 px-4">
              {badge}
            </Badge>
          ))}
        </div>
      </div>
    </section>
  );
}
