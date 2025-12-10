import { useEffect, useRef, useState } from "react";

interface props {
    rows: number;
    cols: number;
    cellSize: number;
}

export default function CanvasGrid ({ rows = 0, cols = 0, cellSize = 40}: props) {

    const [gridData, setGridData] = useState<boolean[][]>([]);
    const [hoveredCell, setHoveredCell] = useState<{row: number, col: number} | null>(null);
    const [selectedCell, setSelectedCell] = useState<{row: number, col: number} | null>(null);

    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const rafRef = useRef<number>();


    const getCellFromMouse = (mouseX: number, mouseY: number, canvasRect: DOMRect ) => {

        const totalWidth = cols * cellSize;
        const totalHeight = rows * cellSize;
        const startX = (canvasRect.width - totalWidth) / 2;
        const startY = (canvasRect.height - totalHeight) / 2;

        if (mouseX < startX || mouseX > startX + totalWidth || mouseY < startY || mouseY > startY + totalHeight)
        {
            return null;
        }

        const col = Math.floor((mouseX - startX) / cellSize);
        const row = Math.floor((mouseY - startY) / cellSize);

        if (row >= 0 && row< rows && col >= 0 && col < cols)
        {
            return { row, col};
        }

        return null


    } 

    





useEffect(() => {
    setGridData(Array(rows).fill(null).map(() => Array(cols).fill(false)));
}, [rows, cols]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");
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
    ctx.lineWidth= 1;

    ctx.fillStyle = "lightgray";
    ctx.fillRect(startX, startY, totalWidth, totalHeight);

    for (let i = 0; i <= cols; i++)
    {
        const x = startX + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(x, startY);
        ctx.lineTo(x, startY + totalHeight);
        ctx.stroke();
        
    }

    for (let i = 0; i <= rows; i++)
    {
       const y = startY + i * cellSize;
        ctx.beginPath();
        ctx.moveTo(startX, y);
        ctx.lineTo(startX + totalWidth, y);
        ctx.stroke(); 
    }

    for (let row = 0; row< rows; row++)
    {
        for (let col = 0; col< cols; col++)
        {
            if (gridData[row]?.[col]) {
                const x = startX + col * cellSize;
                const y = startY + row * cellSize;
                ctx.fillStyle = "blue";
                ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
            }
        }
    }

    if (hoveredCell) {
        const x = startX + hoveredCell.col * cellSize;
        const y = startY + hoveredCell.row * cellSize;
        ctx.fillStyle = "green";
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }

    if (selectedCell) {
        const x = startX + selectedCell.col * cellSize;
        const y = startY + selectedCell.row * cellSize;
        ctx.fillStyle = "red";
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
    }
};
 const resize = () =>{
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
            draw();
        };
   
         resize();
        window.addEventListener("resize", resize);

        const handleMouseMove = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const cell = getCellFromMouse(mouseX, mouseY, rect);
    setHoveredCell(cell);
    
    draw();
};

const handleMouseClick = (e: MouseEvent) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const cell = getCellFromMouse(mouseX, mouseY, rect);
    if (cell) {
        setSelectedCell(cell);
    
        setGridData(prev => {
            const newData = [...prev];
            newData[cell.row] = [...newData[cell.row]];
            newData[cell.row][cell.col] = !newData[cell.row][cell.col];
            return newData;
        });
        draw();
    }
};


canvas.addEventListener('mousemove', handleMouseMove);
canvas.addEventListener('click', handleMouseClick);

        return () => {
            window.removeEventListener("resize", resize);
            cancelAnimationFrame(rafRef.current);
            canvas.removeEventListener('mousemove', handleMouseMove);
            canvas.removeEventListener('click', handleMouseClick);
        };
    }, [rows, cols, cellSize, gridData, hoveredCell, selectedCell]);


    return (
    <div style={{ width: "100%", height: "calc(100vh - 50px)" }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",     
          height: "100%",   
          display: "block"   
        }}
      />
    </div>
  );
    
}