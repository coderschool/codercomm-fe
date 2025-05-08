import React from "react";

/**
 * MainFooter - Footer component displayed at the bottom of the main layout
 * Contains copyright information and a link to CoderSchool
 */
function MainFooter() {
  return (
    <p className="text-gray-500 text-center p-4">
      {"Copyright © "}
      <a className="text-gray-500 hover:text-gray-700" href="https://www.coderschool.vn">
        CoderSchool
      </a>{" "}
      {new Date().getFullYear()}
      {"."}
    </p>
  );
}

export default MainFooter;