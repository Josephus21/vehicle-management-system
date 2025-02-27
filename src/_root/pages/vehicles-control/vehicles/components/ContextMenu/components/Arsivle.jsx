import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import AxiosInstance from "../../../../../../../api/http";
import { Button, message, Modal, ConfigProvider, DatePicker, Input, Alert } from "antd";
import { t } from "i18next";
import dayjs from "dayjs";
import trTR from "antd/lib/locale/tr_TR";
import enUS from "antd/lib/locale/en_US";
import ruRU from "antd/lib/locale/ru_RU";
import azAZ from "antd/lib/locale/az_AZ";

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

export default function Arsivle({ selectedRows, refreshTableData, disabled, hidePopover }) {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [localeDateFormat, setLocaleDateFormat] = useState("MM/DD/YYYY");
  const [localeTimeFormat, setLocaleTimeFormat] = useState("HH:mm");
  const buttonStyle = disabled ? { display: "none" } : {};

  const methods = useForm({
    defaultValues: {
      selectedDate: null, // Tarih için null yapıldı
      aciklama: "",
    },
  });

  const { reset, handleSubmit, control } = methods;

  const onSubmit = async (data) => {
    const aracIDs = selectedRows.map((row) => row.key);

    const body = {
      vIds: aracIDs,
      durum: true,
      tarih: data.selectedDate && dayjs(data.selectedDate).isValid() ? dayjs(data.selectedDate).format("YYYY-MM-DD") : null,
      aciklama: data.aciklama,
    };

    try {
      const response = await AxiosInstance.post(`GetArchive/GetVehiclesArchiveById`, body);
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
        {t("arsivle")}
      </div>

      <Modal title={t("arsivle")} open={isModalVisible} onOk={handleSubmit(onSubmit)} onCancel={handleCancel}>
        <ConfigProvider locale={currentLocale}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <Controller
              name="selectedDate"
              control={control}
              render={({ field }) => <DatePicker {...field} style={{ width: "100%", marginBottom: 8 }} format={localeDateFormat} placeholder={t("Tarih seçiniz")} />}
            />
            <Controller name="aciklama" control={control} render={({ field }) => <Input.TextArea {...field} rows={4} placeholder={t("Açıklama")} style={{ marginTop: 8 }} />} />
          </form>
          <Alert
            message="Uyarı"
            description={
              <ul style={{ listStyleType: "initial" }}>
                <li>Arşivleme işlemi, araca ait tüm verilerin sistemde saklanmasını sağlar. Ancak araç tüm listelerden kaldırılarak görünmez hale gelir.</li>
                <li>⁠Araçla ilgili işlem yapılamaz.</li>
                <li>Bu işlem geri alınabilir.</li>
                Devam etmek istiyor musunuz?
              </ul>
            }
            type="error"
            showIcon
            style={{ marginTop: 16 }}
          />
        </ConfigProvider>
      </Modal>
    </div>
  );
}
