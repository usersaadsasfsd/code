import type { Metadata } from "next"
import Header from "@/components/layout/header"
import Footer from "@/components/layout/footer"
import RegisterForm from "@/components/forms/register-form"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Create Account | CountyRoof",
  description: "Join CountyRoof to buy, sell, or rent properties. Create your account to get started.",
  robots: { index: false },
}

export default function RegisterPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-2xl font-bold text-foreground">Create Account</h1>
              <p className="text-sm text-muted-foreground">Join CountyRoof marketplace</p>
            </div>

            <RegisterForm />

            <div className="text-center text-sm">
              <p className="text-muted-foreground">
                Already have an account?{" "}
                <Link href="/auth/login" className="text-primary hover:underline font-medium">
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
