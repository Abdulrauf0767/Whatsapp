// Header.js
import React from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWhatsapp } from "@fortawesome/free-brands-svg-icons";
import { Link } from "react-router-dom";

const Header = () => {
  return (
    <div>
      <div className='w-full h-12 bg-[#ebedf0d3]'>
        <header className='w-full h-12 flex items-center'>
          <Link to="/" className='ml-4 flex items-center gap-x-2 text-green-400'>
            <FontAwesomeIcon icon={faWhatsapp} className='text-2xl' />
            Whatsapp
          </Link>
        </header>
      </div>
    </div>
  );
};

export default Header;