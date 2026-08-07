"use client";

import { DashboardMensal } from "@/types/dashboard";
import { formatarMoeda } from "@/utils/formatters";
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import { BarChart3 } from "lucide-react";

interface GraficoReceitasDespesasProps {
  mensal: DashboardMensal;
}

// Custom Tooltip
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-xl border border-border bg-card p-3 shadow-lg text-xs space-y-1.5">
        <p className="font-semibold text-foreground border-b border-border/40 pb-1">
          Resumo do Mês
        </p>
        {payload.map((item: any, index: number) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <span style={{ color: item.color }} className="font-medium">
              {item.name}:
            </span>
            <span className="font-bold text-foreground">
              {formatarMoeda(item.value)}
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function GraficoReceitasDespesas({ mensal }: GraficoReceitasDespesasProps) {
  const dados = [
    {
      name: "Mês Atual",
      Receitas: mensal.total_receitas,
      Despesas: mensal.total_despesas,
      Investimentos: mensal.total_investimentos,
      "Saldo do Mês": mensal.balanco_mensal,
    },
  ];

  return (
    <div className="rounded-[16px] border border-border/50 bg-card p-6 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-[#1F4E79]" />
          <h3 className="text-base font-bold text-foreground">
            Fluxo de Caixa do Mês
          </h3>
        </div>
        <span className="text-xs text-muted-foreground font-medium">
          Receitas, Despesas & Saldo Líquido
        </span>
      </div>

      <div className="h-[240px] w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={dados} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickFormatter={(v) => `R$ ${v}`}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }}
              iconType="circle"
            />
            <Bar
              dataKey="Receitas"
              fill="#22C55E"
              radius={[6, 6, 0, 0]}
              maxBarSize={55}
            />
            <Bar
              dataKey="Despesas"
              fill="#EF4444"
              radius={[6, 6, 0, 0]}
              maxBarSize={55}
            />
            <Bar
              dataKey="Investimentos"
              fill="#1F4E79"
              radius={[6, 6, 0, 0]}
              maxBarSize={55}
            />
            <Line
              type="monotone"
              dataKey="Saldo do Mês"
              stroke="#F59E0B"
              strokeWidth={3}
              dot={{ r: 6, fill: "#F59E0B", strokeWidth: 2, stroke: "#FFFFFF" }}
              activeDot={{ r: 8 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
