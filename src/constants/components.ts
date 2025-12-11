import type { ComponentType } from "../components/Toolbar";

export const GRID_CELL_SIZE_METERS = 0.6;
export const PIXELS_PER_METER = 100;

export interface ComponentConfig {
  id: ComponentType;
  name: string;
  color: string;
  iconName: string;
}

export const COMPONENT_CONFIGS: ComponentConfig[] = [
  { id: "light", name: "Light", color: "#F57C00", iconName: "lightbulb" },
  { id: "airSupply", name: "Air Supply", color: "#2196F3", iconName: "arrow_upward" },
  { id: "airReturn", name: "Air Return", color: "#4CAF50", iconName: "arrow_downward" },
  { id: "smokeDetector", name: "Smoke Detector", color: "#FF5722", iconName: "sensors" },
  { id: "invalid", name: "Invalid Grid", color: "#9E9E9E", iconName: "block" },
];

export const componentColors: Record<ComponentType, string> = {
  light: "#F57C00",
  airSupply: "#2196F3",
  airReturn: "#4CAF50",
  smokeDetector: "#FF5722",
  invalid: "#9E9E9E",
};

export const componentSymbols: Record<ComponentType, string> = {
  light: "lightbulb",
  airSupply: "arrow_upward",
  airReturn: "arrow_downward",
  smokeDetector: "sensors",
  invalid: "block",
};

