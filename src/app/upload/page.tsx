import { ResumeUploadForm } from '~/components/forms/resume-upload';

export default function UploadPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Upload Your Resume</h1>
          <p className="text-muted-foreground mt-2">
            Upload your resume to get started with AI-powered optimization.
          </p>
        </div>

        <ResumeUploadForm className="space-y-6" />
      </div>
    </div>
  );
}
