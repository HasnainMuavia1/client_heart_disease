import { FaClipboardList, FaUserFriends, FaCalendarCheck, FaStar } from "react-icons/fa"

function StatsCards({ stats }) {
  const cards = [
    {
      icon: FaClipboardList,
      label: "Total Reports",
      value: stats.totalReports,
      bgColor: "bg-red-100",
      textColor: "text-red-600",
    },
    {
      icon: FaUserFriends,
      label: "Total Patients",
      value: stats.totalPatients,
      bgColor: "bg-blue-100",
      textColor: "text-blue-600",
    },
    {
      icon: FaCalendarCheck,
      label: "Appointments",
      value: stats.totalAppointments,
      bgColor: "bg-green-100",
      textColor: "text-green-600",
    },
    {
      icon: FaStar,
      label: "Rating",
      value: stats.rating,
      bgColor: "bg-yellow-100",
      textColor: "text-yellow-600",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className={`p-3 rounded-full ${card.bgColor}`}>
              <card.icon className={`w-6 h-6 ${card.textColor}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">{card.label}</p>
              <h3 className="text-2xl font-bold text-gray-700">{card.value}</h3>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default StatsCards

