import React from 'react';

/**
 * Reusable StatsCard component that can be configured for different dashboards
 * @param {Object} props
 * @param {Array} props.cards - Array of card objects with icon, label, value, bgColor, and textColor
 * @param {string} props.layout - Layout style: 'grid-2' (2 columns), 'grid-4' (4 columns), or 'auto' (responsive)
 */
function StatsCard({ cards, layout = 'auto' }) {
  // Determine grid layout class based on the layout prop
  let gridClass = '';
  switch (layout) {
    case 'grid-2':
      gridClass = 'grid-cols-1 md:grid-cols-2';
      break;
    case 'grid-4':
      gridClass = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4';
      break;
    case 'auto':
    default:
      // Auto layout based on number of cards
      const cols = Math.min(cards.length, 4);
      gridClass = `grid-cols-1 ${cols > 1 ? 'sm:grid-cols-2' : ''} ${cols > 2 ? 'lg:grid-cols-' + cols : ''}`;
  }

  return (
    <div className={`grid ${gridClass} gap-4 mb-8`}>
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
  );
}

export default StatsCard;
