import React, { useState, useEffect } from "react";
import bg from "/images/bg-card.png";
import { Spin, Typography } from "antd";
import { useFormContext } from "react-hook-form";
import AxiosInstance from "../../../../../api/http.jsx";
import { t } from "i18next";
import dayjs from "dayjs";

const { Text } = Typography;

function Component1() {
  const [data, setData] = useState({});
  const [isLoading, setIsLoading] = useState({});
  const { watch } = useFormContext();

  const lokasyonId = watch("locationValues");
  const plakaValues = watch("plakaValues");
  const aracTipiValues = watch("aracTipiValues");
  const departmanValues = watch("departmanValues");
  const baslangicTarihi = watch("baslangicTarihi") ? dayjs(watch("baslangicTarihi")).format("YYYY-MM-DD") : null;
  const bitisTarihi = watch("bitisTarihi") ? dayjs(watch("bitisTarihi")).format("YYYY-MM-DD") : null;

  const fetchData = async () => {
    const body = {
      plaka: plakaValues || "",
      aracTipi: aracTipiValues || "",
      lokasyon: lokasyonId || "",
      departman: departmanValues || "",
      startDate: baslangicTarihi || null,
      endDate: bitisTarihi || null,
    };

    const types = [1, 2, 3, 4];

    // Yüklenme durumlarını başlat
    setIsLoading(types.reduce((acc, type) => ({ ...acc, [type]: true }), {}));

    try {
      const requests = types.map((type) => AxiosInstance.post(`ModuleAnalysis/FuelAnalysis/GetFuelAnalysisInfoByType?type=${type}`, body));
      const responses = await Promise.all(requests);

      // Verileri güncelle
      const newData = {};
      types.forEach((type, index) => {
        newData[type] = responses[index].data;
      });
      setData(newData);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      // Yüklenme durumlarını güncelle
      setIsLoading(types.reduce((acc, type) => ({ ...acc, [type]: false }), {}));
    }
  };

  useEffect(() => {
    fetchData();
  }, [lokasyonId, plakaValues, aracTipiValues, departmanValues, baslangicTarihi, bitisTarihi]);

  const renderCard = (value, label, backgroundColor, unit, isLoading) => (
    <div
      style={{
        flex: "1 1 24%",
        maxWidth: "24%",
        height: "100px",
        background: backgroundColor || `url(${bg}), linear-gradient(rgb(27 17 92), #007eff)`,
        backgroundPosition: "inherit",
        backgroundSize: "cover",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "0px",
        filter: "drop-shadow(0 0 0.75rem rgba(0, 0, 0, 0.1))",
      }}
    >
      {isLoading ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Spin size="large" style={{ color: "#fff" }} />
        </div>
      ) : (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            cursor: "pointer",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text style={{ fontWeight: "500", fontSize: "35px", color: "white" }}>
              {value !== undefined ? (
                <>
                  {Number(value).toLocaleString("tr-TR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                  {unit && <span style={{ fontSize: "20px" }}> ({unit})</span>}
                </>
              ) : (
                ""
              )}
            </Text>
            <Text
              style={{
                color: "white",
                fontSize: "15px",
                fontWeight: "400",
              }}
            >
              {label}
            </Text>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "10px",
        justifyContent: "space-between",
      }}
    >
      {renderCard(data[1], t("toplamYakitMiktari"), "linear-gradient(to right, #ff7e5f, #feb47b)", "L.", isLoading[1])}
      {renderCard(data[2], t("toplamYakitTutari"), "linear-gradient(to right, #6a11cb, #2575fc)", "TL.", isLoading[2])}
      {renderCard(data[3], t("toplamMesafe"), "linear-gradient(to right, #43cea2, #185a9d)", "km.", isLoading[3])}
      {renderCard(data[4], t("kmBasinaYakitTuketimi"), "linear-gradient(to right, #ff4e50, #f9d423)", "L./km.", isLoading[4])}
    </div>
  );
}

export default Component1;
