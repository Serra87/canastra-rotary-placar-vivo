
import { Link } from "react-router-dom";

export const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-rotary-navy text-white py-6 mt-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0 text-center md:text-left">
            <p className="text-sm">
              &copy; {currentYear} Rotary Club | Torneio Empresarial de Canastra
            </p>
            <p className="text-xs text-rotary-lightblue mt-1">
              Desenvolvido para o evento beneficente anual
            </p>
          </div>
          
          <div className="flex gap-6">
            <Link to="/" className="text-sm hover:text-rotary-gold transition-colors">
              Placar
            </Link>
            <Link to="/admin" className="text-sm hover:text-rotary-gold transition-colors">
              Admin
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
