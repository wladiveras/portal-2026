import { defineStore } from 'pinia'
import type { PortfolioData } from '~/types/portfolio'

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
    loading: false,
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
      if (this.loading) return
      this.loading = true
      this.error = null
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
      }
    }
  }
})
