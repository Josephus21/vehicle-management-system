import { useEffect, useRef, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { Button, Checkbox, Divider, Input, InputNumber, Modal } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { t } from "i18next";
import GuzergahCikisYeri from "../../../../components/form/GuzergahCikisYer";
import GuzergahVarisYeri from "../../../../components/form/GuzergahVarisYeri";
import ServisTip from "../../../../components/form/ServisTip";
import TextArea from "antd/es/input/TextArea";
import { CodeItemValidateService } from "../../../../../api/service";
import TownVaris from "../../../../components/form/TownVaris";
import SehirYer from "../../../../components/table/SehirYer";
import { AddServisService, GetServisCodeService } from "../../../../../api/services/servistanim_services";

const AddModal = ({ setStatus, onRefresh }) => {
  const [openModal, setopenModal] = useState(false);
  const [isValid, setIsValid] = useState("normal");
  const isFirstRender = useRef(true);

  const defaultValues = {};
  const methods = useForm({
    defaultValues: defaultValues,
  });
  const {
    handleSubmit,
    reset,
    control,
    setValue,
    watch,
    getValues,
    setError,
    clearErrors,
    formState: { errors },
  } = methods;

  const periyodik = watch("periyodik");
  const km = watch("km");
  const gun = watch("gun");

  useEffect(() => {
    if (openModal && isFirstRender.current) {
      GetServisCodeService().then((res) => setValue("bakimKodu", res.data));
    }
  }, [openModal, setValue]);

  useEffect(() => {
    if (watch("bakimKodu")) {
      const body = {
        tableName: "ServisTanimlari",
        code: watch("bakimKodu"),
      };
      CodeItemValidateService(body).then((res) => {
        !res.data.status ? setIsValid("success") : setIsValid("error");
      });
    }
  }, [watch("bakimKodu")]);

  useEffect(() => {
    if (periyodik) {
      const kmValue = getValues("km");
      const gunValue = getValues("gun");
      if ((kmValue === undefined || kmValue === null || kmValue === "") && (gunValue === undefined || gunValue === null || gunValue === "")) {
        const errorMessage = "Lütfen km veya gün değerlerinden en az birini giriniz.";
        setError("km", {
          type: "manual",
          message: errorMessage,
        });
        setError("gun", {
          type: "manual",
          message: errorMessage,
        });
      } else {
        clearErrors("km");
        clearErrors("gun");
      }
    } else {
      clearErrors("km");
      clearErrors("gun");
    }
  }, [periyodik, km, gun]);

  const onSubmit = handleSubmit((values) => {
    const body = {
      bakimKodu: values.bakimKodu,
      tanim: values.tanim,
      servisTipiKodId: values.servisTipiKodId || -1,
      periyodik: values.periyodik,
      km: values.km || 0,
      gun: values.gun || 0,
      aciklama: values.aciklama,
    };

    AddServisService(body).then((res) => {
      if (res.data.statusCode === 200) {
        onRefresh();
        reset(defaultValues);
        setopenModal(false);
      }
    });
    onRefresh();
  });

  const footer = [
    <Button key="submit" className="btn btn-min primary-btn" onClick={onSubmit}>
      {t("kaydet")}
    </Button>,
    <Button
      key="back"
      className="btn btn-min cancel-btn"
      onClick={() => {
        setopenModal(false);
        reset(defaultValues);
      }}
    >
      {t("iptal")}
    </Button>,
  ];

  return (
    <>
      <Button className="btn primary-btn" onClick={() => setopenModal(true)} disabled={isValid === "error" ? true : isValid === "success" ? false : false}>
        <PlusOutlined /> {t("ekle")}
      </Button>
      <Modal title={t("yeniServisGirisi")} open={openModal} onCancel={() => setopenModal(false)} maskClosable={false} footer={footer} width={1200}>
        <FormProvider {...methods}>
          <form>
            <div className="grid gap-2">
              <div className="col-span-12">
                <h2>Servis Bilgileri</h2>
              </div>
              <div className="col-span-3">
                <div className="flex flex-col gap-1">
                  <label>{t("bakimKodu")}</label>
                  <Controller
                    name="bakimKodu"
                    control={control}
                    render={({ field }) => (
                      <Input
                        {...field}
                        style={isValid === "error" ? { borderColor: "#dc3545" } : isValid === "success" ? { borderColor: "#23b545" } : { color: "#000" }}
                        onChange={(e) => field.onChange(e.target.value)}
                      />
                    )}
                  />
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex flex-col gap-1">
                  <label>{t("servisTanim")}</label>
                  <Controller name="tanim" control={control} render={({ field }) => <Input {...field} onChange={(e) => field.onChange(e.target.value)} />} />
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex flex-col gap-1">
                  <label>{t("servisTip")}</label>
                  <Controller name="servisTipiKodId" control={control} render={({ field }) => <ServisTip field={field} />} />
                </div>
              </div>
              <div className="col-span-3">
                <div className="flex gap-1 flex-col">
                  <label>{t("periyodikBakim")}</label>
                  <Controller
                    name="periyodik"
                    control={control}
                    render={({ field }) => (
                      <Checkbox
                        className="custom-checkbox"
                        {...field}
                        checked={field.value}
                        onChange={(e) => {
                          field.onChange(e.target.checked);
                        }}
                      />
                    )}
                  />
                </div>
              </div>
            </div>
            <div className="m-20">
              <Divider />
            </div>
            <div className="grid gap-2">
              <div className="col-span-12">
                <h2>Uygulama Periyodu</h2>
              </div>
              <div className="col-span-2">
                <div className="flex gap-1" style={{ display: "flex", alignItems: "center" }}>
                  <label>Her</label>
                  <Controller
                    name="km"
                    control={control}
                    rules={{
                      validate: () => {
                        if (periyodik) {
                          const gunValue = getValues("gun");
                          const kmValue = getValues("km");
                          if (!kmValue && !gunValue) {
                            return "Lütfen km veya gün değerlerinden en az birini giriniz.";
                          }
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <InputNumber {...field} className="w-full" disabled={!periyodik} onChange={(e) => field.onChange(e)} status={error ? "error" : ""} />
                      </>
                    )}
                  />

                  <label>{t("km")}</label>
                </div>
              </div>
              <div className="col-span-2">
                <div className="flex gap-1" style={{ display: "flex", alignItems: "center" }}>
                  <label>Her</label>
                  <Controller
                    name="gun"
                    control={control}
                    rules={{
                      validate: () => {
                        if (periyodik) {
                          const kmValue = getValues("km");
                          const gunValue = getValues("gun");
                          if (!kmValue && !gunValue) {
                            return "Lütfen km veya gün değerlerinden en az birini giriniz.";
                          }
                        }
                        return true;
                      },
                    }}
                    render={({ field, fieldState: { error } }) => (
                      <>
                        <InputNumber {...field} className="w-full" disabled={!periyodik} onChange={(e) => field.onChange(e)} status={error ? "error" : ""} />
                      </>
                    )}
                  />
                  <label>{t("gun")}</label>
                </div>
              </div>
            </div>
            {errors.km && <div style={{ color: "red", marginTop: "5px" }}>{errors.km.message}</div>}

            <div className="m-20">
              <Divider />
            </div>
            <div className="flex flex-col gap-1">
              <label>{t("aciklama")}</label>
              <Controller name="aciklama" control={control} render={({ field }) => <TextArea {...field} onChange={(e) => field.onChange(e.target.value)} />} />
            </div>
          </form>
        </FormProvider>
      </Modal>
    </>
  );
};

export default AddModal;
