export type SubmissionStatus = 'new' | 'contacted' | 'qualified' | 'closed';

export type ContactSubmission = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  company: string | null;
  service: string | null;
  message: string;
  status: SubmissionStatus;
  created_at: string;
};
