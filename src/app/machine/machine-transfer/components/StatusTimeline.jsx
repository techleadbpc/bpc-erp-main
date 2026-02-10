import { CheckCircle, Clock, AlertCircle } from "lucide-react"

export default function StatusTimeline({ history }) {
  if (!history || history.length === 0) {
    return null
  }

  return (
    <div className="space-y-4 mt-4">
      <h3 className="text-lg font-medium">Request Timeline</h3>
      <ol className="relative border-l border-gray-200 dark:border-gray-700">
        {history.map((item, index) => {
          const isRejected = item.status.includes("Rejected")
          const isCompleted =
            !isRejected && (item.status === "Received" || item.status === "Approved" || item.status === "In Transit")

          return (
            <li key={index} className="mb-6 ml-6">
              <span className="absolute flex items-center justify-center w-6 h-6 rounded-full -left-3 ring-8 ring-white dark:ring-gray-900">
                {isRejected ? (
                  <AlertCircle className="w-4 h-4 text-red-500" />
                ) : isCompleted ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <Clock className="w-4 h-4 text-blue-500" />
                )}
              </span>
              <div className="p-4 bg-white border border-gray-200 rounded-lg shadow-sm dark:bg-gray-800 dark:border-gray-700">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{item.status}</h3>
                  <time className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(item.timestamp).toLocaleString()}
                  </time>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{item.notes}</p>
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">By: {item.userName}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}

