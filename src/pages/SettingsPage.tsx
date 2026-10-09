import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { settingsSchema } from "../zodSchema/studySchema";
import { supabase } from "../lib/supabase/client";
import { useAuthStore } from "../stores/authStore";
import PageHeading from "../components/PageHeading";

const SettingsForm = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [name, setName] = useState(user?.user_metadata.full_name || "");
  const [goal, setGoal] = useState("20");
  const [message, setMessage] = useState("");

  return (
    <>
      <PageHeading
        title="Settings"
        description="A study space that works for you."
      />
      <section className="panel settings-panel">
        <h2>Study preferences</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = settingsSchema.safeParse({ name, goal });
            if (!result.success) {
              setMessage(result.error.issues[0].message);
              return;
            }
            setMessage(
              "Preferences updated for this screen. Persistent profile settings will be connected with the backend.",
            );
          }}
        >
          <label>
            Display name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            Daily study goal (minutes)
            <input
              type="number"
              min="5"
              max="120"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
            />
          </label>
          <button className="button primary">Save preferences</button>
        </form>

        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
      </section>

      <section className="panel settings-panel">
        <h2>Account & workspace</h2>
        <div className="inline-actions">
          <button
            className="button"
            onClick={async () => {
              const result = await supabase?.auth.signOut();
              setMessage(result?.error ? result.error.message : "Signed out.");
              navigate("/login", { replace: true });
            }}
          >
            Sign out
          </button>
        </div>
      </section>
    </>
  );
};

export default SettingsForm;
