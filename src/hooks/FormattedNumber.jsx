// FormattedNumber.jsx

import React from "react";

const FormattedNumber = ({ num }) => {
  if (num === null || num === undefined) {
    return "-";
  }
  const language = localStorage.getItem("i18nextLng");
  let locale = "en-US";
  switch (language) {
    case "tr":
      locale = "tr-TR";
      break;
    case "ru":
      locale = "ru-RU";
      break;
    case "az":
      locale = "az-AZ";
      break;
    default:
      locale = "en-US";
  }
  return Number(num).toLocaleString(locale);
};

export default FormattedNumber;
