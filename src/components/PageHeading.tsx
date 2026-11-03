import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import ActivityIndicator from "./ActivityIndicator";
import type { PageHeadingProps } from "../types/study";
import ThemeToggle from "./ThemeToggle";
const PageHeading = ({ title, description, action }: PageHeadingProps) => {
  const activity = useContext(ActivityContext);
  return (
    <div className="page-heading">
      <div className="page-heading-copy">
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      <div className="page-heading-actions">
        {action}
        <ActivityIndicator {...activity} />
        <ThemeToggle />
      </div>
    </div>
  );
};

export default PageHeading;
