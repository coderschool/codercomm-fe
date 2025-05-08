import { Link } from "react-router";

function Logo({ disabledLink = false, className = "" }) {
  const logo = (
    <div className={`w-10 h-10 ${className}`}>
      <img src={"/logo.png"} alt="logo" className="w-full h-full" />
    </div>
  );

  if (disabledLink) {
    return logo;
  }

  return <Link to="/">{logo}</Link>;
}

export default Logo;
