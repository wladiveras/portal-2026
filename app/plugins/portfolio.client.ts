export default defineNuxtPlugin(() => {
  if (import.meta.env.VITEST) return
  const store = usePortfolioStore()
  store.fetchPortfolioData()
})
