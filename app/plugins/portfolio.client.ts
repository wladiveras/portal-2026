export default defineNuxtPlugin(() => {
  const store = usePortfolioStore()
  store.fetchPortfolioData()
})
