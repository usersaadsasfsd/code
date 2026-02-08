import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import LoginForm from "@/components/forms/login-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Login | CountyRoof Property Marketplace",
  description: "Login to your CountyRoof account to manage properties, find your home, or connect with agents.",
  robots: { index: false },
}

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">Welcome Back</h1>
              <p className="text-sm text-muted-foreground">Sign in to your CountyRoof account</p>
            </div>

            <LoginForm />

            <div className="space-y-2 text-center text-sm">
              <p className="text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline font-medium">
                  Create one
                </Link>
              </p>
              <Link href="#" className="text-primary hover:underline block">
                Forgot password?
              </Link>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}
