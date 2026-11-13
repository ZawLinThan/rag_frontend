import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { completeSpotifyAuthorization } from "../lib/spotify";

export default function SpotifyCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    void completeSpotifyAuthorization()
      .then(() => {
        if (active) navigate("/timer", { replace: true });
      })
      .catch((error) => {
        if (active)
          setError(
            error instanceof Error
              ? error.message
              : "Could not connect Spotify.",
          );
      });
    return () => {
      active = false;
    };
  }, [navigate]);
  return (
    <main>
      <section className="panel completion route-message">
        <h1>Connect Spotify</h1>
        <p role={error ? "alert" : "status"}>
          {error || "Finishing your Spotify connection…"}
        </p>
        {error && (
          <Link className="button" to="/timer">
            Back to focus timer
          </Link>
        )}
      </section>
    </main>
  );
}
