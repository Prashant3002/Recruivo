import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, BriefcaseBusiness, GraduationCap, School } from "lucide-react"
import { AnimatedHero } from "@/components/AnimatedHero"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/95 px-6 backdrop-blur">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-lg font-bold text-white">R</span>
          </div>
          <span className="text-xl font-bold">Recruivo</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login?explicit=true">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Sign Up</Link>
          </Button>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative overflow-hidden py-20 md:py-32">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-accent/10 -z-10" />
          <div className="container px-4 md:px-6">
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
              <div className="flex flex-col justify-center space-y-4">
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
                    AI-Powered Campus Recruitment
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl">
                    Connecting talented students with top employers through intelligent matching and personalized
                    recommendations.
                  </p>
                </div>
                <div className="flex flex-col gap-2 min-[400px]:flex-row">
                  <Button asChild size="lg" className="gap-1">
                    <Link href="/student">
                      For Students <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button asChild variant="outline" size="lg">
                    <Link href="/recruiter">For Recruiters</Link>
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <AnimatedHero />
              </div>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-20">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col items-center justify-center space-y-4 text-center">
              <div className="space-y-2">
                <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How It Works</h2>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  Our AI-powered platform makes recruitment simple and effective.
                </p>
              </div>
            </div>
            <div className="mx-auto grid max-w-5xl gap-6 py-12 md:grid-cols-3">
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <GraduationCap className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">For Students</h3>
                <p className="text-center text-muted-foreground">
                  Create a profile, upload your resume, and get AI-powered job recommendations tailored to your skills.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <BriefcaseBusiness className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">For Recruiters</h3>
                <p className="text-center text-muted-foreground">
                  Post jobs, find the perfect candidates with AI matching, and streamline your hiring process.
                </p>
              </div>
              <div className="flex flex-col items-center space-y-4 rounded-lg border p-6 shadow-sm">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <School className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-bold">For Universities</h3>
                <p className="text-center text-muted-foreground">
                  Monitor placement statistics, track student progress, and build relationships with top employers.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-between gap-4 px-4 md:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-primary">
              <span className="text-xs font-bold text-white">R</span>
            </div>
            <span className="text-sm font-semibold">Recruivo</span>
          </div>
          <p className="text-center text-sm text-muted-foreground md:text-left">
            © 2024 Recruivo. All rights reserved.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy Policy
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:underline">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

