/**
 * Radar Cognitivo - Utilitários de Higienização e Segurança
 * - Prevenção de XSS e injeção de HTML em strings de entrada livre
 * - Prevenção de CSV Formula Injection em exportações de planilhas (=, +, -, @)
 */

export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .trim();
}

export function sanitizeCsvCell(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return '""';
  let str = String(value);

  // Previne injeção de fórmulas iniciadas com caracteres perigosos
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escapa aspas duplas internas
  const escaped = str.replace(/"/g, '""');
  return `"${escaped}"`;
}
