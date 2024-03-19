import { Link } from "react-router-dom";
import AuthenticationService from ".././AuthenticationService.jsx";
export default function Navbar() {

  return (
    <div className="d-flex justify-content-between">
      <h1 className="">KeyCloak App</h1>
      <ul className="nav">
        <Link onClick={() => AuthenticationService.setRealm('mockrealm')} className="nav-link">
          mockrealm
        </Link>
        <Link onClick={() => AuthenticationService.setRealm('realm2')} className="nav-link">
          realm2
        </Link>
      </ul>
      <ul className="nav">
        <Link to="/" className="nav-link">
          Home
        </Link>
        <Link onClick={() => window.location.href = AuthenticationService.getLoginUrl()} className="nav-link">
          Login
        </Link>
        <Link onClick={() => window.location.href = AuthenticationService.getLogoutUrl()} className="nav-link">
          Logout
        </Link>
        {AuthenticationService.isLoggedIn() && (
          <Link to="/resource" className="nav-link">
            Protected Resource
          </Link>
        )}
      </ul>
    </div>
  );
}
