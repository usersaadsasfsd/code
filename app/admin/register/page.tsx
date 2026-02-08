import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AdminRegisterForm from "@/components/forms/admin-register-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Admin Registration | CountyRoof",
  description: "Create an admin account to manage the CountyRoof platform.",
}

export default function AdminRegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-12 bg-gradient-to-b from-background to-secondary/5">
        <div className="w-full max-w-sm">
          <div className="bg-white rounded-lg shadow-lg p-6 border border-border">
            <div className="mb-6 text-center">
              <div className="inline-flex items-center justify-center h-12 w-12 rounded-lg bg-orange-100 mb-4">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Admin Registration</h1>
              <p className="text-xs text-muted-foreground">Create your admin account to manage the platform</p>
            </div>

            <AdminRegisterForm />

            <div className="mt-4 pt-4 border-t border-border text-center">
              <p className="text-xs text-muted-foreground mb-2">Already have an admin account?</p>
              <Link href="/admin/login" className="text-xs font-medium text-orange-600 hover:text-orange-700">
                Sign in here
              </Link>
            </div>

            <div className="mt-4 pt-4 border-t border-border space-y-2 text-center">
              <p className="text-xs text-muted-foreground">Not an admin?</p>
              <div className="flex flex-col gap-2">
                <Link href="/auth/register" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Create customer account
                </Link>
                <Link href="/agent/register" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Register as agent
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
