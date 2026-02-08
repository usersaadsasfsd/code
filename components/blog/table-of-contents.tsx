"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface TocItem {
  id: string
  text: string
  level: number
}

interface TableOfContentsProps {
  content: string
}

export default function TableOfContents({ content }: TableOfContentsProps) {
  const [toc, setToc] = useState<TocItem[]>([])

  useEffect(() => {
    // Parse HTML content to extract headings
    const parser = new DOMParser()
    const doc = parser.parseFromString(content, "text/html")
    const headings = doc.querySelectorAll("h1, h2, h3, h4, h5, h6")

    const tocItems: TocItem[] = []
    headings.forEach((heading, index) => {
      const level = Number.parseInt(heading.tagName.substring(1))
      const text = heading.textContent || ""
      const id = `heading-${index}`

      // Add ID to heading for linking
      heading.id = id

      tocItems.push({ id, text, level })
    })

    setToc(tocItems)
  }, [content])

  if (toc.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Table of Contents</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground">
            No headings found. Add H1, H2, or H3 headings to generate a table of contents.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">Table of Contents</CardTitle>
      </CardHeader>
      <CardContent>
        <nav className="space-y-1">
          {toc.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              className="block text-xs hover:text-primary transition-colors py-1"
              style={{ paddingLeft: `${(item.level - 1) * 12}px` }}
            >
              <span className="text-muted-foreground mr-2">
                {item.level === 1 ? "•" : item.level === 2 ? "◦" : "▪"}
              </span>
              {item.text}
            </a>
          ))}
        </nav>
        <div className="mt-4 pt-4 border-t border-border">
          <div className="text-xs text-muted-foreground space-y-1">
            <p className="font-medium">Content Structure:</p>
            <p>H1: {toc.filter((t) => t.level === 1).length} sections</p>
            <p>H2: {toc.filter((t) => t.level === 2).length} subsections</p>
            <p>H3: {toc.filter((t) => t.level === 3).length} details</p>
            <p className="pt-2 font-medium">Total headings: {toc.length}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
