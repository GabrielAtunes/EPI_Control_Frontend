import React, { useState, useEffect, useMemo } from "react";
import { api } from "../../services/api/api";
import { useToast } from "../../contexts/ToastContext";
import { PageLayout } from "../../components/layout/PageLayout";
import { Collapsible } from "../../components/ui/Collapsible";
import {
  DateFilter,
  type DateFilterType,
} from "../../components/ui/DateFilter";
import {
  Users,
  HardHat,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  PackageSearch,
  ShieldCheck,
  Package,
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// --- TIPAGENS DAS RESPOSTAS DA API ---
interface Colaborador {
  id: number;
  nome: string;
  ativo: boolean;
}
interface Epi {
  id: number;
  descricao: string;
  fabricante: string;
  ativo: boolean;
}
interface Estoque {
  id: number;
  epi_catalogo_id: number;
  qtd_nova: number;
  qtd_usada: number;
}
interface Fornecedor {
  id: number;
  nome_fantasia: string;
  ativo: boolean;
}
interface ItemNf {
  epi_catalogo_id: number;
  qtd: number;
  valor_unitario: number;
}
interface NfEntrada {
  id: number;
  fornecedor_id: number;
  data_emissao: string;
  valor_total: number;
  ativo: boolean;
  itens: ItemNf[];
}
interface AlocacaoItem {
  epi_catalogo_id: number;
  qtd: number;
  data_devolucao: string | null;
}
interface Alocacao {
  id: number;
  colaborador_id: number;
  data_alocacao: string;
  ativo: boolean;
  itens: AlocacaoItem[];
}

// --- COMPONENTE DE CARD ---
interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
  subtitle?: string;
}
const StatCard = ({
  title,
  value,
  icon,
  gradient,
  subtitle,
}: StatCardProps) => (
  <div className="flex-1 min-w-[240px] bg-[#1c212d] rounded-xl p-5 border border-gray-800 shadow-sm relative overflow-hidden flex items-center gap-4 hover:border-gray-700 transition-colors">
    <div
      className={`absolute top-0 right-0 w-24 h-24 rounded-bl-full opacity-[0.08] bg-linear-to-br ${gradient}`}
    />
    <div
      className={`p-3 rounded-lg bg-linear-to-br ${gradient} text-white shadow-inner relative z-10 shrink-0`}
    >
      {icon}
    </div>
    <div className="relative z-10 flex flex-col flex-1 min-w-0">
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
        {title}
      </p>
      <h3 className="font-bold text-white mt-0.5 text-2xl tabular-nums whitespace-nowrap">
        {value}
      </h3>
      {subtitle && (
        <span className="text-xs text-gray-500 mt-1">{subtitle}</span>
      )}
    </div>
  </div>
);

// --- TOOLTIP CUSTOMIZADA PARA RECHARTS (DARK THEME) ---
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1c212d] border border-gray-700 p-3 rounded-lg shadow-xl z-50">
        {label && <p className="text-gray-200 font-semibold mb-2">{label}</p>}
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: entry.color || entry.payload.fill }}
            />
            <span className="text-gray-400">{entry.name}:</span>
            <span className="text-gray-100 font-bold">
              {entry.name.includes("Valor") || entry.name.includes("Custo")
                ? new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(entry.value)
                : `${entry.value} un`}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// Cores para o Gráfico de Rosca
const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#8b5cf6",
  "#f43f5e",
  "#14b8a6",
];

