"use client"

import type React from "react"
import Image from "next/image"
import Link from "next/link"
import { useState } from "react"
import { Phone, Mail, ChevronDown, Send } from "lucide-react"

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({})
  const [formData, setFormData] = useState({ name: "", phone: "", message: "" })
  const [formSubmitted, setFormSubmitted] = useState(false)

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }))
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setFormSubmitted(true)
    setTimeout(() => {
      setFormData({ name: "", phone: "", message: "" })
      setFormSubmitted(false)
    }, 3000)
  }

  const quickLinks = [
    { name: "Home", href: "/" },
    { name: "About Us", href: "/about" },
    { name: "Our Services", href: "/services" },
    { name: "Luxury Properties", href: "/properties?category=luxury" },
    { name: "Blog", href: "/blog" },
    { name: "Career", href: "/career" },
    { name: "Contact", href: "/contact" },
  ]

  const primeLocations = [
    "Projects on Sohna Road",
    "Projects on Golf Course",
    "Projects on Dwarka Expressway",
    "Projects on New Gurgaon",
    "Projects on Southern Peripheral Road",
    "Projects on Golf Course Extn Road",
  ]

  const propertyTypes = [
    "1 BHK Flats in Gurgaon",
    "2 BHK Flats in Gurgaon",
    "3 BHK Flats in Gurgaon",
    "4 BHK Flats in Gurgaon",
    "5 BHK Flats in Gurgaon",
    "Fully Furnished Flats in Gurgaon",
  ]

  const toolsServices = [
    { name: "EMI Calculator", href: "#" },
    { name: "QR Generator", href: "#" },
    { name: "Gurugram Master Plan 2031", href: "#" },
    { name: "Privacy Policy", href: "#" },
    { name: "Terms & Conditions", href: "#" },
    { name: "Disclaimer", href: "#" },
  ]

  const FooterSection = ({
    title,
    items,
    sectionKey,
  }: { title: string; items: string[] | { name: string; href: string }[]; sectionKey: string }) => {
    const isExpanded = expandedSections[sectionKey]

    return (
      <div className="border-b border-gray-200 md:border-b-0">
        <button
          onClick={() => toggleSection(sectionKey)}
          className="w-full md:w-auto flex items-center justify-between md:justify-start gap-2 py-3 md:py-0 text-sm font-semibold text-[#002366] hover:text-red-500 transition-colors"
        >
          {title}
          <ChevronDown size={16} className={`md:hidden transition-transform ${isExpanded ? "rotate-180" : ""}`} />
        </button>

        <ul
          className={`space-y-1.5 overflow-hidden transition-all duration-300 md:block ${isExpanded ? "max-h-96" : "max-h-0 md:max-h-96"}`}
        >
          {items.map((item, idx) => {
            const linkText = typeof item === "string" ? item : item.name
            const href = typeof item === "string" ? "#" : item.href

            return (
              <li key={idx} className="pt-2 md:pt-0">
                <Link href={href} className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                  {linkText}
                </Link>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }

  return (
    <footer className="w-full bg-gradient-to-b from-gray-50 to-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">

        {/* Top Section: Contact & Unique Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16 pb-12 border-b border-gray-200">
          {/* Company Info */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-[#002366] mb-4">About Country Roof</h2>
              <p className="text-sm text-gray-600 leading-relaxed max-w-sm">
                Real Estate Company specializes in providing premier property solutions tailored to meet your needs. We
                offer world-class luxury homes with stylish design, premium features, and top-class amenities for a
                truly exclusive lifestyle.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002366] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-white" />
                </div>
                <a href="tel:+918500900100" className="text-sm text-gray-700 hover:text-red-500 transition-colors">
                  +91 8500-900-100
                </a>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-[#002366] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Mail size={18} className="text-white" />
                </div>
                <a
                  href="mailto:info@countryroof.com"
                  className="text-sm text-gray-700 hover:text-red-500 transition-colors"
                >
                  info@countryroof.com
                </a>
              </div>
            </div>
          </div>

          {/* Unique Enquiry Form */}
          <div className="bg-gradient-to-br from-[#002366] to-[#003d99] rounded-2xl p-8 text-white shadow-lg">
            <h3 className="text-xl font-bold mb-2">Get Instant Callback</h3>
            <p className="text-sm text-blue-100 mb-6">
              Get expert advice on your property investment. Our team will contact you within 30 minutes.
            </p>

            {formSubmitted ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-16 h-16 bg-green-400 rounded-full flex items-center justify-center mb-4">
                  <Send size={28} className="text-white" />
                </div>
                <p className="text-lg font-semibold mb-1">Thank you!</p>
                <p className="text-sm text-blue-100">We'll contact you soon</p>
              </div>
            ) : (
              <form onSubmit={handleFormSubmit} className="space-y-4">
                <div>
                  <input
                    type="text"
                    placeholder="Your Name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <div>
                  <input
                    type="tel"
                    placeholder="Phone Number"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                    className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-blue-100 text-sm focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center gap-2"
                >
                  <span>Get Callback</span>
                  <Send size={16} />
                </button>
                <p className="text-xs text-blue-100 text-center">Get expert advice on your property investment.</p>
              </form>
            )}
          </div>
        </div>

        {/* Links Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* Quick Links */}
          <div>
            <FooterSection title="Quick Links" items={quickLinks} sectionKey="quickLinks" />
          </div>

          {/* Prime Locations */}
          <div>
            <FooterSection title="Prime Locations" items={primeLocations} sectionKey="primeLocations" />
          </div>

          {/* Property Types */}
          <div>
            <FooterSection title="Property Types" items={propertyTypes} sectionKey="propertyTypes" />
          </div>

          {/* Tools & Services */}
          <div>
            <FooterSection title="Tools & Services" items={toolsServices} sectionKey="toolsServices" />
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-gray-200 pt-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-gray-600 text-center md:text-left">
              © {currentYear} countryroof.com All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <Link href="#" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Privacy Policy
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Terms & Conditions
              </Link>
              <Link href="#" className="text-xs text-gray-600 hover:text-red-500 transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
