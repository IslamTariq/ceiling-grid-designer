export type ComponentType = "light" | "airSupply" | "airReturn" | "smokeDetector" | "invalid";

import { COMPONENT_CONFIGS } from "../constants/components";
import "./Toolbar.css";

interface ToolbarProps {
  selectedComponentType: ComponentType;
  onComponentTypeChange: (componentType: ComponentType) => void;
  onClear: () => void;
}

export default function Toolbar({
  selectedComponentType,
  onComponentTypeChange,
  onClear,
}: ToolbarProps) {
  return (
    <div className="toolbar-container">
      {COMPONENT_CONFIGS.map((component) => (
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
      <button className="toolbar-button clear-button" onClick={onClear} title="Reset Everything">
        <i className="material-icons toolbar-icon">refresh</i>
        <span className="toolbar-text">Reset</span>
      </button>
    </div>
  );
}
