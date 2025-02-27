import React, { useEffect, useState } from "react";
import { Typography, Input, Spin, message, Divider, Pagination, Tag, Button } from "antd";
import { useFormContext } from "react-hook-form";
import AxiosInstance from "../../../../../../../api/http.jsx";
import { t } from "i18next";

const { Text } = Typography;

function Yetkiler() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1); // Current page
  const itemsPerPage = 10; // Items per page
  const [searchTerm, setSearchTerm] = useState(""); // Search term

  const { watch } = useFormContext();

  const userID = watch("siraNo");

  const customYetkiTanimlari = {
    "00001": t("programAyarlari"),
    "00003": t("servisKayitlari"),
    "00004": t("periyodikBakim"),
    "00005": t("yakitKayitlari"),
    "00006": t("seferKayitlari"),
    "00007": t("harcamalar"),
    "00008": t("kazalarCezalar"),
    "00009": t("aracLastikleri"),
    "00010": t("aracSigortalari"),
    "00011": t("aracAnalizi"),
    "00012": t("arac"),
    "00013": t("suruculer"),
    "00014": t("firmalar"),
    "00015": t("personel"),
    "00016": t("guzergah"),
    "00017": t("servisler"),
    "00018": t("malzemeler"),
    "00019": t("malzemeGirisFisleri"),
    "00020": t("malzemeCikisFisleri"),
    "00021": t("malzemeHareketleri"),
    "00022": t("raporlar"),
    "00023": t("kodYonetimi"),
    "00024": t("aracMarkaModelleri"),
    "00025": t("aracSurucuDegisikligi"),
    "00026": t("aracYolcuBilgileri"),
    "00027": t("hatirlatici"),
    "00028": t("yedekleme"),
    "00029": t("yedegiGeriYukleme"),
    "00030": t("guncelleme"),
    "00031": t("kullaniciTanimlari"),
    "00032": t("hizliYakitGirisi"),
    "00033": t("sistemGuvenligi"),
    "00034": t("surucuDegisikligi"),
    "00036": t("lastikler"),
    "00037": t("malzemeTransferFisleri"),
    "00038": t("yakitGirisFisleri"),
    "00039": t("yakitCikisFisleri"),
    "00040": t("yakitTransferFisleri"),
    "00041": t("yakitHareketleri"),
    "00042": t("yakitTanklari"),
    "00043": t("malzemeDepolari"),
    "00044": t("aracBolgeDegisikligi"),
    "00045": t("malzemeTalepFisleri"),
    "00050": t("gelirIslemleri"),
    "00051": t("cezaTanimlari"),
    "00052": t("sehirYerTanimlamalari"),
    "00053": t("isKartlari"),
    "00054": t("aktarimlar"),
    "00055": t("yakitlar"),
    "00056": t("hizliKmGuncelleme"),
    "00057": t("formTasarimlari"),
    "00058": t("yaziciAyarlari"),
    "00059": t("programiIlkAyarlarinaDondur"),
    "00061": t("hizliSeferGirisi"),
    "00062": t("analizler"),
    // Other permission codes and definitions...
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await AxiosInstance.get(`Authority/GetUserAuthListById?id=${userID}`);
      if (response.data) {
        const formattedData = response.data.map((item) => {
          return {
            ...item,
            key: item.yetkiKod,
            yetkiTanim: customYetkiTanimlari[item.yetkiKod] || item.yetkiTanim,
          };
        });
        setData(formattedData);
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in API request:", error);
      setLoading(false);
      if (navigator.onLine) {
        message.error("Hata Mesajı: " + error.message);
      } else {
        message.error("Internet Bağlantısı Mevcut Değil.");
      }
    }
  };

  useEffect(() => {
    if (userID) {
      fetchData();
    }
  }, [userID]);

  // Reset current page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  // Filter data based on search term
  const filteredData = data.filter((item) => item.yetkiTanim.toLowerCase().includes(searchTerm.toLowerCase()));

  // Calculate items for current page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentData = filteredData.slice(indexOfFirstItem, indexOfLastItem);

  // Compute whether all permissions are granted or removed
  const allPermissionsGranted = data.length > 0 && data.every((item) => item.gor && item.ekle && item.sil && item.degistir);

  const allPermissionsRemoved = data.length > 0 && data.every((item) => !item.gor && !item.ekle && !item.sil && !item.degistir);

  // Function to handle toggling permissions
  const handleToggle = (key, field) => {
    // Find the item to update
    const itemToUpdate = data.find((item) => item.key === key);
    if (!itemToUpdate) return;

    const newValue = !itemToUpdate[field];
    let updatedItem = { ...itemToUpdate, [field]: newValue };

    // If 'gor' permission is set to false, set other permissions to false
    if (field === "gor" && newValue === false) {
      updatedItem = {
        ...updatedItem,
        ekle: false,
        sil: false,
        degistir: false,
      };
    }

    // Optimistically update state
    setData((prevData) => prevData.map((item) => (item.key === key ? updatedItem : item)));

    // API request body
    const body = {
      userId: userID,
      yetkiKod: updatedItem.key,
      ekle: updatedItem.ekle,
      gor: updatedItem.gor,
      sil: updatedItem.sil,
      degistir: updatedItem.degistir,
    };

    // Make API call
    AxiosInstance.post("Authority/UpdateUserAuths", body)
      .then((response) => {
        message.success(t("izinBasariylaGuncellendi"));
      })
      .catch((error) => {
        message.error(t("izinGuncellenirkenBirHataOlustu"));
        console.error(error);
        // Revert changes in case of error
        setData((prevData) => prevData.map((item) => (item.key === key ? itemToUpdate : item)));
      });
  };

  // Function to grant all permissions
  const handleGrantAllPermissions = () => {
    // Optimistically update state
    const updatedData = data.map((item) => ({
      ...item,
      gor: true,
      ekle: true,
      sil: true,
      degistir: true,
    }));
    setData(updatedData);

    // Make API calls for each item
    updatedData.forEach((item) => {
      const body = {
        userId: userID,
        yetkiKod: item.key,
        ekle: item.ekle,
        gor: item.gor,
        sil: item.sil,
        degistir: item.degistir,
      };

      AxiosInstance.post("Authority/UpdateUserAuths", body).catch((error) => {
        console.error(error);
        message.error(t("izinGuncellenirkenBirHataOlustu"));
      });
    });

    message.success(t("tumIzinlerVerildi"));
  };

  // Function to remove all permissions
  const handleRemoveAllPermissions = () => {
    // Optimistically update state
    const updatedData = data.map((item) => ({
      ...item,
      gor: false,
      ekle: false,
      sil: false,
      degistir: false,
    }));
    setData(updatedData);

    // Make API calls for each item
    updatedData.forEach((item) => {
      const body = {
        userId: userID,
        yetkiKod: item.key,
        ekle: item.ekle,
        gor: item.gor,
        sil: item.sil,
        degistir: item.degistir,
      };

      AxiosInstance.post("Authority/UpdateUserAuths", body).catch((error) => {
        console.error(error);
        message.error(t("izinGuncellenirkenBirHataOlustu"));
      });
    });

    message.success(t("tumIzinlerKaldirildi"));
  };

  // Permission labels and colors
  const permissionLabels = {
    ekle: t("ekle"),
    sil: t("sil"),
    degistir: t("degistir"),
    gor: t("gor"),
  };

  const permissionColors = {
    ekle: "success", // green
    sil: "error", // red
    degistir: "processing", // blue
    gor: "warning", // orange
  };

  return (
    <div>
      {loading ? (
        <div style={{ minHeight: "50px" }}>
          <Spin style={{ marginTop: "40px" }} />
        </div>
      ) : (
        <>
          {/* Search Input and Buttons */}
          <div style={{ display: "flex", alignItems: "center", marginBottom: "10px", justifyContent: "space-between" }}>
            <Input placeholder={t("aramaYap")} value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ width: "200px" }} />
            <div>
              <Button color="primary" variant="solid" onClick={handleGrantAllPermissions} disabled={allPermissionsGranted} style={{ marginLeft: "10px" }}>
                {t("tumIzinleriVer")}
              </Button>
              <Button color="danger" variant="solid" onClick={handleRemoveAllPermissions} disabled={allPermissionsRemoved} style={{ marginLeft: "10px" }}>
                {t("tumIzinleriKaldir")}
              </Button>
            </div>
          </div>

          {currentData.map((item) => {
            return (
              <div key={item.key}>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Text>{item.yetkiTanim}</Text>
                  <div>
                    {Object.keys(permissionLabels).map((permission) => {
                      const isDisabled = !item.gor && permission !== "gor";
                      return (
                        <Tag
                          key={permission}
                          color={item[permission] ? permissionColors[permission] : "default"}
                          onClick={() => {
                            if (!isDisabled) {
                              handleToggle(item.key, permission);
                            }
                          }}
                          style={{
                            cursor: isDisabled ? "not-allowed" : "pointer",
                            marginRight: "5px",
                            opacity: isDisabled ? 0.5 : 1,
                          }}
                        >
                          {permissionLabels[permission]}
                        </Tag>
                      );
                    })}
                  </div>
                </div>
                <Divider />
              </div>
            );
          })}
          <Pagination
            current={currentPage}
            align="end"
            total={filteredData.length}
            pageSize={itemsPerPage}
            onChange={(page) => setCurrentPage(page)}
            style={{ marginTop: "20px" }}
          />
        </>
      )}
    </div>
  );
}

export default Yetkiler;
