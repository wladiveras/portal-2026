export interface About {
  headline: string
  title: string
  summary: string
  longText: string
  profileImage: string
}

export interface Experience {
  role: string
  company: string
  duration: string
  site: string
  description: string[]
}

export interface Project {
  title: string
  star: boolean
  description: string
  technologies: string[]
  image: string
  preview: string
  github: string
  video: string
}

export interface Testimonial {
  name: string
  role: string
  company: string
  avatar: string
  quote: string
  linkedinUrl: string
}

export interface PortfolioData {
  careerStartYear: number
  about: About
  skills: string[]
  experience: Experience[]
  projects: Project[]
  testimonials: Testimonial[]
}
