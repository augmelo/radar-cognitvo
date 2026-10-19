/**
 * Radar Cognitivo - Definições de Tipos
 * Alinhado com as diretrizes pedagógicas e de acessibilidade WCAG 2.2 AA.
 */

export type Category = 'esforco' | 'dependencia' | 'depende_do_contexto';

export type Criterion = 
  | 'autoria'        // Quem criou o rascunho, a pergunta ou a estrutura
  | 'elaboracao'     // Raciocínio ativo, anotações próprias, teste de hipótese
  | 'verificacao'    // Checagem de precisão, testes de mesa, identificação de alucinações
  | 'decisao'        // Discernimento sobre aceitar, rejeitar ou modificar sugestões
  | 'conexao';       // Transferência para novos contextos, analogias históricas/reais

export interface JustificationAlternative {
  id: string;
  text: string;
  isExpected: boolean;
  explanation: string;
}

export interface RepairAlternative {
  id: string;
  text: string;
  isExpected: boolean;
  explanation: string;
}

export interface ScenarioCard {
  id: string;
  text: string;
  originPage: number;
  source: 'original_pdf' | 'extension';
  version: number;
  expectedCategory: Category;
  primaryCriterion: Criterion;
  secondaryCriteria: Criterion[];
  shortExplanation: string;
  reflectionQuestion: string;
  contextNote?: string;
  justifications: JustificationAlternative[];
  repairs?: RepairAlternative[];
  isDiscussionOnly?: boolean;
}


