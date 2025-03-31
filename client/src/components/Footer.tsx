import React from 'react';

function Footer() {
  return (
    <footer className="bg-gray-100 py-4">
      <div className="container mx-auto text-center">
        <p className="text-xs text-gray-500 mt-2">
          &copy; {new Date().getFullYear()} GoatedVIPs.gg | All Rights Reserved
        </p>
        <p className="text-xs text-gray-500 mt-1">
          GoatedVIPs is an independent platform created by an affiliate partner and is not affiliated with Goated.com or its team in any way.
        </p>
      </div>
    </footer>
  );
}

export default Footer;