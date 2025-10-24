import React from "react";
import { ButtonSize, buttonSizeMap } from "../../theme";

interface AppDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: { label: string; value: string }[];
  size?: ButtonSize;
}

export const AppDropdown = ({
  value,
  onChange,
  options,
  size = "md",
}: AppDropdownProps) => {
  const { px, py } = buttonSizeMap[size];

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`retro-3d inline-flex items-center justify-center px-3 py-1 text-sm font-medium cursor-hand`}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  );
};

