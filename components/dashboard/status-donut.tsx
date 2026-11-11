'use client'

import { PieChartIcon } from 'lucide-react'
import { Cell, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const config = {
  COMPLETADA: { label: 'Completadas', color: 'var(--chart-1)' },
  EN_PROGRESO: { label: 'En Progreso', color: 'var(--chart-2)' },
  PENDIENTE: { label: 'Pendientes', color: 'var(--chart-3)' },
} satisfies ChartConfig

type Counts = Record<keyof typeof config, number>

export function StatusDonut({ counts }: { counts: Counts }) {
  const data = (Object.keys(config) as (keyof Counts)[]).map((key) => ({
    key,
    name: config[key].label,
    value: counts[key],
  }))
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <section className="flex flex-col rounded-lg border border-border bg-card shadow-sm">
      <header className="flex items-center justify-between border-b border-border bg-muted/40 px-5 py-4">
        <h2 className="flex items-center gap-2 font-semibold text-foreground">
          <PieChartIcon className="size-4 text-primary" aria-hidden="true" />
          Distribución por estados
        </h2>
        <span className="rounded bg-secondary px-2 py-0.5 text-xs font-semibold text-secondary-foreground">
          {total} tareas
        </span>
      </header>
      <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
        {total === 0 ? (
          <p className="flex flex-1 items-center justify-center py-16 text-sm text-muted-foreground">
            Sin datos todavía
          </p>
        ) : (
          <ChartContainer
            config={config}
            className="mx-auto aspect-square h-56"
            aria-label={data.map((d) => `${d.name}: ${d.value}`).join(', ')}
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
              <Pie
                data={data}
                dataKey="value"
                nameKey="key"
                innerRadius="62%"
                outerRadius="100%"
                stroke="var(--card)"
                strokeWidth={3}
              >
                {data.map((d) => (
                  <Cell key={d.key} fill={`var(--color-${d.key})`} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        )}
        <ul className="mt-5 flex flex-wrap justify-around gap-3 border-t border-border pt-4 text-sm">
          {data.map((d) => (
            <li key={d.key} className="flex items-center gap-2">
              <span
                className="size-2.5 rounded-full"
                style={{ background: config[d.key].color }}
                aria-hidden="true"
              />
              <span className="font-semibold text-foreground">{d.name}:</span>
              <span className="tabular-nums text-muted-foreground">{d.value}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
