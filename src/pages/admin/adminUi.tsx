import { cn } from '../../components/ui'

export function CardChunk({ title, action, className, children }: { title?: string; action?: React.ReactNode; className?: string; children: React.ReactNode }) {
  return (
    <div className={cn('card p-5', className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-lg font-semibold text-graphite-900">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </div>
  )
}

export const th = 'px-4 py-3 text-left text-xs font-bold uppercase tracking-wider text-graphite-400'
export const td = 'px-4 py-3 text-sm text-graphite-700'

export function EmptyRow({ colSpan }: { colSpan: number }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-sm text-graphite-400">
        Нет данных
      </td>
    </tr>
  )
}