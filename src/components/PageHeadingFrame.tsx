import type { ReactNode } from "react";

export default function PageHeadingFrame({
  title,
  description,
  actions,
}: {
  title: ReactNode;
  description: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div className="page-heading-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-actions">{actions}</div>
    </div>
  );
}
