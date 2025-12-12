import { useState, useEffect } from "react";
import "./GridDimensions.css";

interface GridDimensionsProps {
  rows: number;
  cols: number;
  onRowsChange: (rows: number) => void;
  onColsChange: (cols: number) => void;
  defaultRows?: number;
  defaultCols?: number;
  onReset?: () => void;
}

export default function GridDimensions({
  rows,
  cols,
  onRowsChange,
  onColsChange,
  defaultRows = 10,
  defaultCols = 10,
  onReset,
}: GridDimensionsProps) {
  const [rowsInput, setRowsInput] = useState(rows.toString());
  const [colsInput, setColsInput] = useState(cols.toString());

  useEffect(() => {
    setRowsInput(rows.toString());
  }, [rows]);

  useEffect(() => {
    setColsInput(cols.toString());
  }, [cols]);

  const handleRowsChange = (value: string) => {
    setRowsInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      onRowsChange(numValue);
    }
  };

  const handleRowsBlur = () => {
    const numValue = parseInt(rowsInput, 10);
    if (isNaN(numValue) || numValue < 1) {
      setRowsInput("1");
      onRowsChange(1);
    } else if (numValue > 1000) {
      setRowsInput("1000");
      onRowsChange(1000);
    } else {
      setRowsInput(numValue.toString());
      if (numValue !== rows) {
        onRowsChange(numValue);
      }
    }
  };

  const handleColsChange = (value: string) => {
    setColsInput(value);
    const numValue = parseInt(value, 10);
    if (!isNaN(numValue) && numValue > 0 && numValue <= 1000) {
      onColsChange(numValue);
    }
  };

  const handleColsBlur = () => {
    const numValue = parseInt(colsInput, 10);
    if (isNaN(numValue) || numValue < 1) {
      setColsInput("1");
      onColsChange(1);
    } else if (numValue > 1000) {
      setColsInput("1000");
      onColsChange(1000);
    } else {
      setColsInput(numValue.toString());
      if (numValue !== cols) {
        onColsChange(numValue);
      }
    }
  };

  const handleRowsIncrement = () => {
    const newValue = Math.min(1000, rows + 1);
    setRowsInput(newValue.toString());
    onRowsChange(newValue);
  };

  const handleRowsDecrement = () => {
    const newValue = Math.max(1, rows - 1);
    setRowsInput(newValue.toString());
    onRowsChange(newValue);
  };

  const handleColsIncrement = () => {
    const newValue = Math.min(1000, cols + 1);
    setColsInput(newValue.toString());
    onColsChange(newValue);
  };

  const handleColsDecrement = () => {
    const newValue = Math.max(1, cols - 1);
    setColsInput(newValue.toString());
    onColsChange(newValue);
  };

  const handleReset = () => {
    setRowsInput(defaultRows.toString());
    setColsInput(defaultCols.toString());
    onRowsChange(defaultRows);
    onColsChange(defaultCols);
    if (onReset) {
      onReset();
    }
  };

  return (
    <div className="grid-dimensions">
      <div className="grid-dimensions-item">
        <span className="grid-dimensions-label-text">Rows</span>
        <div className="grid-dimensions-input-wrapper">
          <button
            type="button"
            className="grid-dimensions-button grid-dimensions-button-minus"
            onClick={handleRowsDecrement}
            disabled={rows <= 1}
            title="Decrease rows"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max="1000"
            value={rowsInput}
            onChange={(e) => handleRowsChange(e.target.value)}
            onBlur={handleRowsBlur}
            className="grid-dimensions-input"
            title="Number of rows"
          />
          <button
            type="button"
            className="grid-dimensions-button grid-dimensions-button-plus"
            onClick={handleRowsIncrement}
            disabled={rows >= 1000}
            title="Increase rows"
          >
            +
          </button>
        </div>
      </div>
      {onReset && (
        <div className="grid-dimensions-item grid-dimensions-reset-item">
          <span className="grid-dimensions-label-text" style={{ opacity: 0, visibility: "hidden" }}>
            Reset
          </span>
          <button
            type="button"
            className="grid-dimensions-reset-button"
            onClick={handleReset}
            title="Reset Rows and Cols to default"
          >
            <i className="material-icons grid-dimensions-reset-icon">restart_alt</i>
          </button>
        </div>
      )}
      <div className="grid-dimensions-item">
        <span className="grid-dimensions-label-text">Cols</span>
        <div className="grid-dimensions-input-wrapper">
          <button
            type="button"
            className="grid-dimensions-button grid-dimensions-button-minus"
            onClick={handleColsDecrement}
            disabled={cols <= 1}
            title="Decrease columns"
          >
            −
          </button>
          <input
            type="number"
            min="1"
            max="1000"
            value={colsInput}
            onChange={(e) => handleColsChange(e.target.value)}
            onBlur={handleColsBlur}
            className="grid-dimensions-input"
            title="Number of columns"
          />
          <button
            type="button"
            className="grid-dimensions-button grid-dimensions-button-plus"
            onClick={handleColsIncrement}
            disabled={cols >= 1000}
            title="Increase columns"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
}
