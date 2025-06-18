import { Button } from "@/components/ui/button";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const tabs = [
  { id: "todos", label: "Todos os Artistas" },
  { id: "cantor", label: "Cantores" },
  { id: "beatmaker", label: "Beatmakers" },
  { id: "compositor", label: "Compositores" },
  { id: "mixer", label: "Mixers" },
  { id: "editor", label: "Editores" },
];

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex justify-center mb-8">
        <div className="flex flex-wrap gap-2 rounded-full p-1 bg-card border border-border">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? "default" : "ghost"}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </div>
    </section>
  );
}
