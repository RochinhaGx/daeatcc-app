import { Home, BarChart3, Settings, Waves } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const TabNavigation = ({ activeTab, onTabChange }: TabNavigationProps) => {
  const tabs = [
    { id: "home", name: "Home", icon: Home },
    { id: "sensors", name: "Sensores", icon: Waves },
    { id: "history", name: "Histórico", icon: BarChart3 },
    { id: "settings", name: "Config", icon: Settings }
  ];

  return (
    <div className="bg-card border-t border-border">
      <div className="w-full max-w-sm mx-auto">
        <div className="flex items-center justify-around py-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`tab-item ${activeTab === tab.id ? "active" : ""}`}
            >
              <tab.icon className="h-5 w-5 mb-1" />
              <span className="text-xs font-medium">{tab.name}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;