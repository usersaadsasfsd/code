import type { Metadata } from "next"
import { Mail, Phone, MapPin, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"

export const metadata: Metadata = {
  title: "Contact Us | CountryRoof Marketplace",
  description: "Get in touch with CountryRoof support. We respond within 24 hours to all inquiries.",
  openGraph: {
    title: "Contact Us | CountryRoof",
    description: "Contact our support team for assistance with properties, listings, or marketplace support.",
    url: "https://countryroof.com/contact",
  },
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* Hero */}
        <section className="w-full py-12 md:py-16 px-4 bg-primary/5 border-b border-border">
          <div className="max-w-4xl mx-auto space-y-3">
            <h1 className="text-primary">Contact Us</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl">
              Have questions? Our support team is here to help. Reach out and we'll respond within 24 hours.
            </p>
          </div>
        </section>

        {/* Contact Info & Form */}
        <section className="w-full py-12 md:py-16 px-4">
          <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-4">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">Get In Touch</h3>
                <p className="text-xs text-muted-foreground">Multiple ways to reach our support team</p>
              </div>

              <div className="space-y-3">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Phone size={14} className="text-primary" />
                    <p className="text-xs font-semibold text-foreground">Phone</p>
                  </div>
                  <a href="tel:+919876543210" className="text-xs text-primary hover:underline block">
                    +91 (98) 765-43210
                  </a>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Mail size={14} className="text-primary" />
                    <p className="text-xs font-semibold text-foreground">Email</p>
                  </div>
                  <a href="mailto:support@countryroof.com" className="text-xs text-primary hover:underline block">
                    support@countryroof.com
                  </a>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-primary" />
                    <p className="text-xs font-semibold text-foreground">Address</p>
                  </div>
                  <p className="text-xs text-muted-foreground">123 Business Avenue, Tech City, TC 12345, India</p>
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-primary" />
                    <p className="text-xs font-semibold text-foreground">Business Hours</p>
                  </div>
                  <div className="text-xs text-muted-foreground space-y-0.5">
                    <p>Mon - Fri: 9:00 AM - 6:00 PM IST</p>
                    <p>Sat: 10:00 AM - 4:00 PM IST</p>
                    <p>Sun: Closed</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="md:col-span-2">
              <form className="space-y-3 bg-card border border-border rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Name</label>
                    <input
                      type="text"
                      placeholder="Your name"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground block mb-1">Email</label>
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="How can we help?"
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground block mb-1">Message</label>
                  <textarea
                    placeholder="Tell us more..."
                    rows={5}
                    className="w-full px-3 py-2 text-sm border border-border rounded-md bg-input focus:outline-none focus:ring-1 focus:ring-ring resize-none"
                  ></textarea>
                </div>

                <Button className="w-full text-xs h-8">Send Message</Button>
              </form>
            </div>
          </div>
        </section>

        {/* Why Choose */}
        <section className="w-full py-12 md:py-16 px-4 bg-muted/30 border-t border-border">
          <div className="max-w-4xl mx-auto space-y-4">
            <h2>Why Contact CountyRoof?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { title: "Expert Support", desc: "Knowledgeable team available to assist" },
                { title: "24-Hour Response", desc: "Quick turnaround on all inquiries" },
                { title: "Property Guidance", desc: "Free advice on buying and selling" },
              ].map((item, idx) => (
                <div key={idx} className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground">{item.title}</h3>
                  <p className="text-xs text-muted-foreground">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
