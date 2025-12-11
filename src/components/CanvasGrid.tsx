import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "./Toolbar";

const gridCellSizeMeters = 0.6;
const pixelsPerMeter = 100;

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
  selectedComponentType,
  onClear,
}: props) {
  // cell size in pixels based on 0.6m
  const cellSize = gridCellSizeMeters * pixelsPerMeter;

  const [gridData, setGridData] = useState<GridCell[][]>([]);
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);

  const [isDragging, setIsDragging] = useState(false);
  const [draggedComponent, setDraggedComponent] = useState<{
    type: ComponentType;
    id: string;
  } | null>(null);
  const [dragStartCell, setDragStartCell] = useState<{ row: number; col: number } | null>(null);
  const [dragCurrentCell, setDragCurrentCell] = useState<{ row: number; col: number } | null>(null);
  const [dragMousePos, setDragMousePos] = useState<{ x: number; y: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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
        .map(() =>
          Array(cols)
            .fill(null)
            .map(() => ({}) as GridCell)
        )
    );
    setSelectedCell(null);
    setHoveredCell(null);
    setIsDragging(false);
    setDraggedComponent(null);
    setDragStartCell(null);
    setDragCurrentCell(null);
    setDragMousePos(null);
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

      ctx.strokeStyle = "#8c9193";
      ctx.lineWidth = 1;

      ctx.fillStyle = "#efe5c7";
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
          const x = startX + col * cellSize;
          const y = startY + row * cellSize;

          if (
            isDragging &&
            dragStartCell &&
            row === dragStartCell.row &&
            col === dragStartCell.col
          ) {
            ctx.fillStyle = "rgba(33, 150, 243, 0.2)";
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            ctx.strokeStyle = "#2196F3";
            ctx.lineWidth = 2;
            ctx.setLineDash([4, 4]);
            ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
            ctx.setLineDash([]);
            continue;
          }

          const cell = gridData[row]?.[col];
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

      if (isDragging && draggedComponent && dragMousePos) {
        const previewSize = cellSize * 0.8;
        const previewX = dragMousePos.x - previewSize / 2;
        const previewY = dragMousePos.y - previewSize / 2;

        ctx.fillStyle = `${componentColors[draggedComponent.type]}CC`;
        ctx.fillRect(previewX, previewY, previewSize, previewSize);
        ctx.strokeStyle = componentColors[draggedComponent.type];
        ctx.lineWidth = 2;
        ctx.strokeRect(previewX, previewY, previewSize, previewSize);

        ctx.fillStyle = "#fff";
        ctx.font = `${previewSize * 0.5}px "Material Icons"`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(
          componentSymbols[draggedComponent.type],
          previewX + previewSize / 2,
          previewY + previewSize / 2
        );
      }

      if (isDragging && dragCurrentCell) {
        const x = startX + dragCurrentCell.col * cellSize;
        const y = startY + dragCurrentCell.row * cellSize;
        const cell = gridData[dragCurrentCell.row]?.[dragCurrentCell.col];

        const isValidDrop =
          !cell?.invalid &&
          (!dragStartCell ||
            dragCurrentCell.row !== dragStartCell.row ||
            dragCurrentCell.col !== dragStartCell.col);

        if (isValidDrop) {
          ctx.fillStyle = "rgba(76, 175, 80, 0.3)";
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = "#4CAF50";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = "rgba(244, 67, 54, 0.3)";
          ctx.fillRect(x, y, cellSize, cellSize);
          ctx.strokeStyle = "#f44336";
          ctx.lineWidth = 2;
          ctx.setLineDash([4, 4]);
          ctx.strokeRect(x + 2, y + 2, cellSize - 4, cellSize - 4);
          ctx.setLineDash([]);
        }
      }

      if (!isDragging && hoveredCell) {
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

      if (isDragging) {
        setDragMousePos({ x: mouseX, y: mouseY });

        const cell = getCellFromMouse(mouseX, mouseY, rect);
        setDragCurrentCell(cell);
      } else {
        const cell = getCellFromMouse(mouseX, mouseY, rect);
        setHoveredCell(cell);

        if (cell) {
          const hoveredCellData = gridData[cell.row]?.[cell.col];
          if (hoveredCellData?.component) {
            canvas.style.cursor = "grab";
          } else {
            canvas.style.cursor = "default";
          }
        } else {
          canvas.style.cursor = "default";
        }
      }

      draw();
    };

    const handleMouseDown = (e: MouseEvent) => {
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const cell = getCellFromMouse(mouseX, mouseY, rect);
      if (cell) {
        const currentCell = gridData[cell.row]?.[cell.col];

        if (currentCell?.component) {
          setIsDragging(true);
          setDraggedComponent(currentCell.component);
          setDragStartCell(cell);
          setDragCurrentCell(cell);
          setDragMousePos({ x: mouseX, y: mouseY });
          setHoveredCell(null);
        }
      }
    };

    const handleMouseUp = (e: MouseEvent) => {
      if (!canvas) return;

      if (!isDragging) {
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
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const dropCell = getCellFromMouse(mouseX, mouseY, rect);

      if (dropCell && draggedComponent && dragStartCell) {
        const targetCell = gridData[dropCell.row]?.[dropCell.col];

        const isValidDrop =
          !targetCell?.invalid &&
          (dropCell.row !== dragStartCell.row || dropCell.col !== dragStartCell.col);

        if (isValidDrop) {
          setGridData((prev) => {
            const newData = [...prev];
            newData[dragStartCell.row] = [...newData[dragStartCell.row]];
            newData[dragStartCell.row][dragStartCell.col] = {};

            newData[dropCell.row] = [...newData[dropCell.row]];
            newData[dropCell.row][dropCell.col] = {
              component: {
                type: draggedComponent.type,
                id: draggedComponent.id,
              },
            };

            return newData;
          });
        }
      }

      setIsDragging(false);
      setDraggedComponent(null);
      setDragStartCell(null);
      setDragCurrentCell(null);
      setDragMousePos(null);
      draw();
    };

    const handleMouseLeave = () => {
      if (isDragging) {
        setIsDragging(false);
        setDraggedComponent(null);
        setDragStartCell(null);
        setDragCurrentCell(null);
        setDragMousePos(null);
        draw();
      }
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
    };
  }, [
    rows,
    cols,
    gridData,
    hoveredCell,
    selectedCell,
    selectedComponentType,
    isDragging,
    draggedComponent,
    dragStartCell,
    dragCurrentCell,
    dragMousePos,
  ]);

  return (
    <div style={{ width: "100%", height: "calc(100vh - 80px)", flex: 1 }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
          cursor: isDragging ? "grabbing" : "default",
          userSelect: "none",
        }}
      />
    </div>
  );
}
