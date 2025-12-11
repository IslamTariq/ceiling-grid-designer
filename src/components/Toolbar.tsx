export type ComponentType = "light" | "airSupply" | "airReturn" | "smokeDetector" | "invalid";

interface ToolbarProps {
  selectedComponentType: ComponentType;
  onComponentTypeChange: (componentType: ComponentType) => void;
  onClear: () => void;
}

const componentTypes: {
  id: ComponentType;
  name: string;
  color: string;
  iconName: string;
}[] = [
  { id: "light", name: "Light", color: "#F57C00", iconName: "lightbulb" },
  { id: "airSupply", name: "Air Supply", color: "#2196F3", iconName: "arrow_upward" },
  { id: "airReturn", name: "Air Return", color: "#4CAF50", iconName: "arrow_downward" },
  { id: "smokeDetector", name: "Smoke Detector", color: "#FF5722", iconName: "sensors" },
  { id: "invalid", name: "Invalid Grid", color: "#9E9E9E", iconName: "block" },
];

import "./Toolbar.css";

export default function Toolbar({
  selectedComponentType,
  onComponentTypeChange,
  onClear,
}: ToolbarProps) {
  return (
    <div className="toolbar-container">
      {componentTypes.map((component) => (
        <button
          key={component.id}
          className={`toolbar-button ${selectedComponentType === component.id ? "selected" : ""}`}
          onClick={() => onComponentTypeChange(component.id)}
          title={component.name}
          style={
            {
              "--component-color": component.color,
              "--hover-bg": `${component.color}15`,
            } as React.CSSProperties
          }
        >
          <i className="material-icons toolbar-icon">{component.iconName}</i>
          <span className="toolbar-text">{component.name}</span>
        </button>
      ))}
      <div className="toolbar-separator" />
      <button className="toolbar-button clear-button" onClick={onClear} title="Clear Grid">
        <i className="material-icons toolbar-icon">clear_all</i>
        <span className="toolbar-text">Clear</span>
      </button>
    </div>
  );
}
