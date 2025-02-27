import React, { useEffect, useState } from "react";
import { useForm, Controller, FormProvider } from "react-hook-form";
import AxiosInstance from "../../../../../../../api/http";
import { Button, message, Modal, ConfigProvider, DatePicker, Input, Typography } from "antd";
import styled from "styled-components";
import GrupSelectbox from "./GrupSelectbox";
import { t } from "i18next";
import dayjs from "dayjs";
import trTR from "antd/lib/locale/tr_TR";
import enUS from "antd/lib/locale/en_US";
import ruRU from "antd/lib/locale/ru_RU";
import azAZ from "antd/lib/locale/az_AZ";

const { Text, Link } = Typography;
const { TextArea } = Input;

const localeMap = {
  tr: trTR,
  en: enUS,
  ru: ruRU,
  az: azAZ,
};

// Define date format mapping based on language
const dateFormatMap = {
  tr: "DD.MM.YYYY",
  en: "MM/DD/YYYY",
  ru: "DD.MM.YYYY",
  az: "DD.MM.YYYY",
};

// Define time format mapping based on language
const timeFormatMap = {
  tr: "HH:mm",
  en: "hh:mm A",
  ru: "HH:mm",
  az: "HH:mm",
};

const StyledDivBottomLine = styled.div`
  @media (min-width: 600px) {
    alignitems: "center";
  }
  @media (max-width: 600px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

export default function AracGrubunuDegistir({ selectedRows, refreshTableData, disabled, hidePopover }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localeDateFormat, setLocaleDateFormat] = useState("MM/DD/YYYY");
  const [localeTimeFormat, setLocaleTimeFormat] = useState("HH:mm");
  const buttonStyle = disabled ? { display: "none" } : {};

  const methods = useForm({
    defaultValues: {
      aracTipiID: null,
      aracTipi: null,
    },
  });

  const { reset, handleSubmit, control, watch } = methods;

  const onSubmit = async (data) => {
    const aracIDs = selectedRows.map((row) => row.key);

    try {
      const response = await AxiosInstance.post(`ModifyGroup/ModifyVehicleGroup?groupId=${data.aracGrubuID}`, aracIDs);
      console.log("İşlem sonucu:", response);

      if (response.data.statusCode >= 200 && response.data.statusCode < 300) {
        message.success(t("İşlem Başarılı"));
        refreshTableData();
        hidePopover();
        setIsModalVisible(false);
        reset();
      } else if (response.data.statusCode === 401) {
        message.error(t("Bu işlemi yapmaya yetkiniz bulunmamaktadır."));
      } else {
        message.error(t("İşlem Başarısız."));
      }
    } catch (error) {
      console.error("İşlem sırasında hata oluştu:", error);
      message.error(t("İşlem sırasında hata oluştu."));
    }
  };

  // Kullanıcının dilini localStorage'den alın
  const currentLang = localStorage.getItem("i18nextLng") || "en";
  const currentLocale = localeMap[currentLang] || enUS;

  useEffect(() => {
    // Ay ve tarih formatını dil bazında ayarlayın
    setLocaleDateFormat(dateFormatMap[currentLang] || "MM/DD/YYYY");
    setLocaleTimeFormat(timeFormatMap[currentLang] || "HH:mm");
  }, [currentLang]);

  // Modal kapandığında formu sıfırla
  const handleCancel = () => {
    setIsModalVisible(false);
    reset();
  };

  return (
    <div style={buttonStyle}>
      <div style={{ marginTop: "8px", cursor: "pointer" }} onClick={() => setIsModalVisible(true)}>
        {t("aracGrubunuDegistir")}
      </div>

      <Modal title={t("aracGrubunuDegistir")} open={isModalVisible} onOk={handleSubmit(onSubmit)} onCancel={handleCancel}>
        <ConfigProvider locale={currentLocale}>
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ width: "100%", maxWidth: "450px" }}>
                <StyledDivBottomLine style={{ display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                  <Text style={{ fontSize: "14px" }}>Araç Grubu:</Text>
                  <GrupSelectbox />
                </StyledDivBottomLine>
              </div>
            </form>
          </FormProvider>
        </ConfigProvider>
      </Modal>
    </div>
  );
}
