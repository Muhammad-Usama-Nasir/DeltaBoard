// components/ChangeRow.tsx
'use client'
import { Change, ChangeStatus } from '@/types'

interface Props {
  change: Change
  onStatusChange: (change: Change, status: ChangeStatus) => void
  onDelete: (change: Change) => void
}

const selectStyles: Record<ChangeStatus, string> = {
  'Pending':     'bg-amber-50 text-amber-800 border-amber-300',
  'In Progress': 'bg-blue-50 text-blue-800 border-blue-300',
  'Done':        'bg-green-50 text-green-800 border-green-300',
}

export default function ChangeRow({ change, onStatusChange, onDelete }: Props) {
  const statuses: ChangeStatus[] = ['Pending', 'In Progress', 'Done']

  return (
    <div className="grid grid-cols-[1fr_100px_140px_32px] gap-3 items-center py-3 border-b border-gray-200 last:border-0">

      {/* Title + meta */}
      <div>
        <p className="text-sm font-medium text-gray-900">{change.title}</p>
        <p className="text-xs text-gray-400 mt-0.5">
          {change.requestedBy} · {change.dateRequested}
          {change.description && ` · ${change.description}`}
        </p>
      </div>

      {/* Value */}
      <p className="text-sm font-medium text-gray-900 text-right">
        ${change.value.toLocaleString()}
      </p>

      {/* Single status selector — colored to match status */}
      <select
        value={change.status}
        onChange={(e) => onStatusChange(change, e.target.value as ChangeStatus)}
        className={`text-xs border rounded-md px-2 py-1.5 cursor-pointer focus:outline-none font-medium ${selectStyles[change.status]}`}
      >
        {statuses.map((s) => (
          <option key={s} value={s}>{s}</option>
        ))}
      </select>

      {/* Delete */}
      <button
        onClick={() => onDelete(change)}
        className="text-gray-300 hover:text-red-400 transition-colors text-lg leading-none"
      >
        ×
      </button>
    </div>
  )
}