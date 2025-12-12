export type ComponentType = "light" | "airSupply" | "airReturn" | "smokeDetector" | "invalid";

import { COMPONENT_CONFIGS } from "../constants/components";
import GridDimensions from "./GridDimensions";
import "./Toolbar.css";

interface ToolbarProps {
  selectedComponentType: ComponentType;
  onComponentTypeChange: (componentType: ComponentType) => void;
  onClear: () => void;
  onClearGrid: () => void;
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  onResetDimensions?: () => void;
}

export default function Toolbar({
  selectedComponentType,
  onComponentTypeChange,
  onClear,
  onClearGrid,
  rows,
  cols,
  onRowsChange,
  onColsChange,
  onResetDimensions,
}: ToolbarProps) {
  return (
    <div className="toolbar-container">
      <GridDimensions
        rows={rows}
        cols={cols}
        onRowsChange={onRowsChange}
        onColsChange={onColsChange}
        onReset={onResetDimensions}
      />
      <div className="toolbar-separator" />
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
      <button className="toolbar-button clear-button" onClick={onClearGrid} title="Clear Grid">
        <i className="material-icons toolbar-icon">clear_all</i>
        <span className="toolbar-text">Clear Grid</span>
      </button>
      <button className="toolbar-button clear-button" onClick={onClear} title="Reset Everything">
        <i className="material-icons toolbar-icon">refresh</i>
        <span className="toolbar-text">Reset All</span>
      </button>
    </div>
  );
}
