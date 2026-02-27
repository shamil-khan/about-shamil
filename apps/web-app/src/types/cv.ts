export interface Header {
  name: string;
  titles: string[];
  location: string;
  phone: string;
  email: string;
  linkedin: string;
  github: string;
  twitter: string;
  photo?: string;
}

export interface Skill {
  category: string;
  items: string[];
}

export interface Experience {
  company: string;
  location: string;
  position: string;
  duration: string;
  highlights: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field: string;
  duration: string;
  highlights: string[];
}

export interface Award {
  title: string;
  issuer: string;
  year: string;
}

export interface Additional {
  availability: string;
  references: string;
}

export interface CVData {
  header: Header;
  summary: string;
  skills: Skill[];
  experience: Experience[];
  education: Education[];
  awards: Award[];
  additional: Additional;
}
