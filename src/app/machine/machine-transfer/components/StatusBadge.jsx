import { STATUS } from "../contexts/TransferContext"

export default function StatusBadge({ status }) {
  const getStatusColor = () => {
    switch (status) {
      case STATUS.PENDING_PM:
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case STATUS.PENDING_MECHANICAL:
        return "bg-blue-100 text-blue-800 border-blue-200"
      case STATUS.AWAITING_SOURCE_PM:
        return "bg-purple-100 text-purple-800 border-purple-200"
      case STATUS.APPROVED:
        return "bg-green-100 text-green-800 border-green-200"
      case STATUS.REJECTED:
        return "bg-red-100 text-red-800 border-red-200"
      case STATUS.IN_TRANSIT:
        return "bg-orange-100 text-orange-800 border-orange-200"
      case STATUS.RECEIVED:
        return "bg-emerald-100 text-emerald-800 border-emerald-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStatusColor()}`}
    >
      {status}
    </span>
  )
}

