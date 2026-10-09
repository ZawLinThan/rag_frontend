import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="completion">
      <span className="eyebrow">404</span>
      <h1>This page took a study break.</h1>
      <p>Let’s get you back to your workspace.</p>
      <Link className="button primary" to="/">
        Back to overview
      </Link>
    </div>
  );
};

export default NotFoundPage;
