import CanvasGrid from "./components/CanvasGrid";

function App() {
  return (
    <div className="App">
      <CanvasGrid rows={10} cols={10} cellSize={40} />
    </div>
  );
}

export default App;
