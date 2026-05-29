import React from "react";
import { formatBytes } from "../../lib/formatters";

interface ByteSizeProps {
  bytes: number;
}

export const ByteSize: React.FC<ByteSizeProps> = ({ bytes }) => {
  return <span>{formatBytes(bytes)}</span>;
};
// Re-export formatBytes too
export { formatBytes };
