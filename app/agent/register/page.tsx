import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import AgentRegisterForm from "@/components/forms/agent-register-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Agent Registration | CountyRoof",
  description: "Register as a real estate agent or property seller on CountyRoof.",
  robots: { index: false },
}

export default function AgentRegisterPage() {
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
              <h1 className="text-2xl font-bold text-foreground">Join as Agent</h1>
              <p className="text-sm text-muted-foreground">Register to list and manage properties</p>
            </div>

            <AgentRegisterForm />

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/agent/login" className="text-primary hover:underline font-medium">
                  Sign in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
