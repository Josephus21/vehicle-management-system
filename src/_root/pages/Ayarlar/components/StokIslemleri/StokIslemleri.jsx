import React, { useState, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Spin, Button, message } from "antd";
import AxiosInstance from "../../../../../api/http";
import Forms from "./components/Forms";
import dayjs from "dayjs";
import { t } from "i18next";

function Araclar() {
  const [loading, setLoading] = useState(true);

  const methods = useForm({
    defaultValues: {
      stokNegatif: false,
      malzemeFiyatlariGuncellensin: false,
      guncellemeTipi: "1",
      KDVOrani: 18,
      miktar: null,
      ortalama: null,
      tutar: null,
    },
  });

  const { setValue, reset, watch } = methods;

  // API'den gelen verileri form alanlarına set etme
  const fetchData = async () => {
    try {
      const response = await AxiosInstance.get(`CommonSettings/GetSettingByType?type=3`);
      const item = response.data;
      if (item) {
        setValue("stokNegatif", item.stokNegatifeDussun);
        setValue("malzemeFiyatlariGuncellensin", item.malzemeFiyatiGuncellensin);
        setValue("guncellemeTipi", item.malzemeFiyatGuncellemeTip);
        setValue("KDVOrani", item.kdv);
        setValue("miktar", item.stokMiktarFormat);
        setValue("ortalama", item.stokOrtalamaFormat);
        setValue("tutar", item.stokTutarFormat);
      }
    } catch (error) {
      console.error("Veri çekilirken hata oluştu:", error);
      setLoading(false); // Hata oluştuğunda
    } finally {
      setLoading(false); // Her durumda
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const formatDateWithDayjs = (dateString) => {
    const formattedDate = dayjs(dateString);
    return formattedDate.isValid() ? formattedDate.format("YYYY-MM-DD") : "";
  };

  const formatTimeWithDayjs = (timeObj) => {
    const formattedTime = dayjs(timeObj);
    return formattedTime.isValid() ? formattedTime.format("HH:mm:ss") : "";
  };

  const onSubmit = async (data) => {
    // Form verilerini API'nin beklediği formata dönüştür
    const Body = {
      siraNo: 1,
      stokNegatifeDussun: data.stokNegatif,
      malzemeFiyatiGuncellensin: data.malzemeFiyatlariGuncellensin,
      malzemeFiyatGuncellemeTip: data.guncellemeTipi,
      kdv: data.KDVOrani,
      stokMiktarFormat: String(data.miktar),
      stokOrtalamaFormat: String(data.ortalama),
      stokTutarFormat: String(data.tutar),
    };

    setLoading(true);

    // API'ye POST isteği gönder
    try {
      const response = await AxiosInstance.post("CommonSettings/UpdateSettingByType?type=3", Body);
      console.log("Data sent successfully:", response);

      if (response.data.statusCode === 200 || response.data.statusCode === 201 || response.data.statusCode === 202) {
        message.success("Güncelleme Başarılı.");
        /* setOpen(false);
           onRefresh(); 
           onDrawerClose();
        */
        methods.reset();
      } else if (response.data.statusCode === 401) {
        message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
      } else {
        message.error("Ekleme Başarısız.");
      }
    } catch (error) {
      console.error("Error sending data:", error);
      if (navigator.onLine) {
        // İnternet bağlantısı var
        message.error("Hata Mesajı: " + error.message);
      } else {
        // İnternet bağlantısı yok
        message.error("Internet Bağlantısı Mevcut Değil.");
      }
    } finally {
      setLoading(false);
      fetchData();
    }
    console.log({ Body });
  };
  return (
    <FormProvider {...methods}>
      <div style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
        {loading ? (
          <div style={{ overflow: "auto", height: "333px", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}>
            <Spin spinning={loading} size="large"></Spin>
          </div>
        ) : (
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <div style={{ display: "flex", flexDirection: "column", gap: "15px", paddingBottom: "10px" }}>
              <Forms />
              <Button
                type="submit"
                onClick={methods.handleSubmit(onSubmit)}
                style={{
                  backgroundColor: "#2bc770",
                  borderColor: "#2bc770",
                  color: "#ffffff",
                }}
              >
                {t("guncelle")}
              </Button>
            </div>
          </form>
        )}
      </div>
    </FormProvider>
  );
}

export default Araclar;
