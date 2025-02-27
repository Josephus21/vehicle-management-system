import { useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import dayjs from "dayjs";
import { t } from "i18next";
import { Button, Modal } from "antd";
import Plaka from "../../../../components/form/selects/Plaka";
import Driver from "../../../../components/form/selects/Driver";
import Location from "../../../../components/form/tree/Location";
import CheckboxInput from "../../../../components/form/checkbox/CheckboxInput";
import TextInput from "../../../../components/form/inputs/TextInput";
import DateInput from "../../../../components/form/date/DateInput";
import TimeInput from "../../../../components/form/date/TimeInput";
import NumberInput from "../../../../components/form/inputs/NumberInput";
import Textarea from "../../../../components/form/inputs/Textarea";
import CodeControl from "../../../../components/form/selects/CodeControl";
import CezaMaddesiTable from "./CezaMaddesi";

dayjs.locale("tr");

const GeneralInfo = () => {
  const { setValue, watch } = useFormContext();
  const [open, setOpen] = useState(false);
  const [madde, setMadde] = useState(false);
  const [modalKey, setModalKey] = useState(0);

  useEffect(() => {
    if (watch("tutar") && watch("indirimOran")) {
      const toplam = watch("tutar") - watch("indirimOran");
      setValue("toplamTutar", toplam);
    }

    if (watch("tutar") && watch("gecikmeTutar")) {
      const toplam = watch("tutar") + watch("gecikmeTutar");
      setValue("toplamTutar", toplam);
    }
  }, [watch("tutar"), watch("gecikmeTutar"), watch("indirimOran")]);

  const handleOpen = () => {
    setModalKey((prevKey) => prevKey + 1);
    setOpen(true);
  };

  const footer = [
    <Button
      key="submit"
      className="btn btn-min primary-btn"
      onClick={() => {
        setValue("cezaMaddesi", madde[0].madde);
        setValue("cezaMaddesiId", madde[0].siraNo);
        setOpen(false);
      }}
    >
      {t("ekle")}
    </Button>,
    <Button key="back" className="btn btn-min cancel-btn" onClick={() => setOpen(false)}>
      {t("kapat")}
    </Button>,
  ];

  return (
    <>
      <div className="grid gap-1">
        <div className="col-span-6 border p-20">
          <div className="grid gap-1">
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>
                  {t("plaka")} <span className="text-danger">*</span>
                </label>
                <Plaka required={true} />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>
                  {t("surucu")} <span className="text-danger">*</span>
                </label>
                <Driver required={true} />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>
                  {t("cezaTarihi")} <span className="text-danger">*</span>
                </label>
                <DateInput name="tarih" required={true} />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("saat")}</label>
                <TimeInput name="saat" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("tebligTarihi")}</label>
                <DateInput name="tebligTarih" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("lokasyon")}</label>
                <Location />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 border p-20">
          <div className="grid gap-1">
            <div className="col-span-6">
              <div className="grid gap-1">
                <div className="col-span-10">
                  <div className="flex flex-col gap-1">
                    <label>{t("cezaMaddesi")}</label>
                    <TextInput name="cezaMaddesi" readonly={true} />
                  </div>
                </div>
                <div className="col-span-2 self-end">
                  <Button onClick={handleOpen}>...</Button>
                </div>
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("cezaTuru")}</label>
                <CodeControl name="cezaTuru" codeName="cezaTuruKodId" id={400} />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("belgeNo")}</label>
                <TextInput name="belgeNo" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("bankaHesap")}</label>
                <TextInput name="bankaHesap" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("aracKm")}</label>
                <NumberInput name="aracKm" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("cezaPuan")}</label>
                <NumberInput name="cezaPuan" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("surucuOder")}</label>
                <CheckboxInput name="surucuOder" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 border p-20">
          <div className="grid gap-1">
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("cezaTutar")}</label>
                <NumberInput name="tutar" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("erkenOdemeIndirimOran")}</label>
                <NumberInput name="indirimOran" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("gecikmeIndirimTutar")}</label>
                <NumberInput name="gecikmeTutar" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("toplamTutar")}</label>
                <NumberInput name="toplamTutar" />
              </div>
            </div>
          </div>
        </div>
        <div className="col-span-6 border p-20">
          <div className="grid gap-1">
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("sonOdemeTarih")}</label>
                <DateInput name="odemeTarih" />
              </div>
            </div>
            <div className="col-span-6">
              <div className="flex flex-col gap-1">
                <label>{t("odemeYapildi")}</label>
                <CheckboxInput name="odeme" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="col-span-12 mt-10">
        <div className="flex flex-col gap-1">
          <label>{t("aciklama")}</label>
          <Textarea name="aciklama" />
        </div>
      </div>

      <Modal title={t("cezaMaddeleri")} open={open} onCancel={() => setOpen(false)} maskClosable={false} footer={footer} width={1200} key={modalKey}>
        <CezaMaddesiTable setMadde={setMadde} open={open} key={modalKey} />
      </Modal>
    </>
  );
};

export default GeneralInfo;
