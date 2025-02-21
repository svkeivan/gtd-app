import { persian } from "@/lib/persian";
import Link from "next/link";

const footerSections = [
  {
    title: persian["footer.company"],
    links: [
      { text: persian["footer.about"], href: "#" },
      { text: persian["footer.careers"], href: "#" },
      { text: persian["footer.blog"], href: "#" },
      { text: persian["footer.press"], href: "#" }
    ]
  },
  {
    title: persian["footer.product"],
    links: [
      { text: persian["footer.features"], href: "#" },
      { text: persian["footer.pricing"], href: "#" },
      { text: persian["footer.security"], href: "#" },
      { text: persian["footer.enterprise"], href: "#" }
    ]
  },
  {
    title: persian["footer.resources"],
    links: [
      { text: persian["footer.documentation"], href: "#" },
      { text: persian["footer.helpCenter"], href: "#" },
      { text: persian["footer.community"], href: "#" },
      { text: persian["footer.contact"], href: "#" }
    ]
  },
  {
    title: persian["footer.legal"],
    links: [
      { text: persian["footer.privacy"], href: "#" },
      { text: persian["footer.terms"], href: "#" },
      { text: persian["footer.cookiePolicy"], href: "#" },
      { text: persian["footer.licenses"], href: "#" }
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
            {persian["footer.copyright"]}
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {persian["footer.twitter"]}
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {persian["footer.linkedin"]}
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {persian["footer.github"]}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
