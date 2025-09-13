// Funções para gerenciar localStorage e sessionStorage

/**
 * Salva dados no localStorage
 */
export function setLocalStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value)
    localStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('Erro ao salvar no localStorage:', error)
  }
}

/**
 * Recupera dados do localStorage
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item)
  } catch (error) {
    console.error('Erro ao recuperar do localStorage:', error)
    return defaultValue
  }
}

/**
 * Remove dados do localStorage
 */
export function removeLocalStorage(key: string): void {
  try {
    localStorage.removeItem(key)
  } catch (error) {
    console.error('Erro ao remover do localStorage:', error)
  }
}

/**
 * Salva dados no sessionStorage
 */
export function setSessionStorage<T>(key: string, value: T): void {
  try {
    const serializedValue = JSON.stringify(value)
    sessionStorage.setItem(key, serializedValue)
  } catch (error) {
    console.error('Erro ao salvar no sessionStorage:', error)
  }
}

/**
 * Recupera dados do sessionStorage
 */
export function getSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key)
    if (item === null) return defaultValue
    return JSON.parse(item)
  } catch (error) {
    console.error('Erro ao recuperar do sessionStorage:', error)
    return defaultValue
  }
}

/**
 * Remove dados do sessionStorage
 */
export function removeSessionStorage(key: string): void {
  try {
    sessionStorage.removeItem(key)
  } catch (error) {
    console.error('Erro ao remover do sessionStorage:', error)
  }
}

/**
 * Limpa todo o localStorage
 */
export function clearLocalStorage(): void {
  try {
    localStorage.clear()
  } catch (error) {
    console.error('Erro ao limpar localStorage:', error)
  }
}

/**
 * Limpa todo o sessionStorage
 */
export function clearSessionStorage(): void {
  try {
    sessionStorage.clear()
  } catch (error) {
    console.error('Erro ao limpar sessionStorage:', error)
  }
}

/**
 * Verifica se o localStorage está disponível
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const test = '__localStorage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

/**
 * Verifica se o sessionStorage está disponível
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const test = '__sessionStorage_test__'
    sessionStorage.setItem(test, test)
    sessionStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}
