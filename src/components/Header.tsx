
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export const Header = () => {
  return (
    <header className="bg-rotary-blue text-white shadow-md py-4">
      <div className="container mx-auto flex flex-col md:flex-row items-center justify-between px-4">
        <div className="flex items-center mb-4 md:mb-0">
          <div className="mr-3">
            <svg
              className="w-10 h-10"
              viewBox="0 0 100 100"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="50" cy="50" r="45" fill="#f7a81b" />
              <circle cx="50" cy="50" r="35" fill="#0050a2" />
              <path
                d="M50 15 L53 35 L65 25 L55 40 L75 35 L60 45 L80 55 L60 55 L70 70 L55 60 L50 85 L45 60 L30 70 L40 55 L20 55 L40 45 L25 35 L45 40 L35 25 L47 35 Z"
                fill="#f7a81b"
              />
            </svg>
          </div>
          <div>
            <h1 className="text-xl font-bold">Torneio de Canastra</h1>
            <p className="text-sm text-rotary-lightblue">Rotary Club 2025</p>
          </div>
        </div>
        
        <nav className="flex gap-4">
          <Link to="/">
            <Button variant="ghost" className="text-white hover:text-rotary-gold">
              Placar
            </Button>
          </Link>
          <Link to="/admin">
            <Button variant="ghost" className="text-white hover:text-rotary-gold">
              Admin
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Header;
