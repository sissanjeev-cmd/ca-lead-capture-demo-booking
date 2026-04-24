const COLOR_MAP = {
  blue: 'from-blue-500 to-blue-600',
  green: 'from-green-500 to-green-600',
  purple: 'from-purple-500 to-purple-600',
  orange: 'from-orange-500 to-orange-600',
  red: 'from-red-500 to-red-600',
  indigo: 'from-indigo-500 to-indigo-600',
};

export default function ModuleCard({ module }) {
  const gradient = COLOR_MAP[module.color] || COLOR_MAP.blue;
  
  return (
    <div className="group cursor-pointer">
      <div className={`bg-gradient-to-br ${gradient} p-8 rounded-lg shadow-sm hover:shadow-lg transition-shadow h-full`}>
        <div className="text-white">
          <h3 className="text-xl font-bold mb-2">{module.title}</h3>
          <p className="text-sm opacity-90 mb-4">{module.desc}</p>
          <div className="flex items-center text-sm opacity-75 group-hover:opacity-100 transition-opacity">
            Click to open →
          </div>
        </div>
      </div>
    </div>
  );
}
