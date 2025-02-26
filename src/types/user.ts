export interface User {
  id: string;
  no_identitas: string;
  name?: string;
  program_studi?: string;
  email?: string;
  role?: string;
  unit_id?: string;

  [key: string]: unknown;
}
