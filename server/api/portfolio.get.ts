export default defineEventHandler(() => {
  return {
    careerStartYear: 2020,
    about: {
      headline: 'Wladi Veras · fullstack, arquitetura e produto em operação',
      title: 'Sistemas que precisam funcionar de verdade',
      summary:
        'Eu trabalho no ponto em que produto, arquitetura e operação se encontram. Quando tem pressão, volume, pagamento, fila ou atendimento travando, é aí que a solução precisa ser pensada direito.',
      longText:
        'Comecei cedo, passando por WordPress, frontend, backend e produto, até chegar em contextos onde o sistema precisava aguentar mais do que uma boa interface. Na prática, isso me levou para projetos com checkout, gateway, chatbot, rastreio, campanha, área de membros e operação real rodando todos os dias. Em fintech, atuei olhando falha, risco, correção em produção e confiabilidade do fluxo. Em operação de atendimento, fui para a raiz da dor do operador, estruturando uso de IA, dashboard de acompanhamento e ações para melhorar aprendizado, reduzir erro e dar mais clareza para quem estava na ponta. Hoje meu foco é o mesmo em qualquer contexto: entender a causa, desenhar uma solução sólida e fazer o produto funcionar sem virar peso para o time.',
      profileImage: '/media/images/testimonials/wladi.jpg'
    },
    skills: [
      'JavaScript (ES6+)',
      'TypeScript',
      'Vue.js',
      'Nuxt',
      'Node.js',
      'Cloudflare',
      'PHP',
      'Laravel',
      'WordPress',
      'MySQL',
      'Redis',
      'RabbitMQ',
      'figma',
      'React',
      'Nest.js',
      'Docker'
    ],
    experience: [
      {
        role: 'Arquiteto de Soluções',
        company: 'Workana',
        duration: 'Janeiro 2024 - Presente',
        site: 'https://workana.com.br',
        description: [
          'Atuei na interseção entre produto, interface e fluxo real de uso.',
          'Estruturei chatbot com IA, personalização de respostas, automação e jornadas mais úteis para o atendimento.',
          'Transformei necessidades de campanha e operação em ferramentas práticas, como o Linksplit e fluxos com rastreio mais claro.',
          'Trabalhei com foco em conversão, clareza de interface e estabilidade de sistema, sem separar experiência de uso da parte técnica que sustenta tudo.'
        ]
      },
      {
        role: 'Fullstack Developer',
        company: 'Greenn',
        duration: 'Fevereiro 2022 - Janeiro 2024',
        site: 'https://greenn.com.br',
        description: [
          'Vivi o contexto de tráfego real, pagamento, assinatura e risco operacional em produto digital.',
          'Trabalhei com Laravel, Node, Redis, RabbitMQ, Vue, Nuxt e TypeScript em um ambiente que exigia consistência, velocidade e segurança.',
          'Passei por diferentes squads, atuando em checkout, gateway, recorrência, funis e fluxos que não podiam falhar.',
          'Foi um ciclo importante para consolidar visão de arquitetura, escala, integração e impacto direto no negócio.'
        ]
      },
      {
        role: 'Fullstack Developer',
        company: 'Alternativa Card',
        duration: 'Julho 2021 - Agosto 2022',
        site: 'https://alternativacard.com.br',
        description: [
          'Participei da construção de um produto desde a base, com Laravel, Vue 3 e Redis.',
          'Acompanhei de perto a evolução da arquitetura, do roadmap e da experiência do cliente no fluxo do pedido.',
          'O foco era simples: deixar o sistema previsível, acompanhar o crescimento e transformar operação em algo mais claro para quem usava.'
        ]
      }
    ],
    projects: [
      {
        title: 'Chatbot - Automação',
        star: true,
        description:
          'Atendimento com IA no WhatsApp: fluxos, áudio, respostas contextualizadas. Stack Nuxt + Laravel + Redis; modelo local Llama 3.2 para não depender só da nuvem.',
        technologies: [
          'Nuxt 3',
          'Pinia',
          'Laravel',
          'Mysql',
          'Redis',
          'Evolution Api',
          'LLama 3.2'
        ],
        image: '/media/images/project-chatbot.png',
        preview: '',
        github: '',
        video: 'https://www.youtube.com/watch?v=QNYQvQ2Iisg&t'
      },
      {
        title: 'justdo.cash',
        star: true,
        description:
          'SaaS para montar landing de assinatura com checkout integrado, dashboard de vendas e assinaturas em tempo real — menos fricção para quem vende e para quem compra.',
        technologies: [
          'Nuxt 3',
          'Pinia',
          'Laravel',
          'Mysql',
          'typescript'
        ],
        image: '/media/images/project-justdocash.png',
        preview: '',
        github: '',
        video: ''
      },
      {
        title: 'Zaptus',
        star: true,
        description:
          'Evoluiu de projeto para estúdio: software sob medida em React e Laravel para quem precisava de algo que o template não resolvia.',
        technologies: ['React', 'Laravel', 'Mysql'],
        image: '/media/images/project-zaptus.png',
        preview: '',
        github: '',
        video: ''
      },
      {
        title: 'inDev - portfólio',
        star: false,
        description:
          'Portfólio open source em Nuxt: base para expor projetos e trajetória sem reinventar layout do zero. Foco em estrutura clara e fácil de adaptar.',
        technologies: [
          'Nuxt 3',
          'Pinia',
          'cloudflare',
          'nuxthub',
          'typescript'
        ],
        image: '/media/images/project-indev.png',
        preview: 'https://wladi.com.br',
        github: 'https://github.com/wladiveras/inDev',
        video: ''
      },
      {
        title: 'Linksplit',
        star: false,
        description:
          'O Linksplit é uma ferramenta que cria um único link para dividir e direcionar leads para diferentes destinos de forma automática e aleatória. Ideal para campanhas de marketing e testes A/B, ele permite separar o tráfego entre vários links, facilitando a análise de dados e o rastreamento de desempenho. Com o Linksplit, você pode segmentar leads e otimizar estratégias, enquanto monitora a performance em tempo real.',
        technologies: [
          'Nuxt 3',
          'Pinia',
          'Laravel',
          'Mysql',
          'Redis'
        ],
        image: '/media/images/project-linksplit.png',
        preview: 'https://linksplit.com.br',
        github: '',
        video: ''
      },
      {
        title: 'Natural Life',
        star: false,
        description:
          '"Transforme Seu Corpo, Transforme Sua Vida" é um template projetado para academias e espaços fitness. Ele oferece uma estrutura pronta, com design moderno e funcionalidades voltadas para destacar equipamentos, instrutores e a comunidade. O template pode ser facilmente personalizado para se adequar à identidade da academia, proporcionando uma plataforma eficiente e atraente para os visitantes.',
        technologies: [
          'React',
          'Typescript',
          'Javascript',
          'Nodejs'
        ],
        image: '',
        preview: 'https://zaptus-natural.vercel.app/',
        github: '',
        video: ''
      },
      {
        title: 'Sabor & Arte',
        star: false,
        description:
          '"Sabor & Arte" é um template projetado para restaurantes, oferecendo uma estrutura elegante e funcional. Com foco em destacar a experiência gastronômica, o template permite apresentar o menu, ambiente e diferenciais do restaurante de forma atraente e intuitiva. Ele pode ser facilmente personalizado para se adequar ao estilo e identidade do restaurante, proporcionando uma plataforma de fácil navegação e uma experiência digital envolvente para os visitantes.',
        technologies: [
          'React',
          'Typescript',
          'Javascript',
          'Nodejs'
        ],
        image: '',
        preview: 'https://zaptus-site-restaurante.vercel.app/',
        github: '',
        video: ''
      },
      {
        title: 'Elite Fitness',
        star: false,
        description:
          '"Descubra o Poder da Natureza" é um template pronto, projetado para exibir produtos naturais e promover o bem-estar. Ele oferece uma estrutura funcional e visualmente atraente, que pode ser personalizada conforme as necessidades do projeto, economizando tempo e garantindo uma navegação eficiente para os visitantes.',
        technologies: [
          'React',
          'Typescript',
          'Javascript',
          'Nodejs'
        ],
        image: '',
        preview: 'https://zaptus-academia.vercel.app/',
        github: '',
        video: ''
      }
    ],
    testimonials: [
      {
        name: 'Gustavo Grativol',
        role: 'Arquiteto de Software | Tech Lead',
        company: 'GAF',
        avatar: '/media/images/testimonials/gustavo.jpg',
        quote: 'Trabalhei com o Wladi no desenvolvimento de um sistema de grande porte com muitos subprojetos e posso dizer o quão habilidoso, estudioso, pró ativo e dedicado o Wladi foi no projeto. Todas as tarefas que eram designadas ao Wladi sabíamos que seriam entregues dentro do prazo e com código de qualidade.',
        linkedinUrl: 'https://www.linkedin.com/in/gustavogrativol'
      },
      {
        name: 'Marcelo Silva Rodrigues',
        role: 'Arquiteto de Software | Tech Leader',
        company: 'Greenn',
        avatar: '/media/images/testimonials/marcelo.jpg',
        quote: 'Wladi Veras possui um conjunto impressionante de habilidades técnicas, abrangendo tanto o desenvolvimento front-end quanto o back-end. Sua capacidade de criar soluções técnicas eficientes e inovadoras foi fundamental para o sucesso de vários projetos em que colaboramos.',
        linkedinUrl: 'https://www.linkedin.com/in/marcelo-silva-rodrigues-86770b1a6/'
      },
      {
        name: 'Ysmine Miranda',
        role: 'Team Leader | Laravel, PHP, MySQL',
        company: 'Greenn',
        avatar: '/media/images/testimonials/ysmine.jpg',
        quote: 'Profissional experiente em PHP e tem habilidades para trabalhar com outras linguagens técnicas, gosta de aprender e trabalhar com coisas diversas.',
        linkedinUrl: 'https://www.linkedin.com/in/ysmine-miranda-50b4021a2/'
      },
      {
        name: 'Felipe Barreto',
        role: 'Frontend Developer | Vue.js | Nuxt.js',
        company: 'Go Mind Solutions SA',
        avatar: '/media/images/testimonials/felipe.jpg',
        quote: 'Wladi sempre foi muito proativo, trazendo novas ideias e tecnologias nos projetos que passou, sempre muito solicito ao oferecer ajuda a outros devs independente do projeto. Sua capacidade técnica e sua facilidade em aprender novas stacks são sem dúvidas pontos positivos!',
        linkedinUrl: 'https://www.linkedin.com/in/barretof20/'
      },
      {
        name: 'Sandro Antônio Souza',
        role: 'Team Lead | Vue.js | PHP | Laravel',
        company: 'Greenn',
        avatar: '/media/images/testimonials/sandro.jpg',
        quote: 'Desenvolvedor full-stack, proativo, criativo, compartilha conhecimento e desenvolve soluções. Recomendo!',
        linkedinUrl: 'https://www.linkedin.com/in/sandro-ant%C3%B4nio-souza-5b2a0a170/'
      },
      {
        name: 'Jeferson Silveira',
        role: 'Desenvolvedor Full Stack | PHP | Laravel | Vue.js',
        company: 'Greenn',
        avatar: '/media/images/testimonials/jefferson.jpg',
        quote: 'O Wladi é muito bom no trabalho em equipe, demonstra um ótimo conhecimento técnico e trabalha bem com integração de sistemas.',
        linkedinUrl: 'https://www.linkedin.com/in/jeferson-luis-silveira/'
      },
      {
        name: 'Gabriel Reis',
        role: 'Frontend Developer | Flutter | Angular | Vue',
        company: 'Greenn',
        avatar: '/media/images/testimonials/reis.jpg',
        quote: 'Ótimo profissional, sempre muito atento e em busca de mais conhecimento e soluções que possam agregar, foi ótimo poder trabalhar na mesma equipe que ele.',
        linkedinUrl: 'https://www.linkedin.com/in/gabriel-reis-b26193114/'
      },
      {
        name: 'Victor Messias',
        role: 'Full Stack Developer | VueJs | Laravel | NodeJs',
        company: 'Ingressos SA',
        avatar: '/media/images/testimonials/victor.jpg',
        quote: 'Excelente profissional, possui um amplo conhecimento nas stacks atuais do mercado, além de ter um bom relacionamento interpessoal com os colegas de trabalho.',
        linkedinUrl: 'https://www.linkedin.com/in/victor-messias/'
      },
      {
        name: 'Tanielson Moura',
        role: 'Team Leader | QA | Quality Assurance',
        company: 'Greenn',
        avatar: '/media/images/testimonials/taninelson.jpg',
        quote: 'Excelente profissional com amplo conhecimento em diversas tecnologias modernas, o Wladi é comunicativo e atencioso.',
        linkedinUrl: 'https://www.linkedin.com/in/tanielson-moura-218271217/'
      },
      {
        name: 'João Henryque Cunha',
        role: 'Fullstack | PHP | Laravel | VueJS',
        company: 'Greenn',
        avatar: '/media/images/testimonials/joao.jpg',
        quote: 'Muito competente, dedicado e cheio de inovação, um profissional apoiador sempre disposto a ajudar, super recomendo!',
        linkedinUrl: 'https://www.linkedin.com/in/jo%C3%A3o-henryque-cunha-02b568209/'
      },
      {
        name: 'Fabio Ronneli Albuquerque',
        role: 'Analista em Sistemas e Tecnologia',
        company: 'Fundhospar - Fundação Hospitalar do Paraná',
        avatar: '/media/images/testimonials/fabio.jpg',
        quote: 'Wladi é um profissional comprometido com sua missão, sempre disposto a fazer seu melhor para entregar seus compromissos e projetos, tem ótimo relacionamento pessoal, interagindo pessoal e profissionalmente de forma exemplar.',
        linkedinUrl: 'https://www.linkedin.com/in/fabioronneli/'
      },
      {
        name: 'João Arruda',
        role: 'Frontend Developer',
        company: 'ETEC',
        avatar: '/media/images/testimonials/joao.jpg',
        quote: 'Sempre disponível para ajudar os colegas, e também estava sempre à busca de novas tecnologias para estudar e aplicar em seus projetos.',
        linkedinUrl: 'https://www.linkedin.com/in/jo%C3%A3o-arruda-00b39959/'
      }
    ]
  }
})
