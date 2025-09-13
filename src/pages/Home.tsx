import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbPage } from '@/components/ui/breadcrumb'
import { Copy, LogOut, Plus, BarChart3 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '@/hooks/use-toast'

export default function Home() {
  const { user, apiKey, signOut } = useAuth()
  const navigate = useNavigate()
  const { toast } = useToast()

  const handleLogout = async () => {
    await signOut()
    navigate('/')
  }

  const copyApiKey = () => {
    if (apiKey) {
      navigator.clipboard.writeText(apiKey)
      toast({
        title: "API Key copiada!",
        description: "A chave foi copiada para a área de transferência.",
      })
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbPage>Home</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Personal Finance</h1>
          <p className="mt-2 text-lg text-gray-600">
            Bem-vindo, {user?.email}! Gerencie suas despesas de forma inteligente.
          </p>
        </div>

        {/* API Key Card */}
        {apiKey && (
          <Card className="mb-8 border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="text-blue-900">Sua API Key</CardTitle>
              <CardDescription className="text-blue-700">
                Use esta chave para integrar com nossa API REST
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <code className="flex-1 p-2 bg-white rounded border text-sm font-mono break-all">
                  {apiKey}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyApiKey}
                  className="shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-4 p-3 bg-blue-100 rounded text-sm text-blue-800">
                <p className="font-semibold mb-2">Como usar a API:</p>
                <p className="mb-1">• Endpoint: POST /api/expenses</p>
                <p className="mb-1">• Header: x-api-key: {apiKey.substring(0, 8)}...</p>
                <p>• Body: {"{ \"description\": \"Exemplo\", \"value\": 10.50, \"type\": \"food\" }"}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/cadastrar-despesa')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Plus className="h-5 w-5 mr-2 text-green-600" />
                Cadastrar Despesa
              </CardTitle>
              <CardDescription>
                Adicione uma nova despesa ao seu controle financeiro
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate('/historico')}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2 text-blue-600" />
                Histórico de Despesas
              </CardTitle>
              <CardDescription>
                Visualize e gerencie todas as suas despesas
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={handleLogout}>
            <CardHeader>
              <CardTitle className="flex items-center">
                <LogOut className="h-5 w-5 mr-2 text-red-600" />
                Sair
              </CardTitle>
              <CardDescription>
                Faça logout da sua conta
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Total de Despesas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">R$ 0,00</div>
              <p className="text-xs text-gray-500">Este mês</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Despesas Cadastradas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-gray-500">Total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">Categoria Mais Usada</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-gray-500">Nenhuma ainda</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
