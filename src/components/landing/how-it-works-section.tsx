const steps = [
  {
    number: 1,
    title: "Capture",
    description: "Quickly capture tasks and ideas"
  },
  {
    number: 2,
    title: "Organize",
    description: "Automatically sort into projects and contexts"
  },
  {
    number: 3,
    title: "Review",
    description: "Regular reviews keep you on track"
  },
  {
    number: 4,
    title: "Take Action",
    description: "Focus on what matters most"
  }
];

export function HowItWorksSection() {
  return (
    <section className="py-24 bg-primary/5">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-16">How It Works</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">{step.number}</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
