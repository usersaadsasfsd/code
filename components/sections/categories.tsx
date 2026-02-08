import Link from "next/link"
import { Home, Building2, Landmark, Trees } from "lucide-react"

const categories = [
  { name: "Houses", icon: Home, count: "450+" },
  { name: "Apartments", icon: Building2, count: "380+" },
  { name: "Commercial", icon: Landmark, count: "120+" },
  { name: "Land", icon: Trees, count: "95+" },
]

export default function Categories() {
  return (
    <section className="w-full py-12 md:py-16 px-4 border-t border-border">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="space-y-2">
          <h2>Browse by Category</h2>
          <p className="text-muted-foreground text-sm md:text-base">Find properties that match your needs</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {categories.map((category) => {
            const Icon = category.icon
            return (
              <Link
                key={category.name}
                href={`/properties?category=${category.name.toLowerCase()}`}
                className="bg-card border border-border rounded-lg p-4 hover:border-primary hover:bg-primary/5 transition-all text-center"
              >
                <Icon size={24} className="mx-auto mb-2 text-primary hover:scale-110 transition-transform" />
                <h3 className="text-sm font-semibold text-foreground">{category.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">{category.count}</p>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
