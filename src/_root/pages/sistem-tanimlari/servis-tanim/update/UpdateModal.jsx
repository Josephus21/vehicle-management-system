import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import PropTypes from "prop-types";
import { t } from "i18next";
import { Button, Checkbox, Divider, Input, InputNumber, Modal } from "antd";
import TextArea from "antd/es/input/TextArea";
import { CodeItemValidateService } from "../../../../../api/service";
import { GetServisByIdService, UpdateServisService } from "../../../../../api/services/servistanim_services";
import ServisTip from "../../../../components/form/ServisTip";

const UpdateModal = ({ updateModal, setUpdateModal, setStatus, id, selectedRow, onDrawerClose, drawerVisible, onRefresh }) => {
  const [isValid, setIsValid] = useState("normal");
  const [servisId, setServisId] = useState(0);

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
    if(selectedRow){
      GetServisByIdService(selectedRow?.key).then((res) => {
        setValue("aciklama", res.data.aciklama);
        setValue("bakimKodu", res.data.bakimKodu);
        setValue("gun", res.data.gun);
        setValue("km", res.data.km);
        setValue("periyodik", res.data.periyodik);
        setValue("servisTipi", res.data.servisTipi);
        setValue("servisTipiKodId", res.data.servisTipiKodId);
        setValue("tanim", res.data.tanim);
        setServisId(res.data.bakimId);
      });
    }
  }, [selectedRow, drawerVisible]);

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
      bakimId: servisId,
      bakimKodu: values.bakimKodu,
      tanim: values.tanim,
      servisTipiKodId: values.servisTipiKodId || -1,
      periyodik: values.periyodik,
      km: values.km || 0,
      gun: values.gun || 0,
      aciklama: values.aciklama,
    };

    UpdateServisService(body).then((res) => {
      if (res.data.statusCode === 202) {
        onDrawerClose();
        onRefresh();
        reset(defaultValues);
      }
    });
    onRefresh();
  });

  const footer = [
    <Button key="submit" className="btn btn-min primary-btn" onClick={onSubmit}>
      {t("guncelle")}
    </Button>,
    <Button
      key="back"
      className="btn btn-min cancel-btn"
      onClick={() => {
        onDrawerClose();
        reset(defaultValues);
      }}
    >
      {t("iptal")}
    </Button>,
  ];

  return (
    <Modal title={t("servisGuncelle")} open={drawerVisible} onCancel={() => onDrawerClose()} maskClosable={false} footer={footer} width={1200}>
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
  );
};

UpdateModal.propTypes = {
  updateModal: PropTypes.bool,
  setUpdateModal: PropTypes.func,
  setStatus: PropTypes.func,
  record: PropTypes.object,
  status: PropTypes.bool,
};

export default UpdateModal;
