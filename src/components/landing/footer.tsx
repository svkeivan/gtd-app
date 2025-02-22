import Link from "next/link";
import { landing } from "@/lib/translations/landing";

const footerSections = [
  {
    title: landing["footer.company"],
    links: [
      { text: landing["footer.about"], href: "#" },
      { text: landing["footer.careers"], href: "#" },
      { text: landing["footer.blog"], href: "#" },
      { text: landing["footer.press"], href: "#" }
    ]
  },
  {
    title: landing["footer.product"],
    links: [
      { text: landing["footer.features"], href: "#" },
      { text: landing["footer.pricing"], href: "#" },
      { text: landing["footer.security"], href: "#" },
      { text: landing["footer.enterprise"], href: "#" }
    ]
  },
  {
    title: landing["footer.resources"],
    links: [
      { text: landing["footer.documentation"], href: "#" },
      { text: landing["footer.helpCenter"], href: "#" },
      { text: landing["footer.community"], href: "#" },
      { text: landing["footer.contact"], href: "#" }
    ]
  },
  {
    title: landing["footer.legal"],
    links: [
      { text: landing["footer.privacy"], href: "#" },
      { text: landing["footer.terms"], href: "#" },
      { text: landing["footer.cookiePolicy"], href: "#" },
      { text: landing["footer.licenses"], href: "#" }
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
            {landing["footer.copyright"]}
          </div>
          <div className="flex gap-4">
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {landing["footer.twitter"]}
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {landing["footer.linkedin"]}
            </Link>
            <Link href="#" className="text-muted-foreground hover:text-primary">
              {landing["footer.github"]}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
