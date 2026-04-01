/**
 * Textos e rótulos da landing. Dados dinâmicos (projetos, depoimentos, CV) vêm de `/api/portfolio` → Pinia.
 * Tom: PT-BR profissional com leveza carioca; linha de roles no hero em inglês (contexto tech).
 */
export const landing = {
  nav: {
    logo: 'WV',
    items: [
      { id: 'home', label: 'Início', href: '#home' },
      { id: 'services', label: 'Serviços', href: '#services' },
      { id: 'voices', label: 'Vozes', href: '#voices' },
      { id: 'work', label: 'Projetos', href: '#work' }
    ],
    cta: {
      label: 'Fale comigo',
      href: '#contact-cta',
      icon: 'lucide:message-circle-heart'
    }
  },

  loading: {
    eyebrow: 'Portfólio',
    words: ['Ouvir', 'Desenhar', 'Entregar']
  },

  hero: {
    collectionEyebrow: "Collection '26",
    name: 'Wladi Veras',
    roles: ['Creative', 'Full-stack', 'Founder', 'Builder'],
    roleLinePrefix: '',
    roleLineSuffix: ' · based in Brazil',
    taglineFallback:
      'Produto bom não é o que parece bonito. É o que funciona na prova de fogo e ainda escala sem te dar dor de cabeça.',
    primaryCta: { label: 'Ver trabalhos', href: '#work' },
    secondaryCta: { label: 'Contato', href: '#contact-cta' }
  },

  story: {
    sectionId: 'services',
    introEyebrow: 'Por aqui',
    introTitlePlain: 'Antes de falar em stack, ',
    introTitleItalic: 'eu entendo onde o produto quebra.',
    introParagraphs: [
      'Fila travando, pagamento falhando, campanha sem número, fluxo remendado que o time já aprendeu a contornar.',
      'É aqui que eu começo.',
      'Eu escuto, isolo o problema e desenho o caminho.',
      'Daí pra frente é execução: transformar isso em um produto que funciona sem esforço — interface clara, sem manual, e backend que aguenta tráfego de verdade.',
      'No fim, não é sobre código bonito.',
      'É clareza na operação, velocidade no fluxo e um sistema que não te surpreende quando mais importa.'
    ],
    introWorkEyebrow: 'Como eu trabalho',
    introWorkBullets: [
      'Entendo o problema com quem vive ele no dia a dia',
      'Estruturo a solução em produto (sem achismo)',
      'Implemento com foco no que impacta (Nuxt, Vue, TypeScript — sem firula)',
      'Levo pra produção e acompanho o que acontece de verdade'
    ],
    stackEyebrow: 'Stack',
    stackIntroFallback:
      'Nuxt · Vue · TypeScript · Tailwind · GSAP · APIs · velocidade e estabilidade no uso real',
    introVideoSrc: '/media/Diamante_Girant.mp4',
    timelineEyebrow: 'Capítulos',
    timelineTitle: 'Minha história profissional',
    yearsPrefix: '',
    yearsLabel: 'anos de experiência',
    timelineLoading: 'Carregando…',
    timelineEmpty: 'Trajetória disponível em breve.',
    timelineFeatsEyebrow: 'O que marcou',
    timelineMobileStep: 'Capítulo',
    parallaxScrollHint:
      'Aqui embaixo, um pouco da minha história no mercado: times, projetos e o que fui escolhendo ao longo do caminho. Vale rolar com calma; cada parada é um capítulo dessa jornada.',
    tapToExpandHint: 'Toque para expandir',
    timelineVideoSrc: '/media/Vortexes_in_infinite_202603312316.mp4'
  },

  testimonials: {
    sectionId: 'voices',
    headline: {
      lead: 'Quem',
      italic: 'recomenda meu trabalho',
      muted: 'Colegas e parceiros que deixaram recomendação no LinkedIn.'
    },
    hoverExpandHint: 'Ver completo',
    linkedinLabel: 'LinkedIn',
    quoteLabel: 'Recomendação',
    emptyState: 'Carregando recomendações…',
    maxCards: 24,
    marqueeDurationRow1: 50,
    marqueeDurationRow2: 56
  },

  work: {
    visualEyebrow: 'Portfólio',
    visualPlain: 'Projetos ',
    visualItalic: 'que contam',
    visualSubtitle:
      'O foco é resultado: enxergar onde o problema mora de verdade — fila, conversão, pagamento, o que dói no dia a dia — e ir na raiz, não em remendo em cima de sintoma. Daí sai produto que roda bem pra quem usa e pra quem opera.',
    storyParagraphs: [
      'Cada case aqui nasceu de um problema real: fila travando, conversão baixa, pagamento falhando. Eu entro, corto o ruído, defino o caminho e implemento até o usuário sentir na prática.',
      'Já passei por IA em atendimento, checkout, gateway, link rastreável e plataforma de curso. Tecnologia muda. O objetivo não: funcionar bem e não quebrar na mão de quem usa.',
      'Se a interface diz uma coisa e o backend entrega outra, o produto morre. Quando os dois conversam, o processo flui: menos atrito pra quem clica, previsibilidade pra quem mantém.',
      'Aqui não tem firula de stack. Tem sistema rodando, conversão acontecendo e operação sem susto.'
    ],
    storyRibbonEyebrow: 'Marcas e projetos',
    storyCtaLabel: 'Falar do seu projeto',
    storyCtaHref: '#contact-cta' as const,
    emptyState: 'Carregando projetos…'
  },

  stats: {
    cards: [
      { valueKey: 'years' as const, suffix: '+', label: 'Anos de experiência' },
      { valueKey: 'projects' as const, suffix: '+', label: 'Projetos no portfólio' },
      { valueKey: 'voices' as const, suffix: '+', label: 'Quem recomenda' }
    ]
  },

  contact: {
    sectionId: 'contact',
    ctaVideoSrc:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4',
    marqueePhrase: "LET'S BUILD SOMETHING",
    ctaEyebrow: 'Próximo passo',
    titlePlain: 'Vamos criar algo ',
    titleItalic: 'memorável',
    ctaDescription:
      'Me conta do que você precisa; a gente responde rápido e alinha o próximo passo junto.',
    ctaButtonLabel: 'Começar conversar',
    email: 'hi@wladi.com.br',
    availability: 'Aberto a projetos e parcerias',
    socials: [
      { label: 'Twitter', href: 'https://twitter.com', icon: 'ri:twitter-x-line' },
      { label: 'LinkedIn', href: 'https://linkedin.com/wladiveras', icon: 'ri:linkedin-line' },
      { label: 'GitHub', href: 'https://github.com/wladiveras', icon: 'ri:github-line' }
    ]
  }
} as const

export type LandingStatKey = (typeof landing.stats.cards)[number]['valueKey']
