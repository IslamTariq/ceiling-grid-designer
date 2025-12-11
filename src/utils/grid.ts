import { GRID_CELL_SIZE_METERS, PIXELS_PER_METER } from "../constants/components";

export const getCellFromMouse = (
  mouseX: number,
  mouseY: number,
  canvasRect: DOMRect,
  zoom: number,
  panX: number,
  panY: number,
  rows: number,
  cols: number
): { row: number; col: number } | null => {
  const baseCellSize = GRID_CELL_SIZE_METERS * PIXELS_PER_METER;
  const centerX = canvasRect.width / 2;
  const centerY = canvasRect.height / 2;
  
  const worldX = (mouseX - centerX) / zoom - panX;
  const worldY = (mouseY - centerY) / zoom - panY;

  const totalWidth = cols * baseCellSize;
  const totalHeight = rows * baseCellSize;
  const startX = -totalWidth / 2;
  const startY = -totalHeight / 2;

  if (
    worldX < startX ||
    worldX > startX + totalWidth ||
    worldY < startY ||
    worldY > startY + totalHeight
  ) {
    return null;
  }

  const col = Math.floor((worldX - startX) / baseCellSize);
  const row = Math.floor((worldY - startY) / baseCellSize);

  if (row >= 0 && row < rows && col >= 0 && col < cols) {
    return { row, col };
  }

  return null;
};

