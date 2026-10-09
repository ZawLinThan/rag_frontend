import type { AuthFormProps } from "../types/study";
import { Link } from "react-router-dom";
import { ArrowRight, LockKeyhole } from "lucide-react";
import { useAuthForm } from "../hooks/useAuthForm";
import Brand from "./Brand";
import ThemeToggle from "./ThemeToggle";

const AuthForm = ({ mode }: AuthFormProps) => {
  const {
    register,
    handleSubmit,
    submit,
    message,
    formState: { errors, isSubmitting },
  } = useAuthForm(mode);
  return (
    <div className="auth-page">
      <div className="auth-story">
        <Brand />
        <div>
          <h1>
            Your notes.
            <br />
            Your questions.
            <br />
            Your next aha.
          </h1>
          <p>
            A thoughtful space to organize knowledge
            <br />
            and turn curiosity into understanding.
          </p>
        </div>
        <span></span>
      </div>
      <div className="auth-content">
        <div className="auth-form-wrap">
          <ThemeToggle />
          <span className="eyebrow">WELCOME TO FOLIO</span>
          <h1>
            {mode === "signup"
              ? "Start your learning journey."
              : "Good to see you again."}
          </h1>
          <p>
            {mode === "signup"
              ? "Create your account and make room for learning."
              : "Sign in with your email and password."}
          </p>
          <form key={mode} noValidate onSubmit={handleSubmit(submit)}>
            <input type="hidden" {...register("mode")} />
            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="full-name">Full name</label>
                <input
                  id="full-name"
                  autoComplete="name"
                  placeholder="Your full name"
                  aria-invalid={Boolean(errors.fullName)}
                  aria-describedby={
                    errors.fullName ? "full-name-error" : undefined
                  }
                  {...register("fullName")}
                />
                {errors.fullName && (
                  <p id="full-name-error" className="error" role="alert">
                    {errors.fullName.message}
                  </p>
                )}
              </div>
            )}
            <label>
              Email address
              <input
                type="email"
                aria-invalid={Boolean(errors.email)}
                aria-describedby={errors.email ? "email-error" : undefined}
                autoComplete="email"
                placeholder="you@university.edu"
                {...register("email")}
              />
            </label>
            {errors.email && (
              <p id="email-error" className="error" role="alert">
                {errors.email.message}
              </p>
            )}
            <div className="auth-field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                autoComplete={
                  mode === "signup" ? "new-password" : "current-password"
                }
                placeholder={
                  mode === "signup" ? "At least 8 characters" : "Your password"
                }
                aria-invalid={Boolean(errors.password)}
                aria-describedby={
                  errors.password ? "password-error" : undefined
                }
                {...register("password")}
              />
              {errors.password && (
                <p id="password-error" className="error" role="alert">
                  {errors.password.message}
                </p>
              )}
            </div>
            {mode === "signup" && (
              <div className="auth-field">
                <label htmlFor="confirm-password">Confirm password</label>
                <input
                  id="confirm-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Re-enter your password"
                  aria-invalid={Boolean(errors.confirmPassword)}
                  aria-describedby={
                    errors.confirmPassword
                      ? "confirm-password-error"
                      : undefined
                  }
                  {...register("confirmPassword")}
                />
                {errors.confirmPassword && (
                  <p id="confirm-password-error" className="error" role="alert">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>
            )}
            {errors.root && (
              <p className="error" role="alert">
                {errors.root.message}
              </p>
            )}
            <button className="button primary" disabled={isSubmitting}>
              <LockKeyhole size={17} />
              {isSubmitting
                ? mode === "signup"
                  ? "Creating account…"
                  : "Signing in…"
                : mode === "signup"
                  ? "Create account"
                  : "Sign in"}
              <ArrowRight size={17} />
            </button>
          </form>
          {message && (
            <p className="notice" role="status">
              {message}
            </p>
          )}
          <p className="auth-switch">
            {mode === "signup" ? "Already have an account?" : "New here?"}{" "}
            <Link to={mode === "signup" ? "/login" : "/signup"}>
              {mode === "signup" ? "Sign in" : "Create an account"}
            </Link>
          </p>
          <div className="auth-demo">
            <Link className="button" to="/">
              Explore the demo workspace <ArrowRight size={16} />
            </Link>
            <small>No account needed to explore.</small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;
