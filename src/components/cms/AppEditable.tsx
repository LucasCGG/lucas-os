import { FC, MouseEvent, ReactNode } from "react";
import { useCmsStore } from "../../atoms/cmsStore";

interface AppEditableProps {
  id: string;
  children: ReactNode;
  inline?: boolean;
  className?: string;
}

export const AppEditable: FC<AppEditableProps> = ({id, children,inline,className}) => {
  const editing = useCmsStore((s) => s.editing);
  const selectedId = useCmsStore((s) => s.selectedId);
  const select = useCmsStore((s) => s.select);

  if (!editing) return <>{children}</>;

  const isSelected = selectedId === id;
  const cls = `cms-editable ${isSelected ? "cms-editable--selected" : ""} ${className}`.trim();
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    select(id);
  }

  if (inline) {
    return (
      <span data-cms-id={id} onClick={handleClick} className={cls} title={`Edit: ${id}`}>
        {children}
      </span>
    )
  }

  return (
          <div data-cms-id={id} onClick={handleClick} className={cls} title={`Edit: ${id}`}>
              {children}
          </div>
      );
}
