"use client";

import { useEffect, useState } from "react";

interface Property {
  property_name: string;
  short_description: string;
  main_thumbnail: string;
  city: string;
  state: string;
  price_range: string;
  property_type: string;
  long_description: string;
}
import { useParams } from "next/navigation";

export default function PropertyPreviewPage() {
  const { slug } = useParams(); // Use slug instead of id
  const [property, setProperty] = useState<Property | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const res = await fetch(`/api/properties/slug/${slug}`); // Fetch by slug
        if (res.ok) {
          const data = await res.json();
          setProperty(data);
        } else {
          console.error("Failed to fetch property details");
        }
      } catch (error) {
        console.error("Error fetching property details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [slug]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!property) {
    return <div>Property not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h1 className="text-3xl font-bold">{property.property_name}</h1>
      <p className="text-muted-foreground">{property.short_description}</p>
      <div className="mt-6">
        <img src={property.main_thumbnail} alt={property.property_name} className="w-full rounded-lg" />
      </div>
      <div className="mt-6 space-y-4">
        <p><strong>Location:</strong> {property.city}, {property.state}</p>
        <p><strong>Price:</strong> {property.price_range}</p>
        <p><strong>Type:</strong> {property.property_type}</p>
        <p><strong>Description:</strong> {property.long_description}</p>
      </div>
    </div>
  );
}
