import { useEffect, useRef, useState } from "react";
import type { ComponentType } from "./Toolbar";
import ZoomControls from "./ZoomControls";
import type { GridCell, CanvasGridProps } from "../types";
import { GRID_CELL_SIZE_METERS, PIXELS_PER_METER, componentColors, componentSymbols } from "../constants/components";
import { getCellFromMouse } from "../utils/grid";
import { generateComponentId } from "../utils/idGenerator";
import "./CanvasGrid.css";

export default function CanvasGrid({
  rows = 0,
  cols = 0,
  selectedComponentType,
  onClear,
}: CanvasGridProps) {
  // Base cell size in pixels based on 0.6m
  const baseCellSize = GRID_CELL_SIZE_METERS * PIXELS_PER_METER;

  // Zoom state
  const [zoom, setZoom] = useState(1);

  
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const isPanningRef = useRef(false);
  const panStartPosRef = useRef<{ x: number; y: number } | null>(null);

  // Calculate actual cell size based on zoom
  const cellSize = baseCellSize * zoom;

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
    setZoom(1);
    setPan({ x: 0, y: 0 });
    isPanningRef.current = false;
    panStartPosRef.current = null;
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

      ctx.save();
      ctx.translate(rect.width / 2, rect.height / 2);
      ctx.scale(zoom, zoom);
      ctx.translate(pan.x, pan.y); 

      const totalWidth = cols * baseCellSize;
      const totalHeight = rows * baseCellSize;
      const startX = -totalWidth / 2;
      const startY = -totalHeight / 2;

      ctx.strokeStyle = "#8c9193";
      ctx.lineWidth = 1 / zoom;

      ctx.fillStyle = "#efe5c7";
      ctx.fillRect(startX, startY, totalWidth, totalHeight);

      for (let i = 0; i <= cols; i++) {
        const x = startX + i * baseCellSize;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + totalHeight);
        ctx.stroke();
      }

      for (let i = 0; i <= rows; i++) {
        const y = startY + i * baseCellSize;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + totalWidth, y);
        ctx.stroke();
      }

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = startX + col * baseCellSize;
          const y = startY + row * baseCellSize;

          if (
            isDragging &&
            dragStartCell &&
            row === dragStartCell.row &&
            col === dragStartCell.col
          ) {
            ctx.fillStyle = "rgba(33, 150, 243, 0.2)";
            ctx.fillRect(x + 1, y + 1, baseCellSize - 2, baseCellSize - 2);
            ctx.strokeStyle = "#2196F3";
            ctx.lineWidth = 2 / zoom;
            ctx.setLineDash([4 / zoom, 4 / zoom]);
            ctx.strokeRect(x + 2, y + 2, baseCellSize - 4, baseCellSize - 4);
            ctx.setLineDash([]);
            continue;
          }

          const cell = gridData[row]?.[col];
          if (cell?.invalid) {
            ctx.fillStyle = componentColors.invalid;
            ctx.fillRect(x + 1, y + 1, baseCellSize - 2, baseCellSize - 2);
            ctx.fillStyle = "#666";
            ctx.font = `${baseCellSize * 0.5}px "Material Icons"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(componentSymbols.invalid, x + baseCellSize / 2, y + baseCellSize / 2);
          }

          if (cell?.component) {
            const compType = cell.component.type;
            ctx.fillStyle = componentColors[compType];
            ctx.fillRect(x + 1, y + 1, baseCellSize - 2, baseCellSize - 2);
            ctx.fillStyle = "#fff";
            ctx.font = `${baseCellSize * 0.5}px "Material Icons"`;
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(componentSymbols[compType], x + baseCellSize / 2, y + baseCellSize / 2);
          }
        }
      }

      if (isDragging && dragCurrentCell) {
        const x = startX + dragCurrentCell.col * baseCellSize;
        const y = startY + dragCurrentCell.row * baseCellSize;
        const cell = gridData[dragCurrentCell.row]?.[dragCurrentCell.col];

        const isValidDrop =
          !cell?.invalid &&
          (!dragStartCell ||
            dragCurrentCell.row !== dragStartCell.row ||
            dragCurrentCell.col !== dragStartCell.col);

        if (isValidDrop) {
          ctx.fillStyle = "rgba(76, 175, 80, 0.3)";
          ctx.fillRect(x, y, baseCellSize, baseCellSize);
          ctx.strokeStyle = "#4CAF50";
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.strokeRect(x + 2, y + 2, baseCellSize - 4, baseCellSize - 4);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = "rgba(244, 67, 54, 0.3)";
          ctx.fillRect(x, y, baseCellSize, baseCellSize);
          ctx.strokeStyle = "#f44336";
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.strokeRect(x + 2, y + 2, baseCellSize - 4, baseCellSize - 4);
          ctx.setLineDash([]);
        }
      }

      if (!isDragging && hoveredCell) {
        const x = startX + hoveredCell.col * baseCellSize;
        const y = startY + hoveredCell.row * baseCellSize;
        const cell = gridData[hoveredCell.row]?.[hoveredCell.col];

        if (cell?.component || cell?.invalid) {
          ctx.fillStyle = "rgba(244, 67, 54, 0.2)";
          ctx.fillRect(x, y, baseCellSize, baseCellSize);
          ctx.strokeStyle = "#f44336";
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.strokeRect(x + 2, y + 2, baseCellSize - 4, baseCellSize - 4);
          ctx.setLineDash([]);
        } else {
          ctx.fillStyle = `${componentColors[selectedComponentType]}30`;
          ctx.fillRect(x, y, baseCellSize, baseCellSize);
          ctx.strokeStyle = componentColors[selectedComponentType];
          ctx.lineWidth = 2 / zoom;
          ctx.setLineDash([4 / zoom, 4 / zoom]);
          ctx.strokeRect(x + 2, y + 2, baseCellSize - 4, baseCellSize - 4);
          ctx.setLineDash([]);

          ctx.fillStyle = componentColors[selectedComponentType];
          ctx.fillRect(x + 3, y + 3, baseCellSize - 6, baseCellSize - 6);
          ctx.fillStyle = "#fff";
          ctx.font = `${baseCellSize * 0.5}px "Material Icons"`;
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(componentSymbols[selectedComponentType], x + baseCellSize / 2, y + baseCellSize / 2);
        }
      }

      if (selectedCell) {
        const x = startX + selectedCell.col * baseCellSize;
        const y = startY + selectedCell.row * baseCellSize;
        ctx.strokeStyle = "#f44336";
        ctx.lineWidth = 2 / zoom;
        ctx.strokeRect(x, y, baseCellSize, baseCellSize);
      }

      ctx.restore();


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

      if (isPanningRef.current && panStartPosRef.current) {
        const deltaX = (mouseX - panStartPosRef.current.x) / zoom;
        const deltaY = (mouseY - panStartPosRef.current.y) / zoom;
        setPan((prev) => ({
          x: prev.x + deltaX,
          y: prev.y + deltaY,
        }));
        panStartPosRef.current = { x: mouseX, y: mouseY };
        draw();
        return;
      }

      if (isDragging) {
        setDragMousePos({ x: mouseX, y: mouseY });

        const cell = getCellFromMouse(mouseX, mouseY, rect, zoom, pan.x, pan.y, rows, cols);
        setDragCurrentCell(cell);
      } else {
        const cell = getCellFromMouse(mouseX, mouseY, rect, zoom, pan.x, pan.y, rows, cols);
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

      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        isPanningRef.current = true;
        panStartPosRef.current = { x: mouseX, y: mouseY };
        canvas.style.cursor = "grabbing";
        return;
      }

      if (e.button !== 0) return;

      const cell = getCellFromMouse(mouseX, mouseY, rect, zoom, pan.x, pan.y, rows, cols);
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

      if (isPanningRef.current) {
        isPanningRef.current = false;
        panStartPosRef.current = null;
        canvas.style.cursor = "default";
        return;
      }

      if (e.button !== 0) return;

      if (!isDragging) {
        const rect = canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;
        const cell = getCellFromMouse(mouseX, mouseY, rect, zoom, pan.x, pan.y, rows, cols);

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
      const dropCell = getCellFromMouse(mouseX, mouseY, rect, zoom, pan.x, pan.y, rows, cols);

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
      if (isPanningRef.current) {
        isPanningRef.current = false;
        panStartPosRef.current = null;
        if (canvas) canvas.style.cursor = "default";
      }
      if (isDragging) {
        setIsDragging(false);
        setDraggedComponent(null);
        setDragStartCell(null);
        setDragCurrentCell(null);
        setDragMousePos(null);
        draw();
      }
    };

    const handleWheel = (e: WheelEvent) => {
      if (!canvas) return;
      e.preventDefault();

      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;
      const newZoom = Math.max(0.1, Math.min(5, zoom * zoomFactor));

      setZoom(newZoom);
    };

    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    canvas.addEventListener("mousemove", handleMouseMove);
    canvas.addEventListener("mousedown", handleMouseDown);
    canvas.addEventListener("mouseup", handleMouseUp);
    canvas.addEventListener("mouseleave", handleMouseLeave);
    canvas.addEventListener("wheel", handleWheel, { passive: false });
    canvas.addEventListener("contextmenu", handleContextMenu);

    return () => {
      window.removeEventListener("resize", resize);
      if (canvas) {
        canvas.removeEventListener("mousemove", handleMouseMove);
        canvas.removeEventListener("mousedown", handleMouseDown);
        canvas.removeEventListener("mouseup", handleMouseUp);
        canvas.removeEventListener("mouseleave", handleMouseLeave);
        canvas.removeEventListener("wheel", handleWheel);
        canvas.removeEventListener("contextmenu", handleContextMenu);
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
    zoom,
    pan,
  ]);

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(5, prev * 1.2));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(0.1, prev / 1.2));
  };

  return (
    <div className="canvas-grid-container">
      <ZoomControls onZoomIn={handleZoomIn} onZoomOut={handleZoomOut} />
      <canvas
        ref={canvasRef}
        className="canvas-grid-canvas"
        style={{
          cursor: isPanningRef.current ? "grabbing" : isDragging ? "grabbing" : "default",
        }}
      />
    </div>
  );
}
