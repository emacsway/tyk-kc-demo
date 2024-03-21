import { Link } from "react-router-dom";
import AuthenticationService from ".././AuthenticationService.jsx";
export default function Navbar() {

  return (
    <div className="d-flex justify-content-between">
      <h1 className="">KeyCloak App</h1>
      <ul key={1} className="nav">
        {AuthenticationService.getRealms().map((realm, i) => <Link key={i} onClick={() => AuthenticationService.setRealm(realm)} className="nav-link">
          {realm}
        </Link>)}
      </ul>
      <span>Selected realm: {AuthenticationService.getRealm()}</span>
      <ul key={2} className="nav">
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
