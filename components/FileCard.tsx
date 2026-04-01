"use client";

interface FileCardProps {
  file: File;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} Б`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} КБ`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} МБ`;
}

function getFileExt(name: string): string {
  return name.split(".").pop()?.toUpperCase() ?? "FILE";
}

export default function FileCard({ file }: FileCardProps) {
  const ext = getFileExt(file.name);

  return (
    <div
      style={{
        backgroundColor: "var(--bg-primary)",
        border: "0.5px solid var(--border-light)",
        borderRadius: "var(--radius-md)",
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      {/* File type badge */}
      <div
        style={{
          width: 36,
          height: 36,
          borderRadius: "var(--radius-md)",
          backgroundColor: "var(--danger-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <span
          style={{
            fontSize: 11,
            fontWeight: 500,
            color: "var(--danger)",
            letterSpacing: "0.02em",
          }}
        >
          {ext}
        </span>
      </div>

      {/* File info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            color: "var(--text-primary)",
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {file.name}
        </p>
        <p
          style={{
            fontSize: 12,
            color: "var(--text-tertiary)",
            margin: "2px 0 0",
          }}
        >
          {formatFileSize(file.size)}
        </p>
      </div>
    </div>
  );
}
