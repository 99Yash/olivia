export default function Home() {
  return (
    <div className="flex h-full items-center justify-center bg-background">
      <main className="flex w-full max-w-4xl flex-col items-center justify-center px-6 py-16 text-center">
        <div className="mb-12">
          <h1 className="mb-6 text-6xl font-bold tracking-tight text-foreground sm:text-7xl lg:text-8xl">
            Olivia
          </h1>
          <p className="text-xl text-muted-foreground sm:text-2xl lg:text-3xl">
            The most sophisticated AI assistant for building your resume
          </p>
        </div>

        <div className="mb-12 max-w-2xl">
          <p className="text-lg leading-relaxed text-muted-foreground">
            Transform your career with AI-powered resume building. Create
            professional, ATS-optimized resumes that stand out to employers and
            land you your dream job.
          </p>
        </div>

        <div className="flex flex-col gap-4 sm:flex-row">
          <button className="rounded-lg bg-primary px-8 py-4 text-lg font-semibold text-primary-foreground transition-colors hover:bg-primary/90">
            Get Started
          </button>
          <button className="rounded-lg border border-border px-8 py-4 text-lg font-semibold text-foreground transition-colors hover:bg-accent hover:text-accent-foreground">
            Learn More
          </button>
        </div>
      </main>
    </div>
  );
}
