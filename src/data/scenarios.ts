/**
 * Radar Cognitivo - Banco Pedagógico dos 16 Cenários Originais
 * Fonte textual primária: The Cognitive Card Game.pdf, páginas 1 a 4.
 * Enriquecimento pedagógico: critérios, justificativas, reparações e perguntas reflexivas.
 */

import { ScenarioCard } from '../types';

export const ORIGINAL_SCENARIOS: ScenarioCard[] = [
  // --- 8 CENÁRIOS DE ESFORÇO COGNITIVO ---
  {
    id: 'card-1',
    text: 'Você lê um artigo, destaca os pontos principais e escreve seu próprio resumo.',
    originPage: 1,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['autoria', 'decisao'],
    shortExplanation: 'O estudante seleciona, filtra e reestrutura as informações usando suas próprias palavras, exercitando a compreensão ativa.',
    reflectionQuestion: 'Quais técnicas de anotação mais ajudam você a fixar ideias sem apenas copiar trechos soltos?',
    contextNote: 'A síntese pessoal requer selecionar criticamente o que é relevante, consolidando a aprendizagem duradoura.',
    justifications: [
      {
        id: 'just-1-c',
        text: 'Resumir artigos longos serve só para mostrar que o aluno decorou a matéria para a prova.',
        isExpected: false,
        explanation: 'O foco pedagógico é a elaboração conceitual e raciocínio crítico, não a simples memorização.'
      },
      {
        id: 'just-1-a',
        text: 'A pessoa leu o texto, pensou no que era mais importante e explicou a ideia com as próprias palavras.',
        isExpected: true,
        explanation: 'Síntese autoral exige compreensão profunda do texto e julgamento de relevância.'
      },
      {
        id: 'just-1-b',
        text: 'Qualquer tarefa feita sem celular ou computador garante que o cérebro aprendeu de verdade.',
        isExpected: false,
        explanation: 'Ausência de tecnologia não garante aprendizagem de qualidade; copiar manualmente também pode ser mecânico.'
      }
    ]},
  {
    id: 'card-2',
    text: 'Você quebra a cabeça com um problema de matemática difícil sem usar calculadora e finalmente consegue resolvê-lo.',
    originPage: 1,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['decisao'],
    shortExplanation: 'A persistência e a exploração de hipóteses desenvolvem o raciocínio lógico e a autonomia investigativa.',
    reflectionQuestion: 'Quando a calculadora ajuda a focar na lógica do problema e quando ela impede o treino de cálculo fundamental?',
    contextNote: 'Cuidado pedagógico: Valorizar a persistência e a exploração mental, sem demonizar o uso de calculadoras quando o objetivo for interpretar dados complexos.',
    justifications: [
      {
        id: 'just-2-b',
        text: 'Usar calculadora é sempre prejudicial e ninguém aprende nada quando usa tecnologia.',
        isExpected: false,
        explanation: 'Falso. Em etapas avançadas ou problemas conceituais, calculadoras aliviam carga operacional para focar na modelagem.'
      },
      {
        id: 'just-2-c',
        text: 'Resolver problemas difíceis de cabeça só serve para economizar a bateria do celular.',
        isExpected: false,
        explanation: 'O benefício é estritamente cognitivo (desenvolvimento de caminhos neurais e compreensão lógica).'
      },
      {
        id: 'just-2-a',
        text: 'A pessoa insistiu no desafio, testou caminhos diferentes e usou a própria lógica para achar a resposta.',
        isExpected: true,
        explanation: 'O esforço reside em formular hipóteses, errar, reavaliar e encontrar a resolução com raciocínio próprio.'
      }
    ]},
  {
    id: 'card-3',
    text: 'Você pensa em ideias para a sua história e escreve um rascunho antes de pedir à IA para revisá-lo.',
    originPage: 2,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['elaboracao', 'decisao'],
    shortExplanation: 'A concepção criativa e a estrutura central da narrativa vieram do autor antes de qualquer intervenção tecnológica.',
    reflectionQuestion: 'Como você mantém sua voz e estilo autoral ao analisar sugestões de estilo da IA?',
    contextNote: 'A IA atua como interlocutora de revisão, mantendo a gênese narrativa totalmente nas mãos do estudante.',
    justifications: [
      {
        id: 'just-3-a',
        text: 'Quem teve as ideias e escreveu o texto inicial foi o próprio aluno; a IA só ajudou a revisar depois.',
        isExpected: true,
        explanation: 'A autoria inicial garante que a ideia, o tom e o enredo pertençam ao estudante.'
      },
      {
        id: 'just-3-b',
        text: 'Pedir qualquer ajuda para a IA já transforma o trabalho em plágio na hora.',
        isExpected: false,
        explanation: 'Revisão gramatical ou de coesão não anula a autoria de quem concebeu e escreveu o rascunho.'
      },
      {
        id: 'just-3-c',
        text: 'Escrever o próprio rascunho antes só serve para cumprir tabela com o professor.',
        isExpected: false,
        explanation: 'Colocar ideias no papel estrutura o pensamento e desenvolve a expressividade autônoma.'
      }
    ]},
  {
    id: 'card-4',
    text: 'Você pede feedback a um chatbot depois de escrever seu parágrafo persuasivo.',
    originPage: 2,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['verificacao', 'decisao'],
    shortExplanation: 'O texto persuasivo já foi formulado pelo autor; o feedback funciona como espelho de diálogo para enriquecer a argumentação.',
    reflectionQuestion: 'Qual o próximo passo essencial após receber as sugestões do chatbot para não terceirizar sua decisão final?',
    contextNote: 'Cuidado pedagógico: O enunciado descreve autoria anterior ao feedback. Não se deve presumir que o aluno acatou tudo cegamente, mas sim orientar a avaliação crítica de cada sugestão.',
    justifications: [
      {
        id: 'just-4-c',
        text: 'Os chatbots sempre dão conselhos perfeitos e são melhores que qualquer professor humano.',
        isExpected: false,
        explanation: 'IAs frequentemente trazem clichês ou simplificações; a avaliação humana crítica é indispensável.'
      },
      {
        id: 'just-4-a',
        text: 'O estudante primeiro criou os próprios argumentos e depois usou o chatbot como um leitor para sugerir melhorias.',
        isExpected: true,
        explanation: 'O autor já construiu a tese e a lógica persuasiva; buscar feedback simula uma banca de leitores críticos.'
      },
      {
        id: 'just-4-b',
        text: 'O cenário prova que o estudante com certeza aceitou cada palavra sugerida pelo bot sem questionar nada.',
        isExpected: false,
        explanation: 'O texto do card ainda não diz se houve avaliação das sugestões; esse é o próximo passo fundamental a ser cultivado.'
      }
    ]},
  {
    id: 'card-5',
    text: 'Você cria um experimento científico com base na sua própria pergunta e o testa.',
    originPage: 3,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['elaboracao', 'verificacao', 'conexao'],
    shortExplanation: 'Investigação científica autêntica envolve formular hipóteses, desenhar métodos e confrontar ideias com dados empíricos.',
    reflectionQuestion: 'Como a curiosidade pessoal transforma um exercício protocolar em descoberta real?',
    contextNote: 'O cerne do método científico é a iniciativa investigativa guiada por perguntas formuladas pelo próprio sujeito.',
    justifications: [
      {
        id: 'just-5-b',
        text: 'Experimentos científicos só valem a pena se forem feitos sem nenhum aparelho moderno ou sensor digital.',
        isExpected: false,
        explanation: 'Equipamentos modernos são valiosos; o essencial é a autoria da pergunta e o raciocínio sobre as variáveis.'
      },
      {
        id: 'just-5-c',
        text: 'Criar experimentos na escola é fácil porque basta seguir uma receita pronta da internet.',
        isExpected: false,
        explanation: 'Testar uma pergunta própria exige lidar com imprevistos, controle de variáveis e análise de incertezas.'
      },
      {
        id: 'just-5-a',
        text: 'O aluno teve a curiosidade, inventou a pergunta, planejou o teste e colocou a mão na massa para ver o resultado.',
        isExpected: true,
        explanation: 'Protagonismo investigativo desenvolve rigor epistemológico e capacidade de resolver problemas reais.'
      }
    ]},
  {
    id: 'card-6',
    text: 'Você faz anotações durante uma videoaula e as reescreve com as suas próprias palavras.',
    originPage: 3,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['autoria', 'conexao'],
    shortExplanation: 'Parafrasear e reorganizar notas transforma recepção passiva em consolidação ativa de conhecimento.',
    reflectionQuestion: 'Como você sabe que realmente entendeu um conceito e não apenas trocou sinônimos no papel?',
    contextNote: 'A reescrita requer tradução interna para o repertório do estudante, fortalecendo a rede semântica na memória.',
    justifications: [
      {
        id: 'just-6-a',
        text: 'Ao reescrever o que ouviu com as suas próprias palavras, a pessoa teve que entender o assunto de verdade.',
        isExpected: true,
        explanation: 'Ao traduzir para suas palavras, o estudante verifica se realmente compreendeu o conteúdo ministrado.'
      },
      {
        id: 'just-6-b',
        text: 'Assistir a videoaulas no computador nunca ensina nada em comparação com livros de papel.',
        isExpected: false,
        explanation: 'Diferentes mídias têm méritos pedagógicos; o fator decisivo é o papel ativo de quem estuda.'
      },
      {
        id: 'just-6-c',
        text: 'Reescrever anotações serve apenas para deixar o caderno bonito para postar nas redes sociais.',
        isExpected: false,
        explanation: 'O valor primário é cognitivo: reestruturar a informação na mente durante a escrita.'
      }
    ]},
  {
    id: 'card-7',
    text: 'Você lê sobre um evento histórico e o compara com algo que está acontecendo hoje.',
    originPage: 4,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'conexao',
    secondaryCriteria: ['elaboracao', 'decisao'],
    shortExplanation: 'Estabelecer pontes temporais e relações causais desenvolve o pensamento crítico e a consciência histórica.',
    reflectionQuestion: 'Quais semelhanças e quais diferenças você busca para não criar comparações superficiais?',
    contextNote: 'A transferência de aprendizagem entre contextos distintos é um dos maiores marcadores de raciocínio autônomo.',
    justifications: [
      {
        id: 'just-7-c',
        text: 'Estudar história serve apenas para decorar datas antigas e nomes de presidentes.',
        isExpected: false,
        explanation: 'A relevância contemporânea da história reside na compreensão dos processos sociais e humanos.'
      },
      {
        id: 'just-7-a',
        text: 'A pessoa fez conexões inteligentes entre o passado e o presente, pensando criticamente sobre a realidade.',
        isExpected: true,
        explanation: 'Fazer conexões temporais exige compreender causas, efeitos e contextos sem anacronismo.'
      },
      {
        id: 'just-7-b',
        text: 'A história sempre se repete do mesmo jeitinho, então nem precisa pensar muito para comparar.',
        isExpected: false,
        explanation: 'A história nunca se repete de forma idêntica; identificar continuidades e rupturas exige alto rigor reflexivo.'
      }
    ]},
  {
    id: 'card-8',
    text: 'Você usa a IA para verificar sua gramática, mas decide se aceita ou não cada sugestão.',
    originPage: 4,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'esforco',
    primaryCriterion: 'decisao',
    secondaryCriteria: ['verificacao', 'autoria'],
    shortExplanation: 'O estudante mantém a autoridade deliberativa, avaliando intenção comunicativa, estilo e adequação de cada alteração.',
    reflectionQuestion: 'Em que momentos você prefere recusar uma sugestão gramatical correta para manter o tom ou a ênfase desejada?',
    contextNote: 'Usar ferramentas para acelerar detecção de desvios, mantendo o discernimento de escolha, exemplifica uso maduro de tecnologia.',
    justifications: [
      {
        id: 'just-8-b',
        text: 'Toda e qualquer sugestão de correção vinda de inteligência artificial deve ser recusada.',
        isExpected: false,
        explanation: 'Verificadores gramaticais são apoios legítimos quando o autor compreende e comanda as correções.'
      },
      {
        id: 'just-8-c',
        text: 'Revisar pontuação e concordância não faz diferença nenhuma na comunicação de hoje.',
        isExpected: false,
        explanation: 'Clareza e adequação linguística são fundamentais para transmitir ideias com eficácia.'
      },
      {
        id: 'just-8-a',
        text: 'O estudante usou a IA para achar erros, mas quem decidiu o que fazia sentido e o que manter no texto foi ele.',
        isExpected: true,
        explanation: 'A decisão consciente de aceitar ou recusar preserva a autoria e treina o olhar analítico.'
      }
    ]},

  // --- 8 CENÁRIOS DE DEPENDÊNCIA COGNITIVA ---
  {
    id: 'card-9',
    text: 'Você copia um parágrafo inteiro de um chatbot e o cola no seu relatório.',
    originPage: 1,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['elaboracao', 'verificacao'],
    shortExplanation: 'O ato de recortar e colar sem reelaboração terceiriza totalmente a escrita e a síntese, anulando a reflexão autoral.',
    reflectionQuestion: 'O que você perderia em termos de aprendizado se essa prática se repetisse em todos os seus relatórios?',
    contextNote: 'Cuidado pedagógico: A dependência aqui não é o uso do chatbot, mas a ausência completa de leitura crítica, seleção e autoria.',
    justifications: [
      {
        id: 'just-9-a',
        text: 'A pessoa apenas copiou e colou o texto pronto, sem parar para pensar, aprender ou usar a própria voz.',
        isExpected: true,
        explanation: 'Ao colar o parágrafo diretamente, o estudante renuncia ao processo de entender e articular o raciocínio.'
      },
      {
        id: 'just-9-b',
        text: 'Relatórios escolares só têm valor se forem escritos à mão com caneta esferográfica.',
        isExpected: false,
        explanation: 'O problema não é digitar no computador, mas sim delegar a autoria e o raciocínio ao modelo de IA.'
      },
      {
        id: 'just-9-c',
        text: 'Os chatbots nunca conseguem escrever nada que faça sentido em português.',
        isExpected: false,
        explanation: 'O texto do bot pode ser bem escrito, mas a entrega não reflete a aprendizagem do estudante.'
      }
    ],
    repairs: [
      {
        id: 'rep-9-a',
        text: 'Ler a explicação do chatbot, fechar a tela, redigir o conceito com as suas palavras e comparar se sua explicação ficou coerente.',
        isExpected: true,
        explanation: 'Recupera o esforço de elaboração e autoria: o estudante interioriza a ideia e a expressa com sua própria mente.'
      },
      {
        id: 'rep-9-b',
        text: 'Pedir ao chatbot para gerar outro parágrafo com palavras mais difíceis para parecer mais acadêmico antes de colar.',
        isExpected: false,
        explanation: 'Continua sendo terceirização total de autoria e raciocínio.'
      },
      {
        id: 'rep-9-c',
        text: 'Trocar apenas três palavras por sinônimos aleatórios com auxílio de um dicionário e colar o restante.',
        isExpected: false,
        explanation: 'Alterações cosméticas superficiais não reconstroem a compreensão conceitual.'
      }
    ]
  },
  {
    id: 'card-10',
    text: 'Você deixa a IA escrever sua introdução e conclusão e então entrega o trabalho sem fazer alterações.',
    originPage: 1,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['decisao', 'verificacao'],
    shortExplanation: 'Introdução e conclusão estabelecem a tese e o legado do trabalho; delegá-las e entregá-las sem revisão transfere a identidade do texto à máquina.',
    reflectionQuestion: 'Como a introdução e a conclusão de um trabalho refletem quem você é como autor?',
    contextNote: 'Essas duas seções concentram o posicionamento crítico do autor; entregá-las intactas terceiriza o julgamento intelectual do trabalho.',
    justifications: [
      {
        id: 'just-10-c',
        text: 'Só estudantes de faculdade de computação podem usar ferramentas de inteligência artificial.',
        isExpected: false,
        explanation: 'Critério sem sentido pedagógico; a questão central é o desenvolvimento do raciocínio e da autoria.'
      },
      {
        id: 'just-10-a',
        text: 'A pessoa entregou as partes mais importantes do trabalho sem nem ler ou ajustar com as próprias ideias.',
        isExpected: true,
        explanation: 'Introdução e conclusão ancoram a relevância e o posicionamento da pesquisa, exigindo compromisso autoral.'
      },
      {
        id: 'just-10-b',
        text: 'Introdução e conclusão não valem nota e ninguém liga para o que está escrito nelas.',
        isExpected: false,
        explanation: 'Pelo contrário: são as seções em que o leitor identifica a tese, o alcance e a contribuição do autor.'
      }
    ],
    repairs: [
      {
        id: 'rep-10-a',
        text: 'Mapear os achados reais do seu trabalho, redigir sua própria introdução e conclusão, e usar a IA apenas para sugerir transições de leitura.',
        isExpected: true,
        explanation: 'Garante que o posicionamento e os desfechos nasçam do que o estudante realmente pesquisou e concluiu.'
      },
      {
        id: 'rep-10-b',
        text: 'Pedir à IA para adicionar citações inventadas na conclusão para dar mais autoridade ao texto gerado.',
        isExpected: false,
        explanation: 'Gera alucinações bibliográficas e agrava a violação de integridade acadêmica.'
      },
      {
        id: 'rep-10-c',
        text: 'Entregar o trabalho sem introdução e sem conclusão para não gastar tempo escrevendo.',
        isExpected: false,
        explanation: 'Elimina partes essenciais da estrutura acadêmica e comunicativa.'
      }
    ]
  },
  {
    id: 'card-11',
    text: 'Você pede à IA três argumentos para o seu debate e usa apenas esses.',
    originPage: 2,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['decisao', 'verificacao'],
    shortExplanation: 'Adotar exclusivamente argumentos automáticos sem pesquisa documental nem contra-argumentação empobrece a formação do raciocínio oratório.',
    reflectionQuestion: 'Como o debate ganha força quando você traz evidências e convicções que você mesmo investigou?',
    contextNote: 'Cuidado pedagógico: O foco é a falta de elaboração própria e checagem dos pontos. Brainstorming preliminar com IA é válido se o debatedor pesquisar, checar e formular a defesa.',
    justifications: [
      {
        id: 'just-11-b',
        text: 'É proibido debater sobre qualquer assunto que a internet ou modelos de IA já conheçam.',
        isExpected: false,
        explanation: 'O problema não é o tema nem a existência de dados, mas a renúncia à pesquisa ativa de fundamentos.'
      },
      {
        id: 'just-11-c',
        text: 'Em um debate escolar, o que importa é falar mais alto que o colega, não a qualidade dos argumentos.',
        isExpected: false,
        explanation: 'Argumentação sólida e evidências verificáveis são a base de um bom debate acadêmico e cidadão.'
      },
      {
        id: 'just-11-a',
        text: 'O estudante aceitou os argumentos prontos da IA sem pesquisar se eram reais nem criar ideias próprias.',
        isExpected: true,
        explanation: 'Debates exigem antecipar contra-argumentos e dominar dados reais, o que não acontece na aceitação passiva de 3 tópicos.'
      }
    ],
    repairs: [
      {
        id: 'rep-11-a',
        text: 'Usar as sugestões da IA como ponto de partida (brainstorming), buscar fontes primárias para validar cada dado e formular seus próprios contra-argumentos.',
        isExpected: true,
        explanation: 'Converte sugestões soltas em investigação fundamentada, exercitando elaboração e verificação ativa.'
      },
      {
        id: 'rep-11-b',
        text: 'Pedir dez argumentos em vez de três e sortear três sem ler antes de falar no púlpito.',
        isExpected: false,
        explanation: 'Ampliar a lista gerada não substitui a reflexão crítica e a validação factual.'
      },
      {
        id: 'rep-11-c',
        text: 'Decorar as frases da IA sem entender o significado para soar confiante perante os juízes.',
        isExpected: false,
        explanation: 'A oratória mecânica desmorona quando surgem perguntas e contestações da outra bancada.'
      }
    ]
  },
  {
    id: 'card-12',
    text: 'Você pula a leitura de um artigo e, em vez disso, pede à IA para resumi-lo.',
    originPage: 2,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['verificacao'],
    shortExplanation: 'Ao pular o contato com o texto-fonte, perdem-se o contexto, as nuances estilísticas, as evidências detalhadas e o treino de leitura aprofundada.',
    reflectionQuestion: 'Em quais situações um resumo prévio é um apoio legítimo e quando ele sabota seu aprendizado da leitura?',
    contextNote: 'Cuidado pedagógico: Na tarefa descrita, a leitura foi descartada. Reconhecer que resumos e leituras assistivas têm papéis legítimos (ex: triagem de fontes ou acessibilidade), mas não substituem o estudo do texto-chave.',
    justifications: [
      {
        id: 'just-12-a',
        text: 'Ao pular a leitura do texto original, a pessoa perdeu os detalhes, os exemplos e a chance de treinar a interpretação.',
        isExpected: true,
        explanation: 'A leitura profunda desenvolve vocabulário, atenção sustentada e capacidade de perceber ambiguidades.'
      },
      {
        id: 'just-12-b',
        text: 'Resumos automáticos são proibidos por lei para estudantes menores de 18 anos.',
        isExpected: false,
        explanation: 'A velocidade de processamento da máquina não treina o cérebro humano que precisa aprender.'
      },
      {
        id: 'just-12-c',
        text: 'Ler artigos inteiros é sempre perda de tempo quando dá para pedir um resumo em 5 segundos.',
        isExpected: false,
        explanation: 'O problema não é alucinação garantida, mas a terceirização do esforço de leitura e interpretação.'
      }
    ],
    repairs: [
      {
        id: 'rep-12-a',
        text: 'Ler o artigo original grifando dúvidas; usar a IA apenas para esclarecer termos técnicos difíceis e checar sua compreensão final.',
        isExpected: true,
        explanation: 'Preserva a leitura substantiva do texto, usando a tecnologia como tutoria pontual para destravar passagens complexas.'
      },
      {
        id: 'rep-12-b',
        text: 'Pedir à IA para fazer um resumo com emojis e ler somente a primeira e a última linha.',
        isExpected: false,
        explanation: 'Ainda evita o enfrentamento com o texto original e suas nuances.'
      },
      {
        id: 'rep-12-c',
        text: 'Copiar o resumo da IA e mandar imprimir sem olhar o conteúdo para arquivar na pasta.',
        isExpected: false,
        explanation: 'Mera formalidade burocrática sem nenhum engajamento intelectual.'
      }
    ]
  },
  {
    id: 'card-13',
    text: 'Você usa um gerador de imagens por IA para criar o pôster inteiro do seu projeto e pula a parte de escrever qualquer coisa.',
    originPage: 3,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['autoria', 'conexao'],
    shortExplanation: 'A atividade pedagógica demandava sintetizar conceitos e comunicar resultados; focar apenas em apelo visual automático abandona a articulação explicativa.',
    reflectionQuestion: 'Como o equilíbrio entre visual atraente e texto consistente fortalece a clareza de um projeto?',
    contextNote: 'Cuidado pedagógico: O cenário omite a elaboração escrita esperada. Não se deve afirmar que ilustrações com IA são sempre dependência, mas sim que a omissão do conteúdo conceitual desvirtua o aprendizado.',
    justifications: [
      {
        id: 'just-13-a',
        text: 'A pessoa gerou a imagem automática e pulou a parte essencial de explicar o projeto, seus dados e conclusões com suas próprias palavras.',
        isExpected: true,
        explanation: 'Um pôster acadêmico deve comunicar hipótese, método e dados; pular a escrita anula a comunicação do projeto.'
      },
      {
        id: 'just-13-b',
        text: 'Qualquer pôster de projeto escolar precisa ser desenhado manualmente em cartolina com lápis de cor.',
        isExpected: false,
        explanation: 'Ferramentas visuais generativas são úteis; a questão é não omitir o conteúdo informativo e a explicação conceitual.'
      },
      {
        id: 'just-13-c',
        text: 'Imagens geradas por inteligência artificial substituem totalmente a necessidade de entender ou explicar o conteúdo do trabalho.',
        isExpected: false,
        explanation: 'O rigor de um projeto exige justificar, explicar e demonstrar o que foi desenvolvido através de comunicação fundamentada.'
      }
    ],
    repairs: [
      {
        id: 'rep-13-a',
        text: 'Estruturar os tópicos essenciais do projeto (problema, método e conclusões) em textos concisos e usar a IA visual apenas como ilustração de apoio.',
        isExpected: true,
        explanation: 'Restaura a centralidade do pensamento conceitual e usa o recurso visual a serviço da comunicação científica.'
      },
      {
        id: 'rep-13-b',
        text: 'Gerar três imagens diferentes com IA e colar uma por cima da outra sem nenhuma legenda explicativa.',
        isExpected: false,
        explanation: 'Continua sem apresentar os dados, a metodologia e os resultados da pesquisa.'
      },
      {
        id: 'rep-13-c',
        text: 'Deixar o pôster em branco e pedir desculpas na hora da apresentação.',
        isExpected: false,
        explanation: 'Não cumpre a atividade nem mobiliza aprendizagem de comunicação.'
      }
    ]
  },
  {
    id: 'card-14',
    text: 'Você recebe ajuda da IA, mas não verifica se as informações são realmente verdadeiras.',
    originPage: 3,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'verificacao',
    secondaryCriteria: ['decisao'],
    shortExplanation: 'Confiar cegamente em saídas automatizadas sem conferir em fontes confiáveis expõe o estudante a erros conceituais e alucinações factuais.',
    reflectionQuestion: 'Quais pistas ou hábitos você adota quando precisa checar se uma informação encontrada online é segura?',
    contextNote: 'Cuidado pedagógico: O foco central é a negligência da checagem. Não se deve assumir que a informação é sempre falsa, mas sim que a falta de verificação vulnerabiliza o conhecimento.',
    justifications: [
      {
        id: 'just-14-a',
        text: 'A pessoa aceitou cegamente as respostas geradas pela IA, sem conferir se as afirmações eram verdadeiras nem checar as fontes.',
        isExpected: true,
        explanation: 'A verificação ativa é o filtro indispensável entre uma sugestão probabilística e o conhecimento validado.'
      },
      {
        id: 'just-14-b',
        text: 'Tudo o que uma inteligência artificial responde na internet é 100% verdadeiro e comprovado cientificamente.',
        isExpected: false,
        explanation: 'A IA traz dados corretos e incorretos; o problema é não auditar a veracidade nas fontes primárias.'
      },
      {
        id: 'just-14-c',
        text: 'Checar informações em livros ou fontes confiáveis é desnecessário se o texto da IA parecer bem escrito.',
        isExpected: false,
        explanation: 'Erros e desinformação se propagam rapidamente se não houver ceticismo informado e checagem metódica.'
      }
    ],
    repairs: [
      {
        id: 'rep-14-a',
        text: 'Cruzar as afirmações recebidas da IA com artigos acadêmicos ou livros de referência antes de incorporá-las ao seu trabalho.',
        isExpected: true,
        explanation: 'Exercita a verificação ativa e o rigor científico, assegurando que o que você defende está embasado na realidade.'
      },
      {
        id: 'rep-14-b',
        text: 'Perguntar para o mesmo chatbot: "Você tem certeza absoluta disso?" e aceitar se ele responder "sim".',
        isExpected: false,
        explanation: 'Modelos de linguagem podem reforçar confabulações com falso tom de certeza (alucinação em cascata).'
      },
      {
        id: 'rep-14-c',
        text: 'Apagar tudo e nunca mais pesquisar nenhum assunto na internet.',
        isExpected: false,
        explanation: 'Reação desproporcional que abandona o letramento informacional em vez de desenvolvê-lo.'
      }
    ]
  },
  {
    id: 'card-15',
    text: 'Você pesquisa pelo “gabarito” e o copia em vez de resolver a folha de exercícios por conta própria.',
    originPage: 4,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'elaboracao',
    secondaryCriteria: ['autoria', 'decisao'],
    shortExplanation: 'A cópia direta de respostas prontas simula a conclusão da tarefa, mas burla o processo neural de tentativa, erro e consolidação.',
    reflectionQuestion: 'O que o ato de errar um exercício ensina que copiar o gabarito nunca poderá ensinar?',
    contextNote: 'O gabarito serve como instrumento de autocorreção após a tentativa, não como substituto da resolução.',
    justifications: [
      {
        id: 'just-15-a',
        text: 'A pessoa pulou o esforço de pensar, testar e resolver os exercícios, copiando as respostas prontas sem aprender o conteúdo.',
        isExpected: true,
        explanation: 'A aprendizagem ocorre no enfrentamento do obstáculo cognitivo, não no ato mecânico de transcrever letras.'
      },
      {
        id: 'just-15-b',
        text: 'Folhas de exercícios de fixação servem apenas para gastar papel e não têm utilidade para o cérebro.',
        isExpected: false,
        explanation: 'Gabaritos são ferramentas pedagógicas legítimas de verificação após a resolução autônoma.'
      },
      {
        id: 'just-15-c',
        text: 'Copiar o gabarito é o melhor método de estudo porque garante a nota sem perder tempo tentando entender os problemas.',
        isExpected: false,
        explanation: 'Prática deliberada e exercícios são essenciais para consolidação da memória de longo prazo.'
      }
    ],
    repairs: [
      {
        id: 'rep-15-a',
        text: 'Tentar resolver cada questão no papel até o final; depois, consultar o gabarito para analisar a causa de eventuais discrepâncias.',
        isExpected: true,
        explanation: 'Usa o gabarito como feedback formativo, valorizando a tentativa genuína como motor da aprendizagem.'
      },
      {
        id: 'rep-15-b',
        text: 'Copiar o gabarito trocando a caneta azul por caneta preta para parecer que pensou.',
        isExpected: false,
        explanation: 'Truque meramente estético que mantém a ausência de raciocínio.'
      },
      {
        id: 'rep-15-c',
        text: 'Rasgar a folha de exercícios e dizer que o cachorro comeu.',
        isExpected: false,
        explanation: 'Fuga da responsabilidade formativa sem benefício para o desenvolvimento pessoal.'
      }
    ]
  },
  {
    id: 'card-16',
    text: 'Você usa a IA para escrever uma reflexão no seu diário pessoal sobre os seus sentimentos.',
    originPage: 4,
    source: 'original_pdf',
    version: 1,
    expectedCategory: 'dependencia',
    primaryCriterion: 'autoria',
    secondaryCriteria: ['elaboracao', 'conexao'],
    shortExplanation: 'O diário íntimo é o espaço sagrado de autoconsciência e autoexpressão; delegar sua redação distancia a pessoa de suas próprias emoções.',
    reflectionQuestion: 'Como escrever de forma imperfeita sobre o que sente ajuda mais do que ler um texto polido gerado por uma máquina?',
    contextNote: 'Cuidado pedagógico: Distinguir terceirizar sentimentos pessoais de usar tecnologia assistiva para superar barreiras motoras/linguísticas. Jamais exigir exposição de intimidade dos estudantes.',
    justifications: [
      {
        id: 'just-16-a',
        text: 'Um diário pessoal serve para você expressar e entender suas próprias emoções; pedir para a IA escrever terceiriza seus próprios sentimentos.',
        isExpected: true,
        explanation: 'O autoconhecimento floresce no esforço sincero de dar nome e sentido aos próprios sentimentos.'
      },
      {
        id: 'just-16-b',
        text: 'A inteligência artificial compreende os sentimentos humanos melhor do que a própria pessoa que os está vivenciando.',
        isExpected: false,
        explanation: 'IAs simulam estruturas sintáticas sem consciência, afeto, dor ou emoções reais.'
      },
      {
        id: 'just-16-c',
        text: 'Refletir sobre os sentimentos é algo inútil a não ser que uma máquina formule frases poéticas para você.',
        isExpected: false,
        explanation: 'A escrita reflexiva (journaling) é uma prática comprovada para bem-estar e regulação socioemocional.'
      }
    ],
    repairs: [
      {
        id: 'rep-16-a',
        text: 'Escrever de forma livre e honesta em frases curtas sobre como você se sente hoje, sem se preocupar com gramática perfeita ou julgamento.',
        isExpected: true,
        explanation: 'Devolve a intimidade e a escuta interior à pessoa, cultivando a autoconsciência emocional autêntica.'
      },
      {
        id: 'rep-16-b',
        text: 'Pedir à IA para escrever um poema dramático e postar nas redes sociais fingindo que foi você.',
        isExpected: false,
        explanation: 'Reforça a alienação emocional e a dependência de validação artificial externa.'
      },
      {
        id: 'rep-16-c',
        text: 'Desistir de refletir sobre as próprias experiências e ignorar os próprios sentimentos.',
        isExpected: false,
        explanation: 'A supressão emocional não promove maturidade nem inteligência socioemocional.'
      }
    ]
  }
];
