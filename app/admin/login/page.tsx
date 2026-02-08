import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminLoginForm from "@/components/forms/admin-login-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Login | CountyRoof",
  description: "Administrator login to manage CountyRoof marketplace.",
  robots: { index: false },
}

export default function AdminLoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-orange-100 mb-3">
                <span className="text-lg font-bold text-orange-700">⚙️</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Admin Portal</h1>
              <p className="text-sm text-muted-foreground">Sign in to manage the platform</p>
            </div>

            <AdminLoginForm />

            <div className="space-y-2 text-center text-sm">
              <Link href="/auth/login" className="text-primary hover:underline block">
                Sign in as Customer
              </Link>
              <Link href="/agent/login" className="text-primary hover:underline block">
                Sign in as Agent
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
