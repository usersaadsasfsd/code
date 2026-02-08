import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AgentLoginForm from "@/components/forms/agent-login-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Agent Login | CountyRoof",
  description: "Login for real estate agents and property sellers.",
  robots: { index: false },
}

export default function AgentLoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <div className="inline-flex items-center justify-center h-10 w-10 rounded-lg bg-blue-100 mb-3">
                <span className="text-lg font-bold text-blue-700">👤</span>
              </div>
              <h1 className="text-2xl font-bold text-foreground">Agent Portal</h1>
              <p className="text-sm text-muted-foreground">Sign in to manage your properties</p>
            </div>

            <AgentLoginForm />

            <div className="space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/agent/register" className="text-primary hover:underline font-medium">
                  Register here
                </Link>
              </p>
              <Link href="/auth/login" className="text-primary hover:underline block">
                Sign in as Customer
              </Link>
              <Link href="/admin/login" className="text-primary hover:underline block">
                Admin Portal
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