export default function Dashboard() {
  const { error } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  // Estados Base
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [epis, setEpis] = useState<Epi[]>([]);
  const [estoques, setEstoques] = useState<Estoque[]>([]);
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [nfs, setNfs] = useState<NfEntrada[]>([]);
  const [alocacoes, setAlocacoes] = useState<Alocacao[]>([]);

  // Filtros Globais
  const [dateFilterType, setDateFilterType] =
    useState<DateFilterType>("periodo");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resColab, resEpis, resEstoques, resForn, resNfs, resAloc] =
        await Promise.all([
          api.get<Colaborador[]>("/colaboradores/?ativos=true"),
          api.get<Epi[]>("/epis/?ativos=true"),
          api.get<Estoque[]>("/estoques/"),
          api.get<Fornecedor[]>("/fornecedores/?ativos=true"),
          api.get<NfEntrada[]>("/entradas/?ativos=true"),
          api.get<Alocacao[]>("/alocacoes/?ativos=true"),
        ]);

      setColaboradores(resColab.data);
      setEpis(resEpis.data);
      setEstoques(resEstoques.data);
      setFornecedores(resForn.data);
      setNfs(resNfs.data);
      setAlocacoes(resAloc.data);
    } catch (err) {
      error("Erro ao carregar dados analíticos.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- HELPERS ---
  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(val);
  const getMesAno = (isoDate: string) => {
    const d = new Date(isoDate);
    return `${d.toLocaleString("pt-BR", { month: "short" }).toUpperCase()}/${d.getFullYear()}`;
  };
  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });

  const isDateInRange = (dateIso: string) => {
    const d = dateIso.split("T")[0];
    if (startDate && endDate) return d >= startDate && d <= endDate;
    if (startDate) return d >= startDate;
    if (endDate) return d <= endDate;
    return true;
  };

  // ============================================================================
  // MODELAGEM DOS DADOS (Reativa)
  // ============================================================================

  // 1. Fatos Filtradas
  const nfsFiltradas = useMemo(
    () => nfs.filter((nf) => isDateInRange(nf.data_emissao)),
    [nfs, startDate, endDate],
  );
  const alocacoesFiltradas = useMemo(
    () => alocacoes.filter((a) => isDateInRange(a.data_alocacao)),
    [alocacoes, startDate, endDate],
  );

  // 2. KPIs (Gerais e Filtrados)
  const valorTotalInvestido = useMemo(
    () => nfsFiltradas.reduce((acc, nf) => acc + nf.valor_total, 0),
    [nfsFiltradas],
  );
  const itensMovimentados = useMemo(
    () =>
      alocacoesFiltradas.reduce(
        (acc, a) => acc + a.itens.reduce((sum, item) => sum + item.qtd, 0),
        0,
      ),
    [alocacoesFiltradas],
  );

  // Estoque Físico e Ativos (Independe do filtro de data)
  const { estoqueNovo, estoqueUsado, estoqueTotal, alertaEstoqueBaixo } =
    useMemo(() => {
      let novo = 0;
      let usado = 0;
      const alertas: any[] = [];
      estoques.forEach((est) => {
        novo += est.qtd_nova;
        usado += est.qtd_usada;
        const total = est.qtd_nova + est.qtd_usada;
        if (total < 5) {
          const epiObj = epis.find((e) => e.id === est.epi_catalogo_id);
          if (epiObj) alertas.push({ ...epiObj, qtd_total: total });
        }
      });
      return {
        estoqueNovo: novo,
        estoqueUsado: usado,
        estoqueTotal: novo + usado,
        alertaEstoqueBaixo: alertas.slice(0, 5),
      };
    }, [estoques, epis]);

  const itensEmUsoGlobais = useMemo(() => {
    return alocacoes.reduce(
      (acc, aloc) =>
        acc +
        aloc.itens
          .filter((i) => !i.data_devolucao)
          .reduce((sum, i) => sum + i.qtd, 0),
      0,
    );
  }, [alocacoes]);

  // 3. Gráficos Antigos (Evolução Financeira e Fluxo)
  const chartEvolucaoFinanceira = useMemo(() => {
    const ag: Record<string, number> = {};
    nfsFiltradas.forEach((nf) => {
      const m = getMesAno(nf.data_emissao);
      ag[m] = (ag[m] || 0) + nf.valor_total;
    });
    return Object.entries(ag)
      .map(([mes, valor]) => ({ mes, valor }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [nfsFiltradas]);

  const chartFluxoMovimentacao = useMemo(() => {
    const ag: Record<string, { entregas: number; devolucoes: number }> = {};
    alocacoesFiltradas.forEach((aloc) => {
      const mesEntrega = getMesAno(aloc.data_alocacao);
      if (!ag[mesEntrega]) ag[mesEntrega] = { entregas: 0, devolucoes: 0 };
      aloc.itens.forEach((item) => {
        ag[mesEntrega].entregas += item.qtd;
        if (item.data_devolucao) {
          const mesDevolucao = getMesAno(item.data_devolucao);
          if (!ag[mesDevolucao])
            ag[mesDevolucao] = { entregas: 0, devolucoes: 0 };
          ag[mesDevolucao].devolucoes += item.qtd;
        }
      });
    });
    return Object.entries(ag)
      .map(([mes, dados]) => ({ mes, ...dados }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [alocacoesFiltradas]);

  // ============================================================================
  // 4 NOVOS GRÁFICOS
  // ============================================================================

  // Novo 1: Top 5 EPIs Mais Consumidos (Volume)
  const chartTopEpisVolume = useMemo(() => {
    const ag: Record<number, number> = {};
    alocacoesFiltradas.forEach((a) =>
      a.itens.forEach((i) => {
        ag[i.epi_catalogo_id] = (ag[i.epi_catalogo_id] || 0) + i.qtd;
      }),
    );
    return Object.entries(ag)
      .map(([id, qtd]) => ({
        name: epis.find((e) => e.id === Number(id))?.descricao || "Outros",
        Consumo: qtd,
      }))
      .sort((a, b) => b.Consumo - a.Consumo)
      .slice(0, 5);
  }, [alocacoesFiltradas, epis]);

  // Novo 2: Distribuição por Fabricante (Market Share Interno)
  const chartFabricantes = useMemo(() => {
    const ag: Record<string, number> = {};
    alocacoesFiltradas.forEach((a) =>
      a.itens.forEach((i) => {
        const fab =
          epis.find((e) => e.id === i.epi_catalogo_id)?.fabricante || "Outros";
        ag[fab] = (ag[fab] || 0) + i.qtd;
      }),
    );
    return Object.entries(ag)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [alocacoesFiltradas, epis]);

  // Novo 3: Custos por Equipamento (Top 5 Mais Caros em Compras)
  const chartCustoEpi = useMemo(() => {
    const ag: Record<number, number> = {};
    nfsFiltradas.forEach((nf) =>
      nf.itens?.forEach((i) => {
        ag[i.epi_catalogo_id] =
          (ag[i.epi_catalogo_id] || 0) + i.qtd * i.valor_unitario;
      }),
    );
    return Object.entries(ag)
      .map(([id, valor]) => ({
        name: epis.find((e) => e.id === Number(id))?.descricao || "Outros",
        Custo: valor,
      }))
      .sort((a, b) => b.Custo - a.Custo)
      .slice(0, 5);
  }, [nfsFiltradas, epis]);

  // Novo 4: Passivo de Equipamentos (Entregues vs Não Devolvidos no Mês)
  const chartPendencias = useMemo(() => {
    const ag: Record<string, { entregues: number; retidos: number }> = {};
    alocacoesFiltradas.forEach((a) => {
      const mes = getMesAno(a.data_alocacao);
      if (!ag[mes]) ag[mes] = { entregues: 0, retidos: 0 };
      a.itens.forEach((i) => {
        ag[mes].entregues += i.qtd;
        if (!i.data_devolucao) ag[mes].retidos += i.qtd;
      });
    });
    return Object.entries(ag)
      .map(([mes, dados]) => ({ mes, ...dados }))
      .sort((a, b) => a.mes.localeCompare(b.mes));
  }, [alocacoesFiltradas]);

  // ============================================================================
  // TABELAS E RANKINGS
  // ============================================================================

  const topFornecedores = useMemo(() => {
    const gastos: Record<number, number> = {};
    nfsFiltradas.forEach((nf) => {
      gastos[nf.fornecedor_id] =
        (gastos[nf.fornecedor_id] || 0) + nf.valor_total;
    });
    return Object.entries(gastos)
      .map(([id, valor]) => ({
        nome:
          fornecedores.find((f) => f.id === Number(id))?.nome_fantasia ||
          "Desconhecido",
        valor,
      }))
      .sort((a, b) => b.valor - a.valor)
      .slice(0, 5);
  }, [nfsFiltradas, fornecedores]);

  const topColaboradores = useMemo(() => {
    const consumo: Record<number, number> = {};
    alocacoesFiltradas.forEach((aloc) => {
      consumo[aloc.colaborador_id] =
        (consumo[aloc.colaborador_id] || 0) +
        aloc.itens.reduce((acc, i) => acc + i.qtd, 0);
    });
    return Object.entries(consumo)
      .map(([id, qtd]) => ({
        nome:
          colaboradores.find((c) => c.id === Number(id))?.nome ||
          "Desconhecido",
        qtd,
      }))
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);
  }, [alocacoesFiltradas, colaboradores]);

  const ultimasAlocacoes = useMemo(() => {
    return alocacoes
      .filter((a) => a.ativo)
      .reverse()
      .slice(0, 5)
      .map((aloc) => ({
        id: aloc.id,
        colaborador:
          colaboradores.find((c) => c.id === aloc.colaborador_id)?.nome ||
          "Desconhecido",
        data: aloc.data_alocacao,
        qtdItens: aloc.itens.reduce((acc, i) => acc + i.qtd, 0),
      }));
  }, [alocacoes, colaboradores]);

  // UI Helpers
  const percNovo = estoqueTotal > 0 ? (estoqueNovo / estoqueTotal) * 100 : 0;
  const percUsado = estoqueTotal > 0 ? (estoqueUsado / estoqueTotal) * 100 : 0;

  return (
    <PageLayout title="Visão Geral do Estoque">
      {isLoading ? (
        <div className="flex h-64 items-center justify-center text-gray-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-emerald-500 mr-3"></div>
          A carregar modelo de dados...
        </div>
      ) : (
        <div className="space-y-6 mt-2">
          {/* --- FILTROS DE CONTEXTO --- */}
          <Collapsible title="Contexto Temporal" defaultOpen>
            <div className="w-full">
              <DateFilter
                label="Período de Análise (Aplicado a todos os visuais gráficos)"
                type={dateFilterType}
                onTypeChange={setDateFilterType}
                startDate={startDate}
                onStartDateChange={setStartDate}
                endDate={endDate}
                onEndDateChange={setEndDate}
              />
            </div>
          </Collapsible>

          {/* --- LINHA 1: KPIs CONSOLIDADOS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <StatCard
              title="Investimento no Período"
              value={formatCurrency(valorTotalInvestido)}
              subtitle={`${nfsFiltradas.length} NFs processadas`}
              icon={<DollarSign className="w-6 h-6" />}
              gradient="from-emerald-500 to-teal-600"
            />
            <StatCard
              title="Volume Distribuído"
              value={itensMovimentados}
              subtitle="Total de EPIs entregues no período"
              icon={<TrendingUp className="w-6 h-6" />}
              gradient="from-blue-500 to-indigo-600"
            />
            <StatCard
              title="Itens em Uso (Geral)"
              value={itensEmUsoGlobais}
              subtitle="EPIs sob posse dos colaboradores"
              icon={<HardHat className="w-6 h-6" />}
              gradient="from-amber-500 to-orange-600"
            />
            <StatCard
              title="Estoque Físico Atual"
              value={estoqueTotal}
              subtitle="Unidades disponíveis (Novos + Usados)"
              icon={<Package className="w-6 h-6" />}
              gradient="from-purple-500 to-pink-600"
            />
          </div>

          {/* --- LINHA 2: SAÚDE DO ESTOQUE (BARRAS E ALERTAS) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-200">
                  Condição Atual do Estoque
                </h3>
              </div>
              <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">
                      EPIs Novos
                    </span>
                    <span className="text-emerald-400 font-bold">
                      {estoqueNovo} un
                    </span>
                  </div>
                  <div className="w-full bg-[#13161f] rounded-full h-3">
                    <div
                      className="bg-emerald-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${percNovo}%` }}
                    ></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-400 font-medium">
                      EPIs Usados/Higienizados
                    </span>
                    <span className="text-amber-400 font-bold">
                      {estoqueUsado} un
                    </span>
                  </div>
                  <div className="w-full bg-[#13161f] rounded-full h-3">
                    <div
                      className="bg-amber-500 h-3 rounded-full transition-all duration-1000"
                      style={{ width: `${percUsado}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm flex flex-col">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-red-500/10 text-red-400 rounded-lg">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-gray-200">
                  Alerta de Estoque Crítico
                </h3>
              </div>
              <div className="flex-1 bg-[#151921] rounded-xl border border-gray-800/50 p-2 overflow-hidden">
                {alertaEstoqueBaixo.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-gray-500 py-8">
                    <ShieldCheck className="w-10 h-10 mb-2 opacity-50" />
                    <p className="text-sm">Nenhum alerta. Estoque saudável.</p>
                  </div>
                ) : (
                  <ul className="divide-y divide-gray-800">
                    {alertaEstoqueBaixo.map((epi, i) => (
                      <li
                        key={i}
                        className="flex items-center justify-between p-3 hover:bg-gray-800/30 transition-colors rounded-lg"
                      >
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold text-gray-200 line-clamp-1">
                            {epi.descricao}
                          </span>
                          <span className="text-xs text-gray-500">
                            {epi.fabricante}
                          </span>
                        </div>
                        <span className="px-2.5 py-1 bg-red-500/10 text-red-400 border border-red-500/20 rounded-md text-xs font-bold">
                          {epi.qtd_total} restando
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          {/* --- LINHA 3: GRÁFICOS FINANCEIROS E FLUXO --- */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Evolução de Investimentos (Compras)
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartEvolucaoFinanceira}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="mes"
                      stroke="#a0aec0"
                      tick={{ fill: "#a0aec0", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#a0aec0"
                      tick={{ fill: "#a0aec0", fontSize: 12 }}
                      tickFormatter={(val) => `R$ ${val}`}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Line
                      type="monotone"
                      dataKey="valor"
                      name="Valor Investido"
                      stroke="#10b981"
                      strokeWidth={3}
                      dot={{ r: 4, fill: "#10b981" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm">
              <h3 className="text-lg font-bold text-gray-200 mb-6 flex items-center gap-2">
                <PackageSearch className="w-5 h-5 text-blue-500" />
                Fluxo: Entregas vs Devoluções
              </h3>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartFluxoMovimentacao}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="mes"
                      stroke="#a0aec0"
                      tick={{ fill: "#a0aec0", fontSize: 12 }}
                    />
                    <YAxis
                      stroke="#a0aec0"
                      tick={{ fill: "#a0aec0", fontSize: 12 }}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
                    />
                    <Bar
                      dataKey="entregas"
                      name="Entregues"
                      fill="#3b82f6"
                      radius={[4, 4, 0, 0]}
                    />
                    <Bar
                      dataKey="devolucoes"
                      name="Devolvidos"
                      fill="#f59e0b"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* --- LINHA 4: NOVOS GRÁFICOS (CONSUMO E CUSTOS) --- */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* NOVO 1: Top EPIs Volume */}
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm xl:col-span-2">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                Top 5 EPIs (Volume de Saída)
              </h3>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartTopEpisVolume}
                    layout="vertical"
                    margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      horizontal={false}
                    />
                    <XAxis
                      type="number"
                      stroke="#a0aec0"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="#a0aec0"
                      tick={{ fontSize: 11 }}
                      width={120}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "#2d3748", opacity: 0.4 }}
                    />
                    <Bar
                      dataKey="Consumo"
                      name="Consumo"
                      fill="#8b5cf6"
                      radius={[0, 4, 4, 0]}
                      barSize={20}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NOVO 2: Distribuição Fabricantes */}
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm xl:col-span-1 flex flex-col items-center">
              <h3 className="text-sm font-bold text-gray-200 mb-2 uppercase tracking-wider w-full text-center">
                Consumo por Fabricante
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartFabricantes}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {chartFabricantes.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* NOVO 3: Custos por EPI */}
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm xl:col-span-1">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider w-full text-center">
                Top Custos (Compras)
              </h3>
              <div className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartCustoEpi}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      vertical={false}
                    />
                    <XAxis dataKey="name" stroke="#a0aec0" tick={false} />
                    <YAxis
                      stroke="#a0aec0"
                      tick={{ fontSize: 11 }}
                      tickFormatter={(v) => `R$${v}`}
                    />
                    <Tooltip
                      content={<CustomTooltip />}
                      cursor={{ fill: "#2d3748", opacity: 0.4 }}
                    />
                    <Bar
                      dataKey="Custo"
                      name="Custo Total"
                      fill="#f43f5e"
                      radius={[4, 4, 0, 0]}
                      barSize={30}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* --- LINHA 5: RETENÇÃO (GRÁFICO DE ÁREA) E RANKINGS --- */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* NOVO 4: Curva de Retenção */}
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                Passivo Mensal (Retidos)
              </h3>
              <p className="text-xs text-gray-400 mb-4">
                Volume entregue vs Volume que não retornou ao estoque no mês
                corrente.
              </p>
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartPendencias}
                    margin={{ top: 0, right: 0, left: -20, bottom: 0 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#2d3748"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="mes"
                      stroke="#a0aec0"
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis stroke="#a0aec0" tick={{ fontSize: 11 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend
                      wrapperStyle={{ fontSize: "11px", paddingTop: "5px" }}
                    />
                    <Area
                      type="monotone"
                      dataKey="entregues"
                      name="Total Entregue"
                      stroke="#3b82f6"
                      fillOpacity={0.2}
                      fill="#3b82f6"
                    />
                    <Area
                      type="monotone"
                      dataKey="retidos"
                      name="Ainda Retidos"
                      stroke="#f59e0b"
                      fillOpacity={0.5}
                      fill="#f59e0b"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Rankings Antigos */}
            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                Top 5 Fornecedores (Custo)
              </h3>
              <ul className="space-y-3">
                {topFornecedores.length > 0 ? (
                  topFornecedores.map((f, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-[#151921] p-3 rounded-lg border border-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold text-sm">
                          #{i + 1}
                        </span>
                        <span className="text-gray-200 text-sm font-medium line-clamp-1">
                          {f.nome}
                        </span>
                      </div>
                      <span className="text-emerald-400 font-bold text-sm">
                        {formatCurrency(f.valor)}
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm py-2">Sem dados.</li>
                )}
              </ul>
            </div>

            <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm lg:col-span-1">
              <h3 className="text-sm font-bold text-gray-200 mb-4 uppercase tracking-wider">
                Top 5 Colaboradores (Saídas)
              </h3>
              <ul className="space-y-3">
                {topColaboradores.length > 0 ? (
                  topColaboradores.map((c, i) => (
                    <li
                      key={i}
                      className="flex justify-between items-center bg-[#151921] p-3 rounded-lg border border-gray-800/50"
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-gray-500 font-bold text-sm">
                          #{i + 1}
                        </span>
                        <span className="text-gray-200 text-sm font-medium line-clamp-1">
                          {c.nome}
                        </span>
                      </div>
                      <span className="bg-amber-500/10 text-amber-400 border border-amber-500/20 px-2 py-1 rounded-md font-bold text-xs">
                        {c.qtd} un
                      </span>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 text-sm py-2">Sem dados.</li>
                )}
              </ul>
            </div>
          </div>

          {/* --- LINHA 6: ÚLTIMAS MOVIMENTAÇÕES (TABELA) --- */}
          <div className="bg-[#1c212d] border border-gray-800 rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-gray-200 mb-4">
              Últimas Entregas Realizadas
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-gray-500 uppercase bg-[#13161f] border-b border-gray-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold rounded-tl-lg">
                      ID Mov.
                    </th>
                    <th className="px-4 py-3 font-semibold">Colaborador</th>
                    <th className="px-4 py-3 font-semibold">Data</th>
                    <th className="px-4 py-3 font-semibold text-right rounded-tr-lg">
                      Qtd. Itens
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ultimasAlocacoes.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-4 py-8 text-center text-gray-500"
                      >
                        Nenhuma movimentação recente registrada.
                      </td>
                    </tr>
                  ) : (
                    ultimasAlocacoes.map((aloc) => (
                      <tr
                        key={aloc.id}
                        className="border-b border-gray-800/50 hover:bg-gray-800/20 transition-colors"
                      >
                        <td className="px-4 py-3 font-mono text-blue-400">
                          #{String(aloc.id).padStart(5, "0")}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-300">
                          {aloc.colaborador}
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {formatDate(aloc.data)}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className="px-2 py-1 bg-emerald-500/10 text-emerald-400 rounded text-xs font-bold">
                            {aloc.qtdItens} un
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
