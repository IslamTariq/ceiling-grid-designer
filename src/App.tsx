import CanvasGrid from "./components/CanvasGrid";
import { useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import type { ComponentType } from "./components/Toolbar";

function App() {
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType>("light");
  const [rows, setRows] = useState(10);
  const [cols, setCols] = useState(10);
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

  return (
    <div className="App" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toolbar
        selectedComponentType={selectedComponentType}
        onComponentTypeChange={setSelectedComponentType}
        onClear={handleClear}
        onClearGrid={handleClearGrid}
        rows={rows}
        cols={cols}
        onRowsChange={setRows}
        onColsChange={setCols}
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
