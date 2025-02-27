import { useEffect, useState } from "react";
import { Select } from "antd";
import i18n from "../../../utils/i18n";
import styled from "styled-components";

const { Option } = Select;

const CustomSelect = styled(Select)`
  .ant-select-selector {
    border: none !important;
    box-shadow: none !important;
  }
`;

const OptionContent = styled.div`
  display: flex;
  align-items: center;
`;

const Flag = styled.img`
  margin-right: 8px;
  width: 24px;
  height: auto;
`;

const LanguageSelector = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("en");

  useEffect(() => {
    let storedLanguage = localStorage.getItem("i18nextLng") || "en";
    if (storedLanguage.includes("-")) {
      storedLanguage = storedLanguage.split("-")[0];
    }
    setSelectedLanguage(storedLanguage);
    i18n.changeLanguage(storedLanguage);
  }, []);

  const changeLanguage = (lng) => {
    if (lng.includes("-")) {
      lng = lng.split("-")[0];
    }
    i18n.changeLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
    setSelectedLanguage(lng);
    window.location.reload();
  };

  return (
    <CustomSelect value={selectedLanguage} style={{ width: 150 }} onChange={changeLanguage}>
      <Option value="en">
        <OptionContent>
          <Flag src="/images/English.svg" alt="English" /> English
        </OptionContent>
      </Option>
      <Option value="tr">
        <OptionContent>
          <Flag src="/images/Turkey.svg" alt="Türkçe" /> Türkçe
        </OptionContent>
      </Option>
      <Option value="ru">
        <OptionContent>
          <Flag src="/images/Russian.svg" alt="Русский" /> Русский
        </OptionContent>
      </Option>
      <Option value="az">
        <OptionContent>
          <Flag src="/images/Azerbaijan.svg" alt="Azərbaycan" /> Azərbaycan
        </OptionContent>
      </Option>
    </CustomSelect>
  );
};

export default LanguageSelector;
