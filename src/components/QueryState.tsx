import type { ReactNode } from "react";
import { SkeletonRegion } from "../skeletons";

const QueryState = ({
  pending,
  error,
  retry,
  skeleton,
}: {
  pending?: boolean;
  error?: Error | null;
  retry?: () => unknown;
  skeleton?: ReactNode;
}) => {
  if (error)
    return (
      <div className="notice" role="alert">
        <p>{error.message}</p>
        {retry && (
          <button className="button" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    );
  if (pending)
    return <SkeletonRegion label="Loading content">{skeleton}</SkeletonRegion>;
  return null;
};

export default QueryState;
