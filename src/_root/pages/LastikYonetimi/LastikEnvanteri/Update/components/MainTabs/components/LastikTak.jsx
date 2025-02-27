import React, { useEffect, useState } from "react";
import { Typography, Space, message, InputNumber, Input, DatePicker, Button, Modal } from "antd";
import AxleListSelect from "./AxleListSelect";
import PositionListSelect from "./PositionListSelect";
import KodIDSelectbox from "../../../../../../../components/KodIDSelectbox";
import StoksuzLastikTablo from "../../../../../../../components/StoksuzLastikTablo";
import AxiosInstance from "../../../../../../../../api/http";
import { t } from "i18next";
import { Controller, useFormContext, FormProvider, useForm } from "react-hook-form";
import dayjs from "dayjs";

const getDecimalSeparator = () => {
  const lang = localStorage.getItem("i18nextLng") || "en";
  return ["tr", "az", "ru"].includes(lang) ? "," : ".";
};

const { Text } = Typography;
const { TextArea } = Input;

export default function LastikTak({ aracId, wheelInfo, axleList, positionList, shouldOpenModal, onModalClose, showAddButton = true, refreshList, selectedAracDetay }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const methods = useForm({
    defaultValues: {
      lastik: null,
      lastikID: null,
      selectedAxle: null,
      selectedPosition: null,
      lastikTip: null,
      lastikEbat: null,
      lastikTipID: null,
      lastikEbatID: null,
      siraNo: "",
      lastikOmru: 0,
      marka: null,
      markaID: null,
      model: null,
      modelID: null,
      disDerinligi: 0,
      basinc: 0,
      montajKm: 0,
      montajTarihi: null,
      lastikAciklama: null,
    },
    mode: "onChange",
  });

  const {
    control,
    formState: { errors },
    setValue,
    reset,
    watch,
  } = methods;

  const fetchNewSerialNumber = async () => {
    try {
      const response = await AxiosInstance.get("Numbering/GetModuleCodeByCode?code=LASTIK_SERI_NO");
      if (response.data) {
        setValue("siraNo", response.data);
      }
    } catch (error) {
      console.error("Error fetching serial number:", error);
      message.error(t("seriNoGetirilemedi"));
    }
  };

  // Listen for external modal trigger
  useEffect(() => {
    if (shouldOpenModal) {
      setIsModalOpen(true);
      fetchNewSerialNumber();
      setValue("montajTarihi", dayjs().format("YYYY-MM-DD"));
      setValue("montajKm", selectedAracDetay.guncelKm);
    }
  }, [shouldOpenModal]);

  const handleOpenModal = async () => {
    setIsModalOpen(true);
    fetchNewSerialNumber();
    setValue("montajTarihi", dayjs().format("YYYY-MM-DD"));
    setValue("montajKm", selectedAracDetay.guncelKm);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    methods.reset();
    if (onModalClose) {
      onModalClose();
    }
  };

  useEffect(() => {
    if (wheelInfo?.axlePosition) {
      setValue("selectedAxle", wheelInfo.axlePosition);
      setValue("selectedPosition", wheelInfo.wheelPosition);
    }
  }, [wheelInfo, setValue]);

  const formatDateWithDayjs = (dateString) => {
    const formattedDate = dayjs(dateString);
    return formattedDate.isValid() ? formattedDate.format("YYYY-MM-DD") : "";
  };

  const formatTimeWithDayjs = (timeObj) => {
    const formattedTime = dayjs(timeObj);
    return formattedTime.isValid() ? formattedTime.format("HH:mm:ss") : "";
  };

  const createRequestBody = (data) => ({
    seriNo: data.siraNo,
    aracId: aracId,
    lastikSiraNo: data.lastikID,
    aksPozisyon: data.selectedAxle,
    pozisyonNo: data.selectedPosition,
    tahminiOmurKm: data.lastikOmru,
    ebatKodId: Number(data.lastikEbatID),
    tipKodId: Number(data.lastikTipID),
    lastikModelId: Number(data.modelID),
    lastikMarkaId: Number(data.markaID),
    disDerinligi: data.disDerinligi,
    basinc: data.basinc,
    aciklama: data.lastikAciklama,
    takildigiKm: data.montajKm,
    takilmaTarih: data.montajTarihi,
  });

  const handleApiCall = async (data) => {
    try {
      const response = await AxiosInstance.post("TyreOperation/AddTyreOperation", createRequestBody(data));

      if (response.data.statusCode === 200 || response.data.statusCode === 201 || response.data.statusCode === 202) {
        message.success("Güncelleme Başarılı.");
        if (typeof refreshList === "function") {
          await refreshList();
        }
        return true;
      } else if (response.data.statusCode === 401) {
        message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
      } else if (response.data.statusCode === 409) {
        message.error("Bu konuma zaten lastik takılmıştır!");
      } else {
        message.error("İşlem Başarısız.");
      }
      return false;
    } catch (error) {
      console.error("Error sending data:", error);
      if (navigator.onLine) {
        message.error("Hata Mesajı: " + error.message);
      } else {
        message.error("Internet Bağlantısı Mevcut Değil.");
      }
      return false;
    }
  };

  const checkSiraNoUniqueness = async (siraNo) => {
    try {
      const response = await AxiosInstance.post("TableCodeItem/IsCodeItemExist", {
        tableName: "Lastik",
        code: siraNo,
      });

      if (response.data.status === true) {
        message.error("Sıra numarası benzersiz değildir!");
        return false;
      }
      return true;
    } catch (error) {
      console.error("Error checking siraNo uniqueness:", error);
      message.error("Sıra numarası kontrolü sırasında hata oluştu!");
      return false;
    }
  };

  const onSubmit = async (data) => {
    const isUnique = await checkSiraNoUniqueness(watch("siraNo"));
    if (!isUnique) return;

    const success = await handleApiCall(data);
    if (success) {
      methods.reset();
      handleCloseModal();
    }
  };

  const handleSaveAndNew = async (data) => {
    const isUnique = await checkSiraNoUniqueness(watch("siraNo"));
    if (!isUnique) return;

    const success = await handleApiCall(data);
    if (success) {
      methods.reset();
      fetchNewSerialNumber();
    }
  };

  return (
    <>
      {showAddButton && (
        <Button style={{ paddingLeft: "5px" }} type="link" onClick={handleOpenModal}>
          {t("add")}
        </Button>
      )}

      <Modal title={t("lastikMontaji") + " " + "[" + selectedAracDetay?.plaka + "]"} open={isModalOpen} onCancel={handleCloseModal} footer={null} width={800}>
        <FormProvider {...methods}>
          <form>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              <div style={{ display: "flex", flexDirection: "row", gap: "10px" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>
                      {t("lastik")}
                      <span style={{ color: "red" }}>*</span>
                    </Text>
                    <div style={{ width: "250px" }}>
                      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: "5px", width: "100%" }}>
                        <Controller
                          name="lastik"
                          control={control}
                          rules={{
                            required: {
                              value: true,
                              message: t("alanBosBirakilamaz"),
                            },
                          }}
                          render={({ field, fieldState: { error } }) => (
                            <>
                              <Input
                                {...field}
                                status={error ? "error" : ""}
                                placeholder={t("lastikSeciniz")}
                                disabled={true}
                                style={{
                                  width: "100%",
                                }}
                              />
                            </>
                          )}
                        />
                        <StoksuzLastikTablo
                          onSubmit={(selectedData) => {
                            // Set the lastik input value
                            setValue("lastik", selectedData.tanim);
                            setValue("lastikID", selectedData.siraNo);

                            // Set other related form fields
                            setValue("lastikOmru", selectedData.lastikOmru);
                            setValue("markaID", selectedData.markaKodId);
                            setValue("marka", selectedData.marka);
                            setValue("modelID", selectedData.modelKodId);
                            setValue("model", selectedData.model);
                            setValue("lastikEbatID", selectedData.ebatKodId);
                            setValue("lastikEbat", selectedData.ebat);
                            setValue("lastikTipID", selectedData.tipKodId);
                            setValue("lastikTip", selectedData.tip);
                            setValue("disDerinligi", selectedData.disDerinlik);
                            setValue("basinc", selectedData.basinc);
                          }}
                          onClear={() => {
                            // Clear all tire-related fields
                            setValue("lastik", null);
                            setValue("lastikID", null);
                            setValue("lastikOmru", 0);
                            setValue("markaID", null);
                            setValue("marka", null);
                            setValue("modelID", null);
                            setValue("model", null);
                            setValue("lastikEbatID", null);
                            setValue("lastikEbat", null);
                            setValue("lastikTipID", null);
                            setValue("lastikTip", null);
                            setValue("disDerinligi", 0);
                            setValue("basinc", 0);
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>
                      {t("seriNo")}
                      <span style={{ color: "red" }}>*</span>
                    </Text>
                    <div style={{ width: "250px" }}>
                      <Controller
                        name="siraNo"
                        control={control}
                        rules={{
                          required: {
                            value: true,
                            message: t("alanBosBirakilamaz"),
                          },
                        }}
                        render={({ field, fieldState: { error } }) => (
                          <>
                            <Input
                              {...field}
                              status={error ? "error" : ""}
                              style={{
                                width: "100%",
                              }}
                            />
                            {error && <div style={{ color: "red" }}>{error.message}</div>}
                          </>
                        )}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("lastikOmru")}</Text>
                    <div style={{ width: "250px" }}>
                      <Controller
                        name="lastikOmru"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            suffix="KM"
                            style={{
                              width: "100%",
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("marka")}</Text>
                    <div style={{ width: "250px" }}>
                      <KodIDSelectbox name1="marka" isRequired={false} kodID="700" />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("model")}</Text>
                    <div style={{ width: "250px" }}>
                      <KodIDSelectbox name1="model" isRequired={false} kodID="701" />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("ebat")}</Text>
                    <div style={{ width: "250px" }}>
                      <KodIDSelectbox name1="lastikEbat" isRequired={false} kodID="702" />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("tip")}</Text>
                    <div style={{ width: "250px" }}>
                      <KodIDSelectbox name1="lastikTip" isRequired={false} kodID="705" />
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {/* <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "180px" }}>
                      <Text>{t("disDerinligi")}</Text>
                      <div style={{ width: "80px" }}>
                        <Controller
                          name="disDerinligi"
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              min={0}
                              precision={2}
                              step={0.01}
                              decimalSeparator={getDecimalSeparator()}
                              style={{
                                width: "100%",
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "160px" }}>
                      <Text>{t("basinc")}</Text>
                      <div style={{ width: "90px" }}>
                        <Controller
                          name="basinc"
                          control={control}
                          render={({ field }) => (
                            <InputNumber
                              {...field}
                              min={0}
                              suffix="psi"
                              style={{
                                width: "100%",
                              }}
                            />
                          )}
                        />
                      </div>
                    </div>
                  </div> */}

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>
                      {t("axle")}
                      <span style={{ color: "red" }}>*</span>
                    </Text>
                    <div style={{ width: "250px" }}>
                      <AxleListSelect axleList={axleList} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>
                      {t("position")}
                      <span style={{ color: "red" }}>*</span>
                    </Text>
                    <div style={{ width: "250px" }}>
                      <PositionListSelect positionList={positionList} />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("montajKm")}</Text>
                    <div style={{ width: "250px" }}>
                      <Controller
                        name="montajKm"
                        control={control}
                        render={({ field }) => (
                          <InputNumber
                            {...field}
                            min={0}
                            suffix="KM"
                            style={{
                              width: "100%",
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "start", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("montajTarihi")}</Text>
                    <div style={{ width: "250px" }}>
                      <Controller
                        name="montajTarihi"
                        control={control}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            style={{ width: "100%" }}
                            format="DD.MM.YYYY"
                            placeholder={t("montajTarihi")}
                            allowClear={true}
                            value={field.value ? dayjs(field.value) : null}
                            onChange={(date) => {
                              field.onChange(date ? date.format("YYYY-MM-DD") : null);
                            }}
                          />
                        )}
                      />
                    </div>
                  </div>

                  <div style={{ display: "flex", flexDirection: "row", alignItems: "start", justifyContent: "space-between", width: "350px" }}>
                    <Text>{t("aciklama")}</Text>
                    <div style={{ width: "250px" }}>
                      <Controller name="lastikAciklama" control={control} render={({ field }) => <TextArea {...field} rows={4} />} />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
                <Button onClick={methods.handleSubmit(handleSaveAndNew)}>{t("kaydetVeYeniEkle")}</Button>
                <Button type="primary" onClick={methods.handleSubmit(onSubmit)}>
                  {t("kaydet")}
                </Button>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
}
