import { Instagram, Linkedin } from "lucide-react";
import Link from "../ui/Link";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: "Product",
      links: [
        { label: "Features", href: "#features", type: "anchor" },
        { label: "Pricing", href: "#pricing", type: "anchor" },
        { label: "Dashboard", href: "/dashboard", type: "route" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", href: "#", type: "anchor" },
        { label: "Community", href: "#", type: "anchor" },
        { label: "Blog", href: "#", type: "anchor" },
      ],
    },
    {
      title: "Legal",
      links: [
        { label: "Privacy Policy", href: "#", type: "anchor" },
        { label: "Terms of Service", href: "#", type: "anchor" },
        { label: "Cookie Policy", href: "#", type: "anchor" },
      ],
    },
  ];

  const socialLinks = [
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer className="py-16 border-t border-slate-800">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-white">DumpIt</span>
            </div>
            <p className="text-gray-400 text-sm">
              Your personal vault for everything worth keeping.
            </p>
          </div>

          {/* Links */}
          {footerLinks.map((group, index) => (
            <div key={index}>
              <h4 className="text-white font-semibold mb-4">{group.title}</h4>
              <ul className="space-y-2">
                {group.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center pt-8 border-t border-slate-800">
          <p className="text-gray-400 text-sm mb-4 md:mb-0">
            © {currentYear} DumpIt. All rights reserved.
          </p>
          <div className="flex gap-4">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <a
                  key={index}
                  href={social.href}
                  aria-label={social.label}
                  className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center text-gray-400 hover:text-white hover:bg-slate-700 transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
