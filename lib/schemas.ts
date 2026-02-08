import type { ObjectId } from "mongodb"

// User Model
export interface User {
  _id?: ObjectId
  username: string
  email: string
  password: string
  phone_number?: string
  user_type: "customer" | "agent" | "admin"
  profile_picture?: string
  date_joined: Date
  last_login?: Date
}

// Property Model
export interface Property {
  _id?: ObjectId

  // Core Identity Fields
  listing_type?: "builder_project" | "resale" | "rental" | "new"
  property_category?: "residential" | "commercial" | "mixed_use"
  property_type: string // apartment, villa, plot, shop, sco, office, warehouse
  property_name: string // Required
  slug: string
  developer_name?: string
  brand_collection?: string
  project_status?: "launched" | "under_construction" | "ready_to_move"
  possession_year_quarter?: string
  target_segment?: "luxury" | "premium" | "mid" | "affordable"
  unit_status?: "vacant" | "occupied" | "leased"
  age_of_property?: number

  rera_registered?: boolean
  rera_id?: string
  rera_website_link?: string
  rera_no?: string
  license_no?: string
  bank_approvals?: string[]
  oc_cc_status?: string

  // Location with enhanced fields
  country?: string
  address: string
  city: string
  state: string
  postal_code: string
  property_size: string

  // Nearby places (repeatable)
  nearby?: Array<{
    category: "school" | "hospital" | "metro" | "airport" | "highway" | "market" | "workplace"
    name: string
    distance: string
  }>
  google_map_link?: string

  // Configurations (repeatable for builder projects)
  configurations?: Array<{
    type: string // e.g., "3BHK", "4BHK", "Studio"
    super_area_min?: number
    super_area_max?: number
    carpet_area_min?: number
    carpet_area_max?: number
    built_up_area?: number
    unit_count?: number
    base_price_range?: string
    price_per_sqft?: number
    availability: "available" | "sold_out" | "enquire"
    floor_plan_image?: string
    virtual_plan_link?: string
  }>

  // Individual Unit Details
  bhk_configuration?: string
  tower_name?: string
  unit_no?: string
  carpet_area?: number
  built_up_area?: number
  super_area?: number
  direction_facing?: "north" | "south" | "east" | "west" | "north_east" | "north_west" | "south_east" | "south_west"
  balconies_count?: number

  // Pricing with enhanced fields
  price_range?: string
  booking_amount?: number
  payment_plan?: "clp" | "possession_linked" | "down_payment" | "custom"
  taxes_included?: boolean
  additional_charges?: {
    maintenance?: number
    plc?: number
    club?: number
    parking?: number
    registry?: number
    stamp_duty?: number
  }
  offers_discounts?: string

  // Rental pricing
  monthly_rent?: number
  security_deposit?: number
  lock_in_period?: string
  maintenance_charge?: number
  negotiable?: boolean
  all_inclusive?: boolean

  // Tower & Master Data
  total_towers?: number
  total_units?: number
  floors_per_tower?: number
  total_acreage?: string
  open_area_percentage?: number
  clubhouse_size?: string

  // Enhanced Amenities (categorized)
  amenities_lifestyle?: string[]
  amenities_outdoor?: string[]
  amenities_security?: string[]
  amenities_utilities?: string[]

  // Specifications
  specifications?: {
    flooring_living?: string
    flooring_bedrooms?: string
    flooring_kitchen?: string
    flooring_toilet?: string
    fittings_bathroom_brand?: string
    fittings_kitchen_brand?: string
    kitchen_type?: string
    kitchen_counter_material?: string
    ceiling_height?: string
    doors_windows_material?: string
    air_conditioning?: "split" | "vrv" | "vrf" | "none"
    smart_home_features?: string[]
  }

  // Unit Features
  unit_features?: {
    modular_kitchen?: boolean
    wardrobes?: boolean
    acs?: boolean
    home_automation?: boolean
    servant_room?: boolean
    study_room?: boolean
    staff_bathroom?: boolean
    terrace?: boolean
    exclusive_garden?: boolean
  }

  // Ownership & Documents
  owner_type?: "owner" | "agent" | "builder"
  ownership_type?: "freehold" | "leasehold" | "gpa" | "coop"
  agreement_ready?: boolean
  loan_available?: boolean
  documents?: string[]

  project_images?: string[]
  floor_plans?: string[]
  master_plan?: string
  brochure_pdf?: string
  walkthrough_video?: string
  drone_video?: string
  main_thumbnail: string // Required
  main_banner: string
  multiple_images: string[]
  property_video?: string
  neighborhood?: string
  builder?: ObjectId
  possession: string
  possession_type?: "ready" | "under_construction" | "resale"
  possession_date?: string
  furnished_type?: "unfurnished" | "semi_furnished" | "fully_furnished"
  floor_number?: number
  total_floors?: number
  latitude: number
  longitude: number
  schema_markup?: {
    property_type: string
    price_currency: string
    availability: string
    condition: string
    rooms: number
  }
  seo_keywords: string[]
  internal_links?: string[]
  created_at: Date
  updated_at: Date

