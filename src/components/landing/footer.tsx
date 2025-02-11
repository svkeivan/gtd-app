import Link from "next/link";

const footerSections = [
  {
    title: "Company",
    links: [
      { text: "About", href: "#" },
      { text: "Careers", href: "#" },
      { text: "Blog", href: "#" },
      { text: "Press", href: "#" }
    ]
  },
  {
    title: "Product",
    links: [
      { text: "Features", href: "#" },
      { text: "Pricing", href: "#" },
      { text: "Security", href: "#" },
      { text: "Enterprise", href: "#" }
    ]
  },
  {
    title: "Resources",
    links: [
      { text: "Documentation", href: "#" },
      { text: "Help Center", href: "#" },
      { text: "Community", href: "#" },
      { text: "Contact", href: "#" }
    ]
  },
  {
    title: "Legal",
    links: [
      { text: "Privacy", href: "#" },
      { text: "Terms", href: "#" },
      { text: "Cookie Policy", href: "#" },
      { text: "Licenses", href: "#" }
    ]
  }
];

export function Footer() {
  return (
    <footer className="py-12 bg-muted/50">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link 
                      href={link.href} 
                      className="text-muted-foreground hover:text-primary"
                    >
                      {link.text}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t">
          <div className="text-muted-foreground mb-4 md:mb-0">
            © 2025 Planito. All rights reserved.
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              Twitter
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              LinkedIn
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
