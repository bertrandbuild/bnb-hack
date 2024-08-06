import React from "react";

const Footer: React.FC = () => {
  return (
    <footer className="footer footer-center bg-base-800 text-base-content">
      <aside>
        <p className="text-lg font-medium">
          Copyright @{new Date().getFullYear()} - All right reserved by ...
        </p>
      </aside>
    </footer>
  );
};

export default Footer;
