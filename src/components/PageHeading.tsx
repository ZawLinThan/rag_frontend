import type { PageHeadingProps } from "../types/study";
import ThemeToggle from "./ThemeToggle";
const PageHeading = ({ title, description, action }: PageHeadingProps) => {
  return (
    <div className="page-heading">
      <div className="page-heading-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-actions">
        {action}
        <ThemeToggle />
      </div>
    </div>
  );
};

export default PageHeading;
