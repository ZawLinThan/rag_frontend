import PageHeadingFrame from "./PageHeadingFrame";
import { useContext } from "react";
import { ActivityContext } from "../context/ActivityContext";
import ActivityIndicator from "./ActivityIndicator";
import type { PageHeadingProps } from "../types/study";
import ThemeToggle from "./ThemeToggle";
const PageHeading = ({ title, description, action }: PageHeadingProps) => {
  const activity = useContext(ActivityContext);
  return (
    <PageHeadingFrame
      title={title}
      description={description}
      actions={
        <>
          {action}
          <ActivityIndicator {...activity} />
          <ThemeToggle />
        </>
      }
    />
  );
};

export default PageHeading;
