// Banco de desafios de código (seção 4.4). Como não existe um "sandbox"
// pra rodar código de verdade ainda, a análise aqui é uma heurística simples
// (procura por trechos-chave no código escrito) — o mesmo tipo de truque já
// usado no Agente de entrevista (lib/interview-agent.ts) pra avaliar
// respostas em texto livre sem precisar de uma IA de verdade rodando.

export type ChallengeDifficulty = "iniciante" | "intermediaria" | "avancada";

export type CodeChallenge = {
  id: string;
  difficulty: ChallengeDifficulty;
  title: string;
  prompt: string;
  starterCode: string;
  // cada trecho aqui, se encontrado no código escrito, soma pontos —
  // não é uma checagem de sintaxe real, só um indício de que o conceito foi usado
  expectedPatterns: { pattern: RegExp; label: string }[];
};

export const codeChallenges: CodeChallenge[] = [
  {
    id: "fizzbuzz",
    difficulty: "iniciante",
    title: "FizzBuzz",
    prompt:
      "Escreva uma função `fizzBuzz(n)` que retorna uma lista de 1 até n, trocando múltiplos de 3 por \"Fizz\", múltiplos de 5 por \"Buzz\", e múltiplos de 3 e 5 por \"FizzBuzz\".",
    starterCode: "function fizzBuzz(n) {\n  // seu código aqui\n}",
    expectedPatterns: [
      { pattern: /%\s*3/, label: "Verifica múltiplos de 3" },
      { pattern: /%\s*5/, label: "Verifica múltiplos de 5" },
      { pattern: /fizzbuzz/i, label: "Trata o caso \"FizzBuzz\" (múltiplo dos dois)" },
      { pattern: /for|while/, label: "Usa um laço de repetição" },
    ],
  },
  {
    id: "debounce",
    difficulty: "intermediaria",
    title: "Função debounce",
    prompt:
      "Implemente uma função `debounce(fn, delay)` que retorna uma nova função. Essa nova função só executa `fn` depois que `delay` milissegundos se passarem sem uma nova chamada.",
    starterCode: "function debounce(fn, delay) {\n  // seu código aqui\n}",
    expectedPatterns: [
      { pattern: /setTimeout/, label: "Usa setTimeout pra atrasar a execução" },
      { pattern: /clearTimeout/, label: "Usa clearTimeout pra cancelar a chamada anterior" },
      { pattern: /return function|return\s*\(/, label: "Retorna uma nova função" },
    ],
  },
  {
    id: "use-debounce-hook",
    difficulty: "avancada",
    title: "Hook useDebounce em React",
    prompt:
      "Crie um hook `useDebounce(value, delay)` que retorna a versão \"atrasada\" de `value`, atualizando só depois que `delay` ms se passarem sem o valor mudar. Útil pra evitar buscas a cada tecla digitada num campo de busca.",
    starterCode:
      "function useDebounce(value, delay) {\n  // seu código aqui (dica: useState + useEffect)\n}",
    expectedPatterns: [
      { pattern: /useState/, label: "Usa useState pra guardar o valor atrasado" },
      { pattern: /useEffect/, label: "Usa useEffect pra reagir à mudança de value" },
      { pattern: /setTimeout/, label: "Usa setTimeout dentro do efeito" },
      { pattern: /return\s*\(\s*\)\s*=>|clearTimeout/, label: "Limpa o timeout anterior (cleanup do useEffect)" },
    ],
  },
];

export function evaluateChallengeCode(code: string, challenge: CodeChallenge) {
  const matched = challenge.expectedPatterns.filter(({ pattern }) => pattern.test(code));
  const missing = challenge.expectedPatterns.filter(({ pattern }) => !pattern.test(code));
  const score = challenge.expectedPatterns.length
    ? Math.round((matched.length / challenge.expectedPatterns.length) * 100)
    : 0;

  return { score, matched, missing };
}
