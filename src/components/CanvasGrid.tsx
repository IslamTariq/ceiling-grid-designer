import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "./Toolbar";

interface GridCell {
  component?: {
    type: ComponentType;
    id: string;
  };
  invalid?: boolean;
}

interface props {
  rows: number;
  cols: number;
  cellSize: number;
  selectedComponentType: ComponentType;
  onClear?: (clearFn: () => void) => void;
}

const componentColors: Record<ComponentType, string> = {
  light: "#F57C00",
  airSupply: "#2196F3",
  airReturn: "#4CAF50",
  smokeDetector: "#FF5722",
  invalid: "#9E9E9E",
};


const componentSymbols: Record<ComponentType, string> = {
  light: "lightbulb",
  airSupply: "arrow_upward",
  airReturn: "arrow_downward",
  smokeDetector: "sensors",
  invalid: "block",
};

let componentIdCounter = 0;
const generateComponentId = () => `comp-${componentIdCounter++}`;

export default function CanvasGrid({
  rows = 0,
  cols = 0,
  cellSize = 40,
  selectedComponentType,
  onClear,
}: props) {
  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number>();

  const getCellFromMouse = (mouseX: number, mouseY: number, canvasRect: DOMRect) => {
    const totalWidth = cols * cellSize;
    const totalHeight = rows * cellSize;
    const startX = (canvasRect.width - totalWidth) / 2;
    const startY = (canvasRect.height - totalHeight) / 2;

    if (
      mouseX < startX ||
      mouseX > startX + totalWidth ||
      mouseY < startY ||
      mouseY > startY + totalHeight
    ) {
      return null;
    }

    const col = Math.floor((mouseX - startX) / cellSize);
    const row = Math.floor((mouseY - startY) / cellSize);

    if (row >= 0 && row < rows && col >= 0 && col < cols) {
      return { row, col };
    }

    return null;
  };

  const clearGrid = () => {
    setGridData(
      Array(rows)
        .fill(null)
        .map(() => Array(cols).fill(null).map(() => ({} as GridCell)))
    );
    setSelectedCell(null);
    setHoveredCell(null);
  };

  useEffect(() => {
    clearGrid();
  }, [rows, cols]);


  useEffect(() => {
    if (onClear) {
      onClear(clearGrid);
    }
  }, [onClear]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const draw = () => {
      if (!ctx || !canvas) return;

      const rect = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, rect.width, rect.height);

      const totalWidth = cols * cellSize;
      const totalHeight = rows * cellSize;

      const startX = (rect.width - totalWidth) / 2;
      const startY = (rect.height - totalHeight) / 2;

      ctx.strokeStyle = "black";
      ctx.lineWidth = 1;

      ctx.fillStyle = "lightgray";
      ctx.fillRect(startX, startY, totalWidth, totalHeight);

      for (let i = 0; i <= cols; i++) {
        const x = startX + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + totalHeight);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        const y = startY + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + totalWidth, y);
        ctx.stroke();
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const cell = gridData[row]?.[col];
          const x = startX + col * cellSize;
          const y = startY + row * cellSize;

          if (cell?.invalid) {
            ctx.fillStyle = componentColors.invalid;
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            ctx.fillStyle = "#666";
            ctx.font = `${cellSize * 0.5}px "Material Icons"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(componentSymbols.invalid, x + cellSize / 2, y + cellSize / 2);
          }

          if (cell?.component) {
            const compType = cell.component.type;
            ctx.fillStyle = componentColors[compType];
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            ctx.fillStyle = "#fff";
            ctx.font = `${cellSize * 0.5}px "Material Icons"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(componentSymbols[compType], x + cellSize / 2, y + cellSize / 2);
          }
        }
      }

      if (hoveredCell) {
        const x = startX + hoveredCell.col * cellSize;
        const y = startY + hoveredCell.row * cellSize;
        const cell = gridData[hoveredCell.row]?.[hoveredCell.col];
        
        if (cell?.component || cell?.invalid) {
          ctx.fillStyle = "rgba(244, 67, 54, 0.2)";
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = "#f44336";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = `${componentColors[selectedComponentType]}30`;
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = componentColors[selectedComponentType];
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);

          ctx.fillStyle = componentColors[selectedComponentType];
          ctx.fillRect(x + 3, y + 3, cellSize - 6, cellSize - 6);
          ctx.fillStyle = "#fff";
          ctx.font = `${cellSize * 0.5}px "Material Icons"`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(componentSymbols[selectedComponentType], x + cellSize / 2, y + cellSize / 2);
        }
      }

      if (selectedCell) {
        const x = startX + selectedCell.col * cellSize;
        const y = startY + selectedCell.row * cellSize;
        ctx.strokeStyle = "#f44336";
        ctx.lineWidth = 2;
        ctx.strokeRect(x, y, cellSize, cellSize);
      }
    };

    const resize = () => {
      if (!canvas || !ctx) return;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.scale(dpr, dpr);
      draw();
    };

    resize();
    window.addEventListener("resize", resize);

    const handleMouseMove = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cell = getCellFromMouse(mouseX, mouseY, rect);
      setHoveredCell(cell);

      draw();
    };

    const handleMouseClick = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cell = getCellFromMouse(mouseX, mouseY, rect);
      if (cell) {
        setSelectedCell(cell);
        const currentCell = gridData[cell.row]?.[cell.col];

        if (currentCell?.component || currentCell?.invalid) {
          setGridData((prev) => {
            const newData = [...prev];
            newData[cell.row] = [...newData[cell.row]];
            newData[cell.row][cell.col] = {};
            return newData;
          });
        } else {
          setGridData((prev) => {
            const newData = [...prev];
            newData[cell.row] = [...newData[cell.row]];
            if (selectedComponentType === "invalid") {
              newData[cell.row][cell.col] = { invalid: true };
            } else {
              newData[cell.row][cell.col] = {
                component: {
                  type: selectedComponentType,
                  id: generateComponentId(),
                },
              };
            }
            return newData;
          });
        }
        draw();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("click", handleMouseClick);

    return () => {
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("click", handleMouseClick);
      }
    };
  }, [rows, cols, cellSize, gridData, hoveredCell, selectedCell, selectedComponentType]);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 80px)", flex: 1 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
    </div>
  );
}
