import React, { useEffect, useState } from "react";
import { useForm, FormProvider, Controller } from "react-hook-form";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { Button, Modal, message, Typography, Input, ColorPicker } from "antd";
// import { GetVehicleDetailsInfoService } from "../../../../../../../api/services/vehicles/vehicles/services";
import Car from "./svg/Car";
import EkspertizTable from "./components/EkspertizTable";
import Textarea from "../../../../../../components/form/inputs/Textarea";
import AxiosInstance from "../../../../../../../api/http";
import DurumModal from "./components/DurumModal.jsx";

dayjs.locale("tr");

const { Text, Link } = Typography;

const Ekspertiz = ({ visible, onClose, id }) => {
  const [status, setStatus] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [colorStyles, setColorStyles] = useState({});
  const [vehicleExpertData, setVehicleExpertData] = useState([]); // State to hold vehicle expert data
  const [tableData, setTableData] = useState([]); // State to hold table data
  const [isColorModalVisible, setIsColorModalVisible] = useState(false);
  const [selectedColorData, setSelectedColorData] = useState({});
  const [colorList, setColorList] = useState([]);
  const [fetchOptionsTrigger, setFetchOptionsTrigger] = useState(false);

  const defaultValues = {
    ekspertAciklama: "",
    durumIsim: "",
    durumRenk: "#FF0023",
    durumID: "",
  };

  const methods = useForm({
    defaultValues: defaultValues,
  });

  const { control, handleSubmit, setValue } = methods;

  useEffect(() => {
    if (visible) {
      // Modal açılır açılmaz yapmak istediğiniz temizleme işlemleri
      setSelectedOptions({});
      setTableData([]);
      // Diğer gerekli temizleme işlemleri...
      // Fetch fresh data
      fetchVehicleExpertData();
      fetchColorStyles();
    }
  }, [visible]);

  const fetchColorStyles = async () => {
    try {
      const response = await AxiosInstance.get("AppraisalsSettings/GetAppraisalsSettings");
      if (response && response.data) {
        setColorList(response.data); // Set the color list from API response
        const apiData = response.data;

        const newColorStyles = apiData.reduce((acc, item) => {
          acc[item.aracEkspertizDurum] = item.aracEkspertizRenk;
          return acc;
        }, {});

        setColorStyles(newColorStyles);
      }
    } catch (error) {
      console.error("Error fetching color styles: ", error);
    }
  };

  const fetchVehicleExpertData = async () => {
    try {
      const response = await AxiosInstance.get(`VehicleAppraisals/GetVehicleAppraisalsInfo?vehicleId=${id}`);
      if (response && response.data) {
        setVehicleExpertData(response.data);
      }
    } catch (error) {
      console.error("Error fetching vehicle expert data:", error);
      message.error("Ekspertiz bilgileri alınamadı");
    }
  };

  useEffect(() => {
    if (id) {
      fetchColorStyles();
      fetchVehicleExpertData();
    }
  }, [id]);

  useEffect(() => {
    setValue("ekspertAciklama", vehicleExpertData?.aciklama || ""); // Set the value of the form's `ekspertAciklama` field
  }, [vehicleExpertData]);

  const onSumbit = handleSubmit((values) => {
    const body = {
      // Include other form data...
      aracId: id,
      parcaAyar1: Number(tableData[0].selectedOptionID),
      parcaAyar2: Number(tableData[1].selectedOptionID),
      parcaAyar3: Number(tableData[2].selectedOptionID),
      parcaAyar4: Number(tableData[3].selectedOptionID),
      parcaAyar5: Number(tableData[4].selectedOptionID),
      parcaAyar6: Number(tableData[5].selectedOptionID),
      parcaAyar7: Number(tableData[6].selectedOptionID),
      parcaAyar8: Number(tableData[7].selectedOptionID),
      parcaAyar9: Number(tableData[8].selectedOptionID),
      parcaAyar10: Number(tableData[9].selectedOptionID),
      parcaAyar11: Number(tableData[10].selectedOptionID),
      parcaAyar12: Number(tableData[11].selectedOptionID),
      parcaAyar13: Number(tableData[12].selectedOptionID),
      aracEkspertizAciklama1: tableData[0].aciklama,
      aracEkspertizAciklama2: tableData[1].aciklama,
      aracEkspertizAciklama3: tableData[2].aciklama,
      aracEkspertizAciklama4: tableData[3].aciklama,
      aracEkspertizAciklama5: tableData[4].aciklama,
      aracEkspertizAciklama6: tableData[5].aciklama,
      aracEkspertizAciklama7: tableData[6].aciklama,
      aracEkspertizAciklama8: tableData[7].aciklama,
      aracEkspertizAciklama9: tableData[8].aciklama,
      aracEkspertizAciklama10: tableData[9].aciklama,
      aracEkspertizAciklama11: tableData[10].aciklama,
      aracEkspertizAciklama12: tableData[11].aciklama,
      aracEkspertizAciklama13: tableData[12].aciklama,
      aciklama: values.ekspertAciklama,
    };

    AxiosInstance.post("VehicleAppraisals/UpdateVehicleAppraisalsInfo", body)
      .then((res) => {
        if (res.data.statusCode === 202) {
          setStatus(true);
          onClose();
          message.success("Ekleme Başarılı");
        }
      })
      .catch((error) => {
        console.error("Error submitting data: ", error);
        message.error("Hata oluştu");
      });
  });

  const handleColorClick = (colorData) => {
    setSelectedColorData(colorData); // Set the selected color data to show in the modal
    setIsColorModalVisible(true);
  };

  const handleColorModalClose = () => {
    setIsColorModalVisible(false);
  };

  const guncellemeBasarili = () => {
    // Seçili seçenekleri güncellemek için yeni bir state ayarı
    setSelectedOptions((prevState) => ({
      ...prevState,
      [selectedColorData.aracEkspertizDurum]: selectedColorData.aracEkspertizRenk,
    }));

    // colorStyles state'ini güncelle
    setColorStyles((prevStyles) => ({
      ...prevStyles,
      [selectedColorData.aracEkspertizDurum]: selectedColorData.aracEkspertizRenk,
    }));

    // Modal kapandıktan sonra fetchOptions'ı tetiklemek için
    setFetchOptionsTrigger((prev) => !prev);
    fetchColorStyles();
    fetchVehicleExpertData();
  };

  const footer = [
    <Button key="submit" className="btn btn-min primary-btn" onClick={onSumbit}>
      Kaydet
    </Button>,
    <Button key="back" className="btn btn-min cancel-btn" onClick={onClose}>
      İptal
    </Button>,
  ];

  const handleSelectChange = (part, value) => {
    setSelectedOptions((prevState) => ({ ...prevState, [part]: value }));
  };

  const handleGetData = (data) => {
    setTableData(data); // Update the table data in state
  };

  useEffect(() => {
    setValue("durumIsim", selectedColorData?.aracEkspertizDurum || "");
    setValue("durumRenk", selectedColorData?.aracEkspertizRenk || "");
    setValue("durumID", selectedColorData?.aracEkspertizAyarId || "");
  }, [selectedColorData]);

  const onSubmit = async (data) => {
    try {
      const body = {
        aracEkspertizDurum: data.durumIsim,
        aracEkspertizRenk: data.durumRenk,
        aracEkspertizAyarId: data.durumID,
      };

      const response = await AxiosInstance.post(`AppraisalsSettings/UpdateAppraisalsSettingsItem`, body);

      if (response.data.statusCode === 200) {
        message.success("Veri başarıyla güncellendi");
        handleColorModalClose();
        fetchColorStyles();
        fetchVehicleExpertData();
        // guncellemeBasarili();
      } else {
        message.error("Güncelleme başarısız");
      }
    } catch (error) {
      console.error("Error updating data: ", error);
      message.error("Güncelleme sırasında hata oluştu");
    }
  };

  // console.log("araba rengleme", selectedOptions);

  return (
    <>
      <Modal title="Ekspertiz Bilgileri" open={visible} onCancel={onClose} centered maskClosable={false} footer={footer} width={1400}>
        <FormProvider {...methods}>
          <form onSubmit={onSumbit}>
            <div style={{ height: "calc(100vh - 140px)", overflow: "auto" }} className="grid gap-1">
              <div className="col-span-7">
                <div style={{ display: "flex", justifyContent: "flex-end", padding: "5px 10px" }}>
                  <DurumModal guncellemeBasarili={guncellemeBasarili} />
                </div>

                <Car selectedOptions={selectedOptions} colorStyles={colorStyles} />
                <div className="grid mt-10">
                  {colorList.map((item) => (
                    <div
                      style={{ cursor: "pointer", marginBottom: "10px" }}
                      className="col-span-3 flex gap-1 cursor-pointer"
                      key={item.aracEkspertizAyarId}
                      onClick={() => handleColorClick(item)}
                    >
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          background: item.aracEkspertizRenk,
                          borderRadius: "4px",
                        }}
                      ></div>
                      <p>{item.aracEkspertizDurum}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="col-span-5">
                <EkspertizTable
                  onSelectChange={handleSelectChange}
                  selectedOptions={selectedOptions}
                  vehicleExpertData={vehicleExpertData} // Pass vehicle expert data to the table
                  getData={handleGetData} // Pass the function to get data from EkspertizTable
                  fetchOptionsTrigger={fetchOptionsTrigger} // Yeni prop'u aktarın
                />
                <div className="col-span-12 mt-20">
                  <label>Ekspertiz Açıklama</label>
                  <Textarea name="ekspertAciklama" />
                </div>
              </div>
            </div>
          </form>
        </FormProvider>
      </Modal>
      <Modal
        title="Durum Güncelle"
        open={isColorModalVisible}
        onCancel={handleColorModalClose}
        footer={[
          <Button key="submit" onClick={handleSubmit(onSubmit)}>
            Kaydet
          </Button>,
          <Button key="ok" onClick={handleColorModalClose}>
            Kapat
          </Button>,
        ]}
      >
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
            <Controller name="durumIsim" control={control} render={({ field }) => <Input {...field} style={{ flex: 1 }} />} />
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
      </Modal>
    </>
  );
};

Ekspertiz.propTypes = {
  id: PropTypes.number,
  visible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default Ekspertiz;
