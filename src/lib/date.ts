// Utilitários para manipulação de datas

/**
 * Formata uma data para o formato brasileiro (DD/MM/AAAA)
 */
export function formatDateBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  }).format(dateObj)
}

/**
 * Formata uma data e hora para o formato brasileiro
 */
export function formatDateTimeBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(dateObj)
}

/**
 * Formata uma data para o formato ISO (AAAA-MM-DD)
 */
export function formatDateISO(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toISOString().split('T')[0]
}

/**
 * Formata uma data para o formato de input datetime-local
 */
export function formatDateTimeLocal(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  const hours = String(dateObj.getHours()).padStart(2, '0')
  const minutes = String(dateObj.getMinutes()).padStart(2, '0')
  
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

/**
 * Converte uma string de data brasileira para Date
 */
export function parseDateBR(dateString: string): Date {
  const [day, month, year] = dateString.split('/')
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

/**
 * Converte uma string de data ISO para Date
 */
export function parseDateISO(dateString: string): Date {
  return new Date(dateString)
}

/**
 * Verifica se uma data é válida
 */
export function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime())
}

/**
 * Obtém o início do dia
 */
export function startOfDay(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Obtém o fim do dia
 */
export function endOfDay(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Obtém o início do mês
 */
export function startOfMonth(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), dateObj.getMonth(), 1)
}

/**
 * Obtém o fim do mês
 */
export function endOfMonth(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), dateObj.getMonth() + 1, 0)
}

/**
 * Obtém o início do ano
 */
export function startOfYear(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), 0, 1)
}

/**
 * Obtém o fim do ano
 */
export function endOfYear(date: string | Date): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Date(dateObj.getFullYear(), 11, 31)
}

/**
 * Adiciona dias a uma data
 */
export function addDays(date: string | Date, days: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Adiciona meses a uma data
 */
export function addMonths(date: string | Date, months: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setMonth(result.getMonth() + months)
  return result
}

/**
 * Adiciona anos a uma data
 */
export function addYears(date: string | Date, years: number): Date {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const result = new Date(dateObj)
  result.setFullYear(result.getFullYear() + years)
  return result
}

/**
 * Calcula a diferença em dias entre duas datas
 */
export function differenceInDays(date1: string | Date, date2: string | Date): number {
  const d1 = typeof date1 === 'string' ? new Date(date1) : date1
  const d2 = typeof date2 === 'string' ? new Date(date2) : date2
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Verifica se uma data está entre duas outras datas
 */
export function isBetween(
  date: string | Date,
  start: string | Date,
  end: string | Date
): boolean {
  const d = typeof date === 'string' ? new Date(date) : date
  const s = typeof start === 'string' ? new Date(start) : start
  const e = typeof end === 'string' ? new Date(end) : end
  
  return d >= s && d <= e
}

/**
 * Obtém o nome do mês em português
 */
export function getMonthNameBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', { month: 'long' }).format(dateObj)
}

/**
 * Obtém o nome do dia da semana em português
 */
export function getWeekdayNameBR(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('pt-BR', { weekday: 'long' }).format(dateObj)
}

/**
 * Obtém a data atual
 */
export function now(): Date {
  return new Date()
}

/**
 * Obtém a data atual em formato ISO
 */
export function nowISO(): string {
  return now().toISOString()
}

/**
 * Obtém a data atual em formato brasileiro
 */
export function nowBR(): string {
  return formatDateBR(now())
}
