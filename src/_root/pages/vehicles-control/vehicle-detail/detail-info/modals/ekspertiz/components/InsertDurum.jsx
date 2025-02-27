import React, { useEffect } from "react";
import { Modal, Form, Input, Button, ColorPicker, message, Typography } from "antd";
import { useForm, FormProvider, Controller } from "react-hook-form";
import AxiosInstance from "../../../../../../../../api/http";

const { Text, Link } = Typography;

function InsertDurum({ onRefresh }) {
  const [isModalVisible, setIsModalVisible] = React.useState(false);
  const methods = useForm({
    defaultValues: {
      durumIsim: "",
      durumID: "",
      durumRenk: "#c50000",
      // ... Tüm default değerleriniz
    },
  });

  const { setValue, reset, watch, control } = methods;

  const onSubmit = (data) => {
    // Form verilerini API'nin beklediği formata dönüştür
    const Body = {
      aracEkspertizDurum: data.durumIsim,
      aracEkspertizRenk: data.durumRenk,
    };

    // API'ye POST isteği gönder
    AxiosInstance.post("AppraisalsSettings/AddAppraisalsSettingsItem", Body)
      .then((response) => {
        if (response.data.statusCode === 200 || response.data.statusCode === 201) {
          message.success("Güncelleme Başarılı.");
          onRefresh();
          methods.reset();
          setIsModalVisible(false);
        } else if (response.data.statusCode === 401) {
          message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
        } else {
          message.error("Güncelleme Başarısız.");
        }
      })
      .catch((error) => {
        // Handle errors here, e.g.:
        console.error("Error sending data:", error);
        if (navigator.onLine) {
          // İnternet bağlantısı var
          message.error("Hata Mesajı: " + error.message);
        } else {
          // İnternet bağlantısı yok
          message.error("Internet Bağlantısı Mevcut Değil.");
        }
      });
  };

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    reset();
  };

  return (
    <>
      <Button type="primary" onClick={showModal}>
        Ekle
      </Button>
      <Modal
        title="Yeni Durum Ekle"
        open={isModalVisible}
        onCancel={handleCancel} // Use the custom handleCancel function
        onOk={methods.handleSubmit(onSubmit)}
      >
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <FormProvider {...methods}>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "408px",
                gap: "10px",
                rowGap: "0px",
                marginBottom: "10px",
              }}
            >
              <Text
                style={{
                  fontSize: "14px",
                  fontWeight: "600",
                }}
              >
                Durum İsmi:
              </Text>
              <div
                style={{
                  display: "flex",
                  flexWrap: "wrap",
                  maxWidth: "300px",
                  width: "100%",
                  flexDirection: "column",
                }}
              >
                <Controller
                  name="durumIsim"
                  control={control}
                  rules={{ required: "Durum İsmi zorunludur." }} // Add validation rule
                  render={({ field, fieldState: { error } }) => (
                    <>
                      <Input {...field} style={{ flex: 1 }} />
                      {error && <Text type="danger">{error.message}</Text>} {/* Display error message */}
                    </>
                  )}
                />
              </div>
              <Controller name="durumID" control={control} render={({ field }) => <Input {...field} style={{ flex: 1, display: "none" }} />} />
            </div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
                maxWidth: "408px",
                gap: "10px",
                rowGap: "0px",
                marginBottom: "10px",
              }}
            >
              <Text style={{ fontSize: "14px" }}>Renk:</Text>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div
                  style={{
                    display: "flex",
                    flexWrap: "wrap",
                    alignItems: "center",
                    maxWidth: "300px",
                    minWidth: "300px",
                    gap: "10px",
                    width: "100%",
                  }}
                >
                  <Controller
                    name="durumRenk"
                    control={control}
                    render={({ field }) => (
                      <ColorPicker
                        value={field.value} // Ensure the current value is set
                        onChange={(color, hex) => field.onChange(hex)} // Use hex value directly
                        showText
                      />
                    )}
                  />
                </div>
              </div>
            </div>
          </FormProvider>
        </form>
      </Modal>
    </>
  );
}

export default InsertDurum;
