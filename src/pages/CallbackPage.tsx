import { Link, Navigate } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";

const CallbackPage = () => {
  const { session, error, isLoading: loading } = useAuthStore();
  const params = new URLSearchParams(window.location.search);
  const callbackError = params.get("error_description");
  if (loading)
    return (
      <div className="completion" role="status">
        Completing secure sign-in…
      </div>
    );
  if (session) return <Navigate to="/" replace />;
  return (
    <div className="completion">
      <h1>Sign-in couldn’t be completed.</h1>
      <p>
        {callbackError ||
          error ||
          "The link may have expired or was opened in a different browser. Request a new link and open it in the browser where you started."}
      </p>
      <Link className="button primary" to="/login">
        Back to sign in
      </Link>
    </div>
  );
};

export default CallbackPage;
