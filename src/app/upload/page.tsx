import { ResumeUploadForm } from '~/components/forms/resume-upload';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-12 px-4 max-w-3xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight mb-4">
          Upload Your Resume
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Upload your resume to get started with AI-powered optimization.
        </p>
      </div>

      <div className="rounded-xl border shadow-sm p-8">
        <ResumeUploadForm />
      </div>
    </div>
  );
}
