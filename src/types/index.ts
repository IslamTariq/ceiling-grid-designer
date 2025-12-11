import type { ComponentType } from "../components/Toolbar";

export interface GridCell {
  component?: {
    type: ComponentType;
    id: string;
  };
  invalid?: boolean;
}

export interface CanvasGridProps {
  rows: number;
  cols: number;
  selectedComponentType: ComponentType;
  onClear?: (clearFn: () => void) => void;
}

