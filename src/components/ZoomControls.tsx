import "./ZoomControls.css";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: ZoomControlsProps) {
  return (
    <div className="zoom-controls">
      <button
        onClick={onZoomIn}
        className="zoom-button"
        title="Zoom In"
      >
        +
      </button>
      <button
        onClick={onZoomOut}
        className="zoom-button"
        title="Zoom Out"
      >
        −
      </button>
    </div>
  );
}

