import "./ZoomControls.css";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut, onZoomReset }: ZoomControlsProps) {
  return (
    <div className="zoom-controls">
      <button onClick={onZoomIn} className="zoom-button" title="Zoom In">
        +
      </button>
      <button onClick={onZoomReset} className="zoom-button zoom-reset-button" title="Reset Zoom">
        <i className="material-icons" style={{ fontSize: "18px" }}>
          center_focus_strong
        </i>
      </button>
      <button onClick={onZoomOut} className="zoom-button" title="Zoom Out">
        −
      </button>
    </div>
  );
}
