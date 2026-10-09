const QueryState = ({
  pending,
  error,
  retry,
}: {
  pending?: boolean;
  error?: Error | null;
  retry?: () => unknown;
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
    return (
      <p className="empty" role="status">
        Loading your study workspace…
      </p>
    );
  return null;
};

export default QueryState;
