// components/StatusBadge.tsx
import { ChangeStatus } from '@/types'

const styles: Record<ChangeStatus, string> = {
  'Pending':     'bg-amber-50 text-amber-800 border border-amber-200',
  'In Progress': 'bg-blue-50 text-blue-800 border border-blue-200',
  'Done':        'bg-green-50 text-green-800 border border-green-200',
}

export default function StatusBadge({ status }: { status: ChangeStatus }) {
  return (
    <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${styles[status]}`}>
      {status}
    </span>
  )
}