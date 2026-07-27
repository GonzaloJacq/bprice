import { cn } from "@/shared/lib/utils"

interface HistoryChartPlaceholderPoint {
  label: string
  value: number
}

interface HistoryChartPlaceholderProps {
  points: HistoryChartPlaceholderPoint[]
  className?: string
}

const VIEWBOX_WIDTH = 100
const VIEWBOX_HEIGHT = 40
const VERTICAL_PADDING = 4

/**
 * Gráfico de evolución de precio construido con un SVG simple (sin
 * dependencia de una librería de charts) a partir de puntos ya calculados.
 */
export function HistoryChartPlaceholder({ points, className }: HistoryChartPlaceholderProps) {
  const values = points.map((point) => point.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1
  const stepX = points.length > 1 ? VIEWBOX_WIDTH / (points.length - 1) : 0
  const plotHeight = VIEWBOX_HEIGHT - VERTICAL_PADDING * 2

  const coordinates = points.map((point, index) => ({
    x: index * stepX,
    y: VERTICAL_PADDING + plotHeight - ((point.value - min) / range) * plotHeight,
  }))

  const linePath = coordinates
    .map((coordinate, index) => `${index === 0 ? "M" : "L"}${coordinate.x},${coordinate.y}`)
    .join(" ")
  const lastCoordinate = coordinates[coordinates.length - 1]
  const areaPath = `${linePath} L${lastCoordinate.x},${VIEWBOX_HEIGHT} L0,${VIEWBOX_HEIGHT} Z`

  return (
    <div className={cn("w-full", className)}>
      <svg
        viewBox={`0 0 ${VIEWBOX_WIDTH} ${VIEWBOX_HEIGHT}`}
        preserveAspectRatio="none"
        className="h-40 w-full"
        role="img"
        aria-label="Evolución de precio"
      >
        <path d={areaPath} className="fill-primary/10" />
        <path
          d={linePath}
          className="fill-none stroke-primary"
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
        />
        {coordinates.map((coordinate, index) => (
          <circle
            key={points[index].label}
            cx={coordinate.x}
            cy={coordinate.y}
            r={1.2}
            vectorEffect="non-scaling-stroke"
            className="fill-primary"
          />
        ))}
      </svg>
      <div className="mt-2 flex justify-between text-xs text-muted-foreground">
        {points.map((point) => (
          <span key={point.label}>{point.label}</span>
        ))}
      </div>
    </div>
  )
}
