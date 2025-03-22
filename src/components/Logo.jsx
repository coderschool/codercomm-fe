import { Link as RouterLink } from "react-router-dom";
import logoImg from "../logo.png";

function Logo({ disabledLink = false, className = "" }) {
  const logo = (
    <div className={`w-10 h-10 ${className}`}>
      <img src={logoImg} alt="logo" className="w-full h-full" />
    </div>
  );

  if (disabledLink) {
    return logo;
  }

  return <RouterLink to="/">{logo}</RouterLink>;
}

export default Logo;
