import { BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
const Brand = () => {
  return (
    <Link className="brand" to="/">
      <span className="brand-mark">
        <BookOpen size={22} />
      </span>
      folio
    </Link>
  );
};

export default Brand;
