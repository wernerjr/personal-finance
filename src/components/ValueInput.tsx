import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ValueInputProps {
  value: string
  onChange: (value: string) => void
  error?: string
  placeholder?: string
}

export function ValueInput({ value, onChange, error, placeholder = "Digite o valor" }: ValueInputProps) {
  const [displayValue, setDisplayValue] = useState(value)

  const formatCurrency = (inputValue: string) => {
    // Remove tudo que não é dígito
    const numericValue = inputValue.replace(/\D/g, '')
    
    // Converte para centavos
    const cents = parseInt(numericValue) || 0
    
    // Formata como moeda brasileira
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(cents / 100)
  }

  const parseCurrency = (formattedValue: string): number => {
    // Remove formatação de moeda (R$, espaços, etc.)
    const cleanValue = formattedValue.replace(/[R$\s]/g, '')
    
    // Substitui vírgula por ponto para conversão
    const numericValue = cleanValue.replace(',', '.')
    
    // Converte para número
    return parseFloat(numericValue) || 0
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let inputValue = e.target.value
    
    // Se o usuário digitou ponto, converte para vírgula
    if (inputValue.includes('.') && !inputValue.includes(',')) {
      inputValue = inputValue.replace('.', ',')
    }
    
    const formatted = formatCurrency(inputValue)
    setDisplayValue(formatted)
    onChange(formatted)
  }

  const handleBlur = () => {
    // Garantir que o valor final está correto
    const numericValue = parseCurrency(displayValue)
    if (numericValue > 0) {
      const finalFormatted = formatCurrency(numericValue.toString())
      setDisplayValue(finalFormatted)
      onChange(finalFormatted)
    }
  }

  return (
    <div className="space-y-2">
      <Label htmlFor="value">Valor</Label>
      <Input
        id="value"
        placeholder={placeholder}
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        className={error ? 'border-red-500' : ''}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
      <div className="text-xs text-gray-500">
        <p>Valor formatado: {displayValue}</p>
        <p>Valor numérico: {parseCurrency(displayValue)}</p>
      </div>
    </div>
  )
}
