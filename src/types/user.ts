export interface User {
  id: string;
  no_identitas: string;
  name?: string;
  program_studi?: string;
  email?: string;
  userLevel?: userLevel;
  unit_id?: string;
  [key: string]: unknown;
}

export interface userLevel {
  name: string;
}
