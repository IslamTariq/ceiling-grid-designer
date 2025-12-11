import CanvasGrid from "./components/CanvasGrid";
import { useState, useRef } from "react";
import Toolbar from "./components/Toolbar";
import type { ComponentType } from "./components/Toolbar";

function App() {
  const [selectedComponentType, setSelectedComponentType] = useState<ComponentType>("light");
  const clearGridRef = useRef<(() => void) | null>(null);

  const handleClear = () => {
    if (clearGridRef.current) {
      clearGridRef.current();
    }
  };

  return (
    <div className="App" style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Toolbar
        selectedComponentType={selectedComponentType}
        onComponentTypeChange={setSelectedComponentType}
        onClear={handleClear}
      />
      <CanvasGrid
        rows={10}
        cols={10}
        cellSize={40}
        selectedComponentType={selectedComponentType}
        onClear={(clearFn) => {
          clearGridRef.current = clearFn;
        }}
      />
    </div>
  );
}

export default App;
