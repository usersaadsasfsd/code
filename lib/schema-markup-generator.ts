// Schema Markup Generators for SEO

export function generateBlogSchema(post: any, authorName: string) {
  return {
    "@context": "https://schema.org",
    "@type": post.schema_markup?.article_type || "BlogPosting",
    headline: post.title,
    description: post.meta_description || post.excerpt,
    image: post.banner_image || post.cover_image,
    datePublished: post.publication_date,
    dateModified: post.updated_at || post.publication_date,
    author: {
      "@type": "Person",
      name: authorName,
    },
    publisher: {
      "@type": "Organization",
      name: "CountryRoof",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `https://countryroof.com/blog/${post.slug}`,
    },
  }
}

export function generatePropertySchema(property: any) {
  return {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: property.property_name,
    description: property.long_description || property.short_description,
    image: [property.main_banner, ...(property.multiple_images || [])],
    address: {
      "@type": "PostalAddress",
      streetAddress: property.address,
      addressLocality: property.city,
      addressRegion: property.state,
      postalCode: property.postal_code,
      addressCountry: "IN",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: property.latitude,
      longitude: property.longitude,
    },
    priceCurrency: "INR",
    price: `${property.lowest_price}-${property.max_price}`,
    priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    availability: property.status === "active" ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    numberOfRooms: property.bedrooms,
    numberOfBathroomsUnitComplete: property.bathrooms,
    floorSize: {
      "@type": "QuantitativeValue",
      value: property.area_sqft,
      unitCode: "FTK",
    },
    amenityFeature: [
      ...(property.amenities || []).map((amenity: string) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
      })),
      ...(property.luxury_amenities || []).map((amenity: string) => ({
        "@type": "LocationFeatureSpecification",
        name: amenity,
      })),
    ],
  }
}

export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: "CountryRoof",
    url: "https://countryroof.com",
    logo: "/logo.png",
    description: "Premium property marketplace connecting buyers, sellers, and agents",
    sameAs: [
      "https://www.facebook.com/countryroof",
      "https://www.twitter.com/countryroof",
      "https://www.instagram.com/countryroof",
    ],
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "Customer Service",
      availableLanguage: "en",
    },
  }
}
