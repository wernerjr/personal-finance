import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/hooks/use-auth'
import { useExpenses } from '@/hooks/use-expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { ArrowLeft, Save } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { EXPENSE_TYPE_LABELS, ExpenseType } from '@/types'

const formSchema = z.object({
  description: z.string().min(1, 'Descrição é obrigatória').max(100, 'Descrição deve ter no máximo 100 caracteres'),
  value: z.string().min(1, 'Valor é obrigatório').refine((val) => {
    // Remove formatação e verifica se é um valor válido
    const cleanValue = val.replace(/[R$\s]/g, '').replace(',', '.')
    const numericValue = parseFloat(cleanValue)
    return !isNaN(numericValue) && numericValue > 0
  }, 'Digite um valor válido maior que zero'),
  type: z.enum(['food', 'study', 'transport', 'fun', 'other'] as const, {
    required_error: 'Tipo é obrigatório'
  })
})

type FormData = z.infer<typeof formSchema>

export default function CadastrarDespesa() {
  const { user } = useAuth()
  const { createExpense } = useExpenses(user?.email || null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: '',
      value: '',
      type: undefined
    }
  })

  // const watchedType = watch('type') // Removido para evitar warning de linting

  const onSubmit = async (data: FormData) => {
    if (!user?.email) return

    // Converter valor formatado para número
    const numericValue = parseCurrency(data.value)
    console.log('Valor original:', data.value)
    console.log('Valor convertido:', numericValue)

    if (isNaN(numericValue) || numericValue <= 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido para a despesa.",
        variant: "destructive",
      })
      return
    }

    const result = await createExpense({
      description: data.description,
      value: numericValue,
      type: data.type
    })

    if (result.success) {
      toast({
        title: "Despesa cadastrada!",
        description: "Sua despesa foi salva com sucesso.",
      })
      navigate('/historico')
    } else {
      toast({
        title: "Erro ao cadastrar",
        description: result.error || "Ocorreu um erro ao salvar a despesa.",
        variant: "destructive",
      })
    }
  }

  const formatCurrency = (value: string) => {
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

  const parseCurrency = (value: string): number => {
    // Remove formatação de moeda (R$, espaços, etc.)
    const cleanValue = value.replace(/[R$\s]/g, '')
    
    // Substitui vírgula por ponto para conversão
    const numericValue = cleanValue.replace(',', '.')
    
    // Converte para número
    return parseFloat(numericValue) || 0
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value
    
    // Se o usuário digitou ponto, converte para vírgula
    if (value.includes('.') && !value.includes(',')) {
      value = value.replace('.', ',')
    }
    
    const formatted = formatCurrency(value)
    setValue('value', formatted)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink 
                href="/home" 
                onClick={(e) => { e.preventDefault(); navigate('/home') }}
                className="cursor-pointer"
              >
                Home
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Cadastrar Despesa</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/home')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">Cadastrar Despesa</h1>
          <p className="mt-2 text-lg text-gray-600">
            Adicione uma nova despesa ao seu controle financeiro
          </p>
        </div>

        {/* Form */}
        <Card>
          <CardHeader>
            <CardTitle>Nova Despesa</CardTitle>
            <CardDescription>
              Preencha os dados da sua despesa
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="description">Com o que você gastou?</Label>
                <Input
                  id="description"
                  placeholder="Ex: Almoço no restaurante"
                  {...register('description')}
                  className={errors.description ? 'border-red-500' : ''}
                />
                {errors.description && (
                  <p className="text-sm text-red-500">{errors.description.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="value">Valor</Label>
                <Input
                  id="value"
                  placeholder="Digite o valor (ex: 25,50)"
                  value={watch('value')}
                  onChange={handleValueChange}
                  className={errors.value ? 'border-red-500' : ''}
                />
                {errors.value && (
                  <p className="text-sm text-red-500">{errors.value.message}</p>
                )}
                <p className="text-xs text-gray-500">
                  Digite apenas números (ex: 25,50 ou 25.50)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select onValueChange={(value) => setValue('type', value as ExpenseType)}>
                  <SelectTrigger className={errors.type ? 'border-red-500' : ''}>
                    <SelectValue placeholder="Selecione o tipo da despesa" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.type && (
                  <p className="text-sm text-red-500">{errors.type.message}</p>
                )}
              </div>

              <div className="flex space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/home')}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isSubmitting ? 'Salvando...' : 'Cadastrar Despesa'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
