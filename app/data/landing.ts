/**
 * Textos e rótulos da landing. Dados dinâmicos (projetos, depoimentos, CV) vêm de `/api/portfolio` → Pinia.
 * Tom editorial: ver `docs/copy-voice-prompt.md`. PT-BR direto; roles do hero em inglês (contexto tech).
 */
const DIAMOND_LOOP_VIDEO = '/media/Diamante_Girant.mp4'

export const landing = {
  nav: {
    logo: 'WV',
    items: [
      { id: 'home', label: 'Início', href: '#home' },
      { id: 'services', label: 'Como penso', href: '#services' },
      { id: 'work', label: 'Projetos', href: '#work' },
      { id: 'timeline', label: 'Trajetória', href: '#timeline' }
    ],
    cta: {
      label: 'Fale comigo',
      href: '#contact-cta',
      icon: 'lucide:message-circle'
    }
  },

  loading: {
    eyebrow: 'Wladi Veras',
    /** Palavras exibidas em sequência no splash (tom editorial + stack). */
    words: [
      'Diagnóstico',
      'Clareza',
      'Arquitetura',
      'Contexto real',
      'Laravel & dados',
      'Escala',
      'Resiliência',
      'Entrega'
    ],
    /** Vídeo do diamante (mesmo asset da intro da Story). */
    videoSrc: DIAMOND_LOOP_VIDEO
  },

  hero: {
    /** Vídeo do hero (scroll-sync); SSOT para preload no loading e URL única. */
    vortexVideoSrc: '/media/Male_character_disintegrates_202603310008_keyframe.mp4',
    collectionEyebrow: 'Version 2026',
    name: 'Wladi Veras',
    roles: ['Laravel', 'Gemini', 'Claude', 'LLM', 'RAG', 'MySQL', 'Redis', 'RabbitMQ', 'Nuxt', 'Vue', 'TypeScript', 'JavaScript', 'HTML', 'CSS', 'Tailwind', 'Git'],
    roleLinePrefix: 'Creating with ',
    roleLineSuffix: ' in Brazil',
    taglineFallback:
      'Antes de qualquer decisão técnica, a gente entende onde está o problema de verdade.',
    primaryCta: { label: 'Ver projetos', href: '#work' },
    secondaryCta: { label: 'Falar comigo', href: '#contact-cta' }
  },

  story: {
    sectionId: 'services',
    /** Âncora do item "Trajetória" no nav (`#timeline`). */
    timelineAnchorId: 'timeline',
    introEyebrow: 'Por aqui',
    introTitlePlain: 'Antes da tecnologia, ',
    introTitleItalic: 'começo pela dor real.',
    introParagraphs: [
      'Já trabalhei com cenários onde o problema não podia esperar: pagamento falhando, fluxo quebrando em produção, atendimento travando e time aprendendo a contornar o sistema em vez de confiar nele.',
      'Foi assim em ambiente de fintech, onde qualquer erro mexe com dinheiro, confiança e continuidade do negócio.',
      'Foi assim também em operação de call center, onde a dor aparecia direto na ponta: operador inseguro, processo confuso, sistema pouco claro e aprendizado travado no meio da pressão do atendimento.',
      'Meu trabalho começa entendendo esse ponto com clareza. O que está travando, por que está travando e o que precisa mudar para o produto deixar de ser peso e começar a ajudar.',
      'A partir daí, a solução ganha forma com base sólida: Laravel no backend, MySQL organizando o dado certo, Redis acelerando o que precisa de resposta rápida, mensageria com RabbitMQ ou Kafka quando o fluxo exige desacoplamento, resiliência e escala.',
      'No fim, não é sobre stack por stack. É sobre fazer sistema, time e operação funcionarem juntos.'
    ],
    introWorkEyebrow: 'Como eu trabalho',
    introWorkBullets: [
      'Entender o problema com quem sente ele no dia a dia',
      'Separar sintoma de causa antes de sair implementando',
      'Desenhar a solução olhando produto, operação e arquitetura',
      'Construir com base sólida, pensando em escala, fila, cache, mensageria e consistência',
      'Subir, acompanhar e ajustar com o que a produção mostra de verdade'
    ],
    stackEyebrow: 'Base técnica',
    stackIntroFallback:
      'Laravel · PHP · MySQL · Redis · RabbitMQ · Kafka · APIs · arquitetura orientada a fluxo real',
    introVideoSrc: DIAMOND_LOOP_VIDEO,

    timelineEyebrow: 'Capítulos',
    timelineTitle: 'Uma trajetória construída em problema real',
    yearsPrefix: '',
    yearsLabel: 'anos de experiência',
    timelineLoading: 'Carregando…',
    timelineEmpty: 'Trajetória disponível em breve.',
    timelineFeatsEyebrow: 'O que marcou',
    timelineMobileStep: 'Capítulo',
    parallaxScrollHint:
      'Aqui embaixo estão os contextos que moldaram minha forma de construir produto: pagamento, operação, performance, atendimento e escala.',
    tapToExpandHint: 'Toque para expandir',
    timelineVideoSrc: '/media/Vortexes_in_infinite_202603312316.mp4'
  },

  testimonials: {
    sectionId: 'voices',
    headline: {
      lead: 'Quem',
      italic: 'já trabalhou comigo',
      muted: 'Recomendações de quem viu de perto entrega, consistência e capacidade técnica.'
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
    visualPlain: 'Projetos que mostram ',
    visualItalic: 'como eu penso',
    visualSubtitle:
      'Cada projeto aqui nasceu de um contexto diferente, mas todos passaram pelo mesmo ponto: transformar problema real em solução que aguenta uso de verdade.',
    storyParagraphs: [
      'Na fintech, isso significava analisar falha, lidar com compliance, corrigir bug em produção e proteger o fluxo onde o dinheiro passava.',
      'Na operação de atendimento, significava escutar quem estava na ponta, entender por que o operador errava, onde o aprendizado travava e o que o sistema estava exigindo além do necessário.',
      'Foi daí que nasceram metodologia de uso de IA, dashboard de acompanhamento, leitura de padrão operacional e ações mais objetivas para reduzir erro, acelerar entendimento e dar mais segurança para quem atendia.',
      'Em outros projetos, a dor apareceu em checkout, campanha, chatbot, curso, rastreio e experiência de uso.',
      'O padrão se repete: quando você entende a causa, a solução deixa de ser improviso e começa a sustentar o negócio.'
    ],
    storyRibbonEyebrow: 'Marcas e projetos',
    storyCtaLabel: 'Falar do seu projeto',
    storyCtaHref: '#contact-cta' as const,
    emptyState: 'Carregando projetos…'
  },

  stats: {
    cards: [
      { valueKey: 'years' as const, suffix: '+', label: 'Anos de experiência' },
      { valueKey: 'projects' as const, suffix: '+', label: 'Projetos construídos' },
      { valueKey: 'voices' as const, suffix: '+', label: 'Recomendações' }
    ]
  },

  contact: {
    sectionId: 'contact',
    ctaVideoSrc:
      'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4',
    marqueePhrase: "LET'S BUILD SOMETHING THAT HOLDS",
    ctaEyebrow: 'Próximo passo',
    titlePlain: 'Se existe uma dor real aí, ',
    titleItalic: 'vale a conversa',
    ctaDescription:
      'Se o produto está travando, a operação está carregando peso demais ou a arquitetura já não acompanha o volume, me chama. A conversa começa pelo problema, não pela ferramenta.',
    ctaButtonLabel: 'Chamar no WhatsApp',
    ctaButtonEmailLabel: 'Enviar por e-mail',
    whatsappNumber: '21 96909-8986',
    whatsappHref:
      'https://wa.me/5521969098986?text=Oi%2C%20vim%20pelo%20seu%20portfolio%20e%20quero%20falar%20sobre%20um%20projeto.',
    email: 'hi@wladi.com.br',
    availability: 'Aberto a projetos e parcerias',
    socials: [
      { label: 'LinkedIn', href: 'https://linkedin.com/in/wladiveras', icon: 'lucide:linkedin' },
      { label: 'Instagram', href: 'https://instagram.com/wladi_veras', icon: 'lucide:instagram' },
      { label: 'GitHub', href: 'https://github.com/wladiveras', icon: 'lucide:github' }
    ]
  }
} as const

export type LandingStatKey = (typeof landing.stats.cards)[number]['valueKey']