  sales_contact?: {
    manager_name?: string
    phone?: string
    whatsapp?: string
    email?: string
    callback_number?: string
    site_visit_booking?: boolean
    channel_partner_allowed?: boolean
  }

  // Lead Contact
  lead_contact?: {
    name?: string
    number?: string
    secondary_phone?: string
    whatsapp?: string
    email?: string
    preferred_call_time?: string
    mask_number?: boolean
  }

  developer_id?: ObjectId
}

// State Model
export interface State {
  _id?: ObjectId
  name: string
  slug: string
}

// Category Model
export interface Category {
  _id?: ObjectId
  name: string
  slug: string
  icon_class: string
}

// Amenities Model
export interface Amenities {
  _id?: ObjectId
  name: string
  icon_class: string
}

// Builder Model
export interface Builder {
  _id?: ObjectId
  name: string
  slug: string
  logo?: string
}

// Facilities Model
export interface Facilities {
  _id?: ObjectId
  name: string
  icon_class: string
}

// Reviews Model
export interface Review {
  _id?: ObjectId
  property: ObjectId
  user: ObjectId
  rating: number
  comment: string
  is_approved: boolean
  created_at: Date
}

// Tickets Model
export interface Ticket {
  _id?: ObjectId
  user: ObjectId
  subject: string
  description: string
  priority: "low" | "medium" | "high" | "critical"
  status: "open" | "in_progress" | "resolved" | "closed"
  created_at: Date
  updated_at: Date
}

// News Model
export interface News {
  _id?: ObjectId
  title: string
  slug: string
  content: string
  excerpt: string
  author: ObjectId
  category: string
  tags: string[]
  featured_image?: string
  banner_image?: string
  cover_image?: string
  published: boolean
  publication_date: Date
  meta_title: string
  meta_description: string
  meta_keywords: string[]
  canonical_url?: string
  og_title?: string
  og_description?: string
  og_image?: string
  twitter_card?: string
  read_time?: number
  word_count?: number
  schema_markup?: {
    article_type: "BlogPosting" | "NewsArticle"
    author_name: string
    publication_date: string
    image_url: string
  }
  internal_links?: string[]
  related_posts?: ObjectId[]
  seo_keywords: string[]
  created_at: Date
  updated_at: Date
}

// SectionProperty Model
export interface SectionProperty {
  _id?: ObjectId
  section_id: ObjectId
  property_id: ObjectId
  position: number
  added_at: Date
}

// HomepageSection Model
export interface HomepageSection {
  _id?: ObjectId
  name: string
  section_type:
    | "handpicked"
    | "trending_tabs"
    | "new_launches"
    | "luxury"
    | "developers"
    | "affordable"
    | "sco"
    | "iconic"
    | "plots"
    | "commercial"
    | "spotlight"
    | "investment"
    | "budget"
    | "builders"
  title: string
  subtitle?: string
  description?: string
  display_limit: number
  sort_order: number
  is_active: boolean
  property_ids: ObjectId[]
  filters?: {
    category?: string
    state?: string
    is_featured?: boolean
    is_hot?: boolean
    property_type?: string
  }
  tabs?: {
    name: string
    filter_key: string
    label: string
  }[]
  created_at: Date
  updated_at: Date
}

// Developer Model
export interface Developer {
  _id?: ObjectId
  name: string
  slug: string
  logo_url: string
  project_count: number
  description?: string
  website?: string
  created_at: Date
  updated_at: Date
}

// SEO Page Settings Model
export interface SEOPageSettings {
  _id?: ObjectId
  page_path: string
  page_type: "static" | "property" | "developer" | "location" | "blog"
  page_title: string
  meta_description: string
  meta_keywords?: string
  og_title?: string
  og_description?: string
  og_image?: string
  canonical_url?: string
  robots_meta?: string
  schema_markup?: Record<string, any>
  updated_at: Date
}

// Location Model
export interface Location {
  _id?: ObjectId
  name: string
  slug: string
  type: "city" | "area" | "neighborhood" | "region"
  parent_location?: ObjectId
  state?: string
  city?: string
  description?: string
  featured_image?: string
  meta_title?: string
  meta_description?: string
  schema_markup?: Record<string, any>
  is_featured?: boolean
  property_count?: number
  latitude?: number
  longitude?: number
  created_at: Date
  updated_at: Date
}
