import CanvasGrid from "./components/CanvasGrid";
import { useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import type { ComponentType } from "./components/Toolbar";

const DEFAULT_ROWS = 10;
const DEFAULT_COLS = 10;

function App() {
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType>("light");
  const [rows, setRows] = useState(DEFAULT_ROWS);
  const [cols, setCols] = useState(DEFAULT_COLS);
  const clearGridRef = useRef<(() => void) | null>(null);
  const clearGridOnlyRef = useRef<(() => void) | null>(null);

  const handleClear = () => {
    if (clearGridRef.current) {
      clearGridRef.current();
    }
  };

  const handleClearGrid = () => {
    if (clearGridOnlyRef.current) {
      clearGridOnlyRef.current();
    }
  };

  const handleResetDimensions = () => {
    setRows(DEFAULT_ROWS);
    setCols(DEFAULT_COLS);
  };

  return (
    <div className="App" style={{ 
      height: "100vh", 
      display: "flex", 
      flexDirection: "column",
      width: "100%",
      overflow: "hidden",
      minWidth: "320px"
    }}>
      <Toolbar
        selectedComponentType={selectedComponentType}
        onComponentTypeChange={setSelectedComponentType}
        onClear={handleClear}
        onClearGrid={handleClearGrid}
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
        onResetDimensions={handleResetDimensions}
      />
      <CanvasGrid
        rows={rows}
        cols={cols}
        selectedComponentType={selectedComponentType}
        onClear={(clearFn) => {
          clearGridRef.current = clearFn;
        }}
        onClearGrid={(clearGridFn) => {
          clearGridOnlyRef.current = clearGridFn;
        }}
      />
    </div>
  );
}

export default App;
