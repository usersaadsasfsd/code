const steps = [
  { title: "Search", description: "Browse thousands of verified listings" },
  { title: "Connect", description: "Message agents and property owners directly" },
  { title: "Schedule", description: "Book property tours at your convenience" },
  { title: "Transact", description: "Secure, transparent transactions" },
]

export default function HowItWorks() {
  return (
    <section className="w-full py-12 md:py-16 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2>How It Works</h2>
          <p className="text-muted-foreground text-sm md:text-base">Simple, transparent, secure</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {steps.map((step, idx) => (
            <div key={step.title} className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-8 w-8 rounded-full bg-primary text-primary-foreground text-xs font-bold">
                  {idx + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-foreground">{step.title}</h3>
                <p className="text-xs text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
