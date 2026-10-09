import type { PageHeadingProps } from "../types/study";
import ThemeToggle from "./ThemeToggle";
const PageHeading = ({ title, description, action }: PageHeadingProps) => {
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <ThemeToggle />
      {action}
    </div>
  );
};

export default PageHeading;
