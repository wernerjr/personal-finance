import React, { useState, useMemo } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { useExpenses } from '@/hooks/use-expenses'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbLink, BreadcrumbPage, BreadcrumbSeparator } from '@/components/ui/breadcrumb'
import { ArrowLeft, Plus, Edit2, Trash2, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'
import { formatCurrency, formatDate, truncateText } from '@/lib/utils'
import { EXPENSE_TYPE_LABELS } from '@/types'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

type SortField = 'value' | 'created_at' | 'type'
type SortOrder = 'asc' | 'desc'

export default function HistoricoDespesas() {
  const { user } = useAuth()
  const { expenses, loading, updateExpense, deleteExpense, getTotalExpenses } = useExpenses(user?.email || null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const [sortField, setSortField] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterDate, setFilterDate] = useState<string>('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState<string>('')

  const filteredAndSortedExpenses = useMemo(() => {
    let filtered = expenses

    // Filtrar por tipo
    if (filterType !== 'all') {
      filtered = filtered.filter(expense => expense.type === filterType)
    }

    // Filtrar por data
    if (filterDate) {
      const filterDateObj = new Date(filterDate)
      filtered = filtered.filter(expense => {
        const expenseDate = new Date(expense.created_at)
        return expenseDate.toDateString() === filterDateObj.toDateString()
      })
    }

    // Ordenar
    return filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]

      if (sortField === 'value') {
        aValue = Number(aValue)
        bValue = Number(bValue)
      } else if (sortField === 'created_at') {
        aValue = new Date(aValue)
        bValue = new Date(bValue)
      }

      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })
  }, [expenses, sortField, sortOrder, filterType, filterDate])

  const chartData = useMemo(() => {
    const dailyTotals: { [key: string]: number } = {}
    
    expenses.forEach(expense => {
      const date = new Date(expense.created_at).toISOString().split('T')[0]
      dailyTotals[date] = (dailyTotals[date] || 0) + expense.value
    })

    return Object.entries(dailyTotals)
      .map(([date, total]) => ({
        date: new Date(date).toLocaleDateString('pt-BR'),
        total: total
      }))
      .sort((a, b) => new Date(a.date.split('/').reverse().join('-')).getTime() - new Date(b.date.split('/').reverse().join('-')).getTime())
  }, [expenses])

  const handleEdit = (expense: any) => {
    setEditingId(expense.id)
    setEditingValue(expense.value.toString())
  }

  const handleSaveEdit = async (id: string) => {
    const value = parseFloat(editingValue.replace(',', '.'))
    if (isNaN(value) || value < 0) {
      toast({
        title: "Valor inválido",
        description: "Digite um valor válido.",
        variant: "destructive",
      })
      return
    }

    const result = await updateExpense(id, { value })
    if (result.success) {
      setEditingId(null)
      setEditingValue('')
      toast({
        title: "Despesa atualizada!",
        description: "O valor foi atualizado com sucesso.",
      })
    } else {
      toast({
        title: "Erro ao atualizar",
        description: result.error || "Ocorreu um erro ao atualizar a despesa.",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    const result = await deleteExpense(id)
    if (result.success) {
      toast({
        title: "Despesa excluída!",
        description: "A despesa foi removida com sucesso.",
      })
    } else {
      toast({
        title: "Erro ao excluir",
        description: result.error || "Ocorreu um erro ao excluir a despesa.",
        variant: "destructive",
      })
    }
  }

  const formatCurrencyInput = (value: string) => {
    const numericValue = value.replace(/\D/g, '')
    const cents = parseInt(numericValue) || 0
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2
    }).format(cents / 100)
  }

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCurrencyInput(e.target.value)
    setEditingValue(formatted)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando despesas...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
              <BreadcrumbPage>Histórico de Despesas</BreadcrumbPage>
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
          <h1 className="text-3xl font-bold text-gray-900">Histórico de Despesas</h1>
          <p className="mt-2 text-lg text-gray-600">
            Visualize e gerencie todas as suas despesas
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(getTotalExpenses())}</div>
              <p className="text-xs text-gray-500">Valor total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Quantidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{expenses.length}</div>
              <p className="text-xs text-gray-500">Despesas cadastradas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Média por Despesa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {expenses.length > 0 ? formatCurrency(getTotalExpenses() / expenses.length) : 'R$ 0,00'}
              </div>
              <p className="text-xs text-gray-500">Valor médio</p>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        {chartData.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Gráfico de Despesas Acumuladas
              </CardTitle>
              <CardDescription>
                Evolução das suas despesas ao longo do tempo
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), 'Total']}
                      labelFormatter={(label) => `Data: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#3b82f6" 
                      strokeWidth={2}
                      dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sort">Ordenar por</Label>
                <Select value={`${sortField}-${sortOrder}`} onValueChange={(value) => {
                  const [field, order] = value.split('-')
                  setSortField(field as SortField)
                  setSortOrder(order as SortOrder)
                }}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="created_at-desc">Data (mais recente)</SelectItem>
                    <SelectItem value="created_at-asc">Data (mais antiga)</SelectItem>
                    <SelectItem value="value-desc">Valor (maior)</SelectItem>
                    <SelectItem value="value-asc">Valor (menor)</SelectItem>
                    <SelectItem value="type-asc">Tipo (A-Z)</SelectItem>
                    <SelectItem value="type-desc">Tipo (Z-A)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Filtrar por tipo</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os tipos</SelectItem>
                    {Object.entries(EXPENSE_TYPE_LABELS).map(([key, label]) => (
                      <SelectItem key={key} value={key}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date">Filtrar por data</Label>
                <Input
                  id="date"
                  type="date"
                  value={filterDate}
                  onChange={(e) => setFilterDate(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Despesas</CardTitle>
                <CardDescription>
                  {filteredAndSortedExpenses.length} despesa(s) encontrada(s)
                </CardDescription>
              </div>
              <Button onClick={() => navigate('/cadastrar-despesa')}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Despesa
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {filteredAndSortedExpenses.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">Nenhuma despesa encontrada</p>
                <Button onClick={() => navigate('/cadastrar-despesa')}>
                  <Plus className="h-4 w-4 mr-2" />
                  Cadastrar primeira despesa
                </Button>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Valor</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Criado em</TableHead>
                    <TableHead>Atualizado em</TableHead>
                    <TableHead className="w-20">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAndSortedExpenses.map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>
                        {expense.description.length > 50 ? (
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="link" className="p-0 h-auto">
                                {truncateText(expense.description, 50)}
                                <span className="text-blue-600 ml-1">... VER MAIS</span>
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Descrição Completa</DialogTitle>
                                <DialogDescription>
                                  {expense.description}
                                </DialogDescription>
                              </DialogHeader>
                            </DialogContent>
                          </Dialog>
                        ) : (
                          expense.description
                        )}
                      </TableCell>
                      <TableCell>
                        {editingId === expense.id ? (
                          <div className="flex items-center space-x-2">
                            <Input
                              value={editingValue}
                              onChange={handleValueChange}
                              className="w-24 h-8"
                              autoFocus
                            />
                            <Button
                              size="sm"
                              onClick={() => handleSaveEdit(expense.id)}
                            >
                              Salvar
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setEditingId(null)}
                            >
                              Cancelar
                            </Button>
                          </div>
                        ) : (
                          <span className="font-medium">{formatCurrency(expense.value)}</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {EXPENSE_TYPE_LABELS[expense.type]}
                        </span>
                      </TableCell>
                      <TableCell>{formatDate(expense.created_at)}</TableCell>
                      <TableCell>{formatDate(expense.updated_at)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(expense)}
                            disabled={editingId === expense.id}
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir esta despesa? Esta ação não pode ser desfeita.
                                  <br />
                                  <br />
                                  <strong>Despesa:</strong> {expense.description}
                                  <br />
                                  <strong>Valor:</strong> {formatCurrency(expense.value)}
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(expense.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
