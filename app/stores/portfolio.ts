import { defineStore } from 'pinia'
import type { PortfolioData } from '~/types/portfolio'

/** Evita chamadas paralelas; permite `loading: true` inicial sem bloquear o primeiro fetch. */
let portfolioFetchInFlight: Promise<void> | null = null

const emptyAbout: PortfolioData['about'] = {
  headline: '',
  title: '',
  summary: '',
  longText: '',
  profileImage: ''
}

export const usePortfolioStore = defineStore('portfolio', {
  state: (): PortfolioData & { loading: boolean; error: string | null } => ({
    careerStartYear: 2020,
    about: { ...emptyAbout },
    skills: [],
    experience: [],
    projects: [],
    testimonials: [],
    /** true até o primeiro `/api/portfolio` no cliente — alinha SSR e hidratação com o plugin `.client`. */
    loading: true,
    error: null
  }),

  getters: {
    yearsOfExperience: (state) => {
      const y = new Date().getFullYear()
      return Math.max(0, y - state.careerStartYear)
    },
    totalProjects: (state) => state.projects.length,
    featuredProjects: (state) => {
      const starred = state.projects.filter((p) => p.star)
      if (starred.length) return starred
      return state.projects.slice(0, 4)
    },
    hasData: (state) =>
      Boolean(state.about.summary || state.projects.length || state.testimonials.length)
  },

  actions: {
    async fetchPortfolioData() {
      if (portfolioFetchInFlight) return portfolioFetchInFlight
      this.loading = true
      this.error = null
      portfolioFetchInFlight = (async () => {
        try {
          const data = await $fetch<PortfolioData>('/api/portfolio')
          this.careerStartYear = data.careerStartYear
          this.about = data.about
          this.skills = data.skills
          this.experience = data.experience
          this.projects = data.projects
          this.testimonials = data.testimonials
        } catch (e: unknown) {
          const msg = e instanceof Error ? e.message : 'Falha ao carregar portfólio'
          this.error = msg
          console.error(e)
        } finally {
          this.loading = false
          portfolioFetchInFlight = null
        }
      })()
      return portfolioFetchInFlight
    }
  }
})
