// Testes para conversão de moeda

export function formatCurrency(value: string): string {
  // Remove tudo que não é dígito
  const numericValue = value.replace(/\D/g, '')
  
  // Converte para centavos
  const cents = parseInt(numericValue) || 0
  
  // Formata como moeda brasileira
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(cents / 100)
}

export function parseCurrency(value: string): number {
  // Remove formatação de moeda (R$, espaços, etc.)
  const cleanValue = value.replace(/[R$\s]/g, '')
  
  // Substitui vírgula por ponto para conversão
  const numericValue = cleanValue.replace(',', '.')
  
  // Converte para número
  return parseFloat(numericValue) || 0
}

// Testes
console.log('=== Testes de Conversão de Moeda ===')

// Teste 1: Formatação básica
console.log('Teste 1 - Formatação:')
console.log('Input: "2550" -> Output:', formatCurrency('2550'))
console.log('Input: "25500" -> Output:', formatCurrency('25500'))

// Teste 2: Parsing básico
console.log('\nTeste 2 - Parsing:')
console.log('Input: "R$ 25,50" -> Output:', parseCurrency('R$ 25,50'))
console.log('Input: "R$ 255,00" -> Output:', parseCurrency('R$ 255,00'))

// Teste 3: Ciclo completo
console.log('\nTeste 3 - Ciclo completo:')
const testValues = ['25,50', '255,00', '1000,00', '0,50']
testValues.forEach(val => {
  const formatted = formatCurrency(val)
  const parsed = parseCurrency(formatted)
  console.log(`${val} -> ${formatted} -> ${parsed}`)
})

// Teste 4: Valores problemáticos
console.log('\nTeste 4 - Valores problemáticos:')
const problematicValues = ['', '0', 'abc', 'R$', 'R$ 0,00']
problematicValues.forEach(val => {
  const formatted = formatCurrency(val)
  const parsed = parseCurrency(formatted)
  console.log(`"${val}" -> "${formatted}" -> ${parsed}`)
})
