import React, { useState, useEffect } from "react";
import bg from "/images/bg-card.png";
import { Spin, Typography } from "antd";
import { useFormContext } from "react-hook-form";
import AxiosInstance from "../../../../../api/http.jsx";
import { t } from "i18next";
import dayjs from "dayjs";

const { Text } = Typography;

function ComponentSingleCard() {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const { watch } = useFormContext();

  // Form değerlerini izle
  const lokasyonId = watch("locationValues");
  const plakaValues = watch("plakaValues");
  const aracTipiValues = watch("aracTipiValues");
  const departmanValues = watch("departmanValues");
  const baslangicTarihi = watch("baslangicTarihi") ? dayjs(watch("baslangicTarihi")).format("YYYY-MM-DD") : null;
  const bitisTarihi = watch("bitisTarihi") ? dayjs(watch("bitisTarihi")).format("YYYY-MM-DD") : null;

  const fetchData = async () => {
    setIsLoading(true);

    const body = {
      plaka: plakaValues || "",
      aracTipi: aracTipiValues || "",
      lokasyon: lokasyonId || "",
      departman: departmanValues || "",
      startDate: baslangicTarihi || null,
      endDate: bitisTarihi || null,
    };

    try {
      // Sadece type=1 ile tek bir istek
      const response = await AxiosInstance.post("CostAnalysis/GetCostAnalysisInfoByType?type=1", body);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [lokasyonId, plakaValues, aracTipiValues, departmanValues, baslangicTarihi, bitisTarihi]);

  const renderCard = (value, label, backgroundColor, unit, loading) => (
    <div
      style={{
        width: "100%",
        height: "100%",
        background: backgroundColor || `url(${bg}), linear-gradient(rgb(27 17 92), #007eff)`,
        backgroundPosition: "inherit",
        backgroundSize: "cover",
        borderRadius: "5px",
        padding: "10px",
        marginBottom: "0px",
        filter: "drop-shadow(0 0 0.75rem rgba(0, 0, 0, 0.1))",
      }}
    >
      {loading ? (
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
            height: "100%",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
            <Text style={{ fontWeight: "500", fontSize: "35px", color: "white" }}>
              {value !== null && value !== undefined ? (
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
            <Text style={{ color: "white", fontSize: "15px", fontWeight: "400" }}>{label}</Text>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      {renderCard(
        data, // API'den gelen değer (type=1 sonucu)
        t("toplamFiloMaliyeti"), // Kart üzerindeki başlık/label
        "linear-gradient(to right, #ff7e5f, #feb47b)", // Arka plan
        "TL.", // Birim
        isLoading // Yüklenme durumu
      )}
    </div>
  );
}

export default ComponentSingleCard;
