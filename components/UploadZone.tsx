"use client";

import { useState } from "react";

interface UploadZoneProps {
  onFileSelect: (file: File) => void;
}

export default function UploadZone({ onFileSelect }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onFileSelect(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onFileSelect(file);
  };

  return (
    <label
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        display: "block",
        border: `1.5px dashed ${isDragging ? "var(--accent-blue)" : "var(--border-medium)"}`,
        borderRadius: "var(--radius-lg)",
        padding: "48px 24px",
        backgroundColor: isDragging ? "var(--accent-blue-bg)" : "transparent",
        cursor: "pointer",
        transition: "border-color 0.15s ease, background-color 0.15s ease",
        textAlign: "center",
        userSelect: "none",
      }}
    >
      {/* input внутри label — браузер сам связывает клик без htmlFor/id */}
      <input
        type="file"
        accept=".pdf"
        onChange={handleChange}
        style={{ display: "none" }}
      />

      {/* Icon */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: "var(--radius-full)",
          backgroundColor: "var(--accent-blue-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          margin: "0 auto 16px",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--accent-blue)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M12 19V5" />
          <path d="M5 12l7-7 7 7" />
        </svg>
      </div>

      <p style={{ fontSize: 15, fontWeight: 500, color: "var(--text-primary)", margin: "0 0 6px" }}>
        Загрузите договор
      </p>
      <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0 }}>
        PDF до 20 МБ — кликните или перетащите
      </p>
    </label>
  );
}
