// Database collection names
export const COLLECTIONS = {
  USERS: "users",
  PROPERTIES: "properties",
  STATES: "states",
  CATEGORIES: "categories",
  AMENITIES: "amenities",
  DEVELOPERS: "developers", // Added DEVELOPERS collection
  FACILITIES: "facilities",
  REVIEWS: "reviews",
  TICKETS: "tickets",
  NEWS: "news",
}

// User types
export type UserType = "buyer" | "seller" | "agent" | "admin"

export interface User {
  _id?: string
  username: string
  email: string
  password: string
  phone_number: string
  user_type: UserType
  profile_picture?: string
  date_joined: Date
  last_login?: Date
  is_verified?: boolean
}

export interface Property {
  _id?: string
  property_type: string
  property_name: string
  slug: string
  short_description: string
  long_description: string
  status: "available" | "sold" | "rented"
  lowest_price: number
  max_price: number
  area_sqft: number
  bedrooms: number
  bathrooms: number
  garage: number
  garage_size?: number
  address: string
  city: string
  state: string
  postal_code: string
  property_size: number
  property_video?: string
  neighborhood: string
  builder?: string
  possession: string
  latitude: number
  longitude: number
  rera_no?: string
  availability_status: "available" | "pending" | "sold"
  is_featured: boolean
  is_hot: boolean
  agent: string
  amenities: string[]
  facilities: string[]
  main_thumbnail: string
  main_banner: string
  multiple_images: string[]
  meta_title: string
  meta_keywords: string
  meta_description: string
  created_at: Date
  updated_at: Date
}

export interface State {
  _id?: string
  name: string
  slug: string
}

export interface Category {
  _id?: string
  name: string
  slug: string
  icon_class: string
}

export interface Amenities {
  _id?: string
  name: string
  icon_class: string
}

export interface Builder {
  _id?: string
  name: string
  slug: string
  logo?: string
}

export interface Facilities {
  _id?: string
  name: string
  icon_class: string
}

export interface Review {
  _id?: string
  property: string
  user: string
  rating: number
  comment: string
  is_approved: boolean
  created_at: Date
}

export interface Ticket {
  _id?: string
  user: string
  subject: string
  description: string
  priority: "low" | "medium" | "high"
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: Date
  updated_at: Date
}

export interface News {
  _id?: string
  title: string
  slug: string
  content: string
  author: string
  publication_date: Date
  is_published: boolean
  cover_image: string
  meta_title?: string
  meta_description?: string
  created_at: Date
  updated_at: Date
}
