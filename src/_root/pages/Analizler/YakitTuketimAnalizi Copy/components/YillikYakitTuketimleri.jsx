import React, { useState, useEffect } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Spin, Typography, Select } from "antd";
import AxiosInstance from "../../../../../api/http.jsx";
import { useFormContext } from "react-hook-form";
import dayjs from "dayjs";
import { t } from "i18next";

const { Text } = Typography;
const { Option } = Select;

function YillikYakitTuketimleri() {
  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [parameterType, setParameterType] = useState(1);
  const { watch } = useFormContext();

  const lokasyonId = watch("locationValues");
  const plakaValues = watch("plakaValues");
  const aracTipiValues = watch("aracTipiValues");
  const departmanValues = watch("departmanValues");
  const baslangicTarihi = watch("baslangicTarihi") ? dayjs(watch("baslangicTarihi")).format("YYYY-MM-DD") : null;
  const bitisTarihi = watch("bitisTarihi") ? dayjs(watch("bitisTarihi")).format("YYYY-MM-DD") : null;

  // startYear ve endYear değerlerini burada hesaplıyoruz
  const startYear = baslangicTarihi ? dayjs(baslangicTarihi).year() : dayjs().year() - 5;
  const endYear = bitisTarihi ? dayjs(bitisTarihi).year() : dayjs().year();

  const parameterOptions = [
    { label: t("miktar"), value: 1 },
    { label: t("tutar"), value: 2 },
    { label: t("ortalama"), value: 3 },
  ];

  const parameterTypeNameMap = {
    1: t("miktar"),
    2: t("tutar"),
    3: t("ortalama"),
  };

  const fetchData = async () => {
    setIsLoading(true);
    const body = {
      plaka: plakaValues || "",
      aracTipi: aracTipiValues || "",
      lokasyon: lokasyonId || "",
      departman: departmanValues || "",
      startDate: baslangicTarihi || null,
      endDate: bitisTarihi || null,
      startYear: startYear, // startYear değerini kullanıyoruz
      endYear: endYear, // endYear değerini kullanıyoruz
      parameterType,
    };
    try {
      const response = await AxiosInstance.post(`/ModuleAnalysis/FuelAnalysis/GetFuelAnalysisInfoByType?type=5`, body);
      setData(response.data);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // parameterType veya diğer bağımlılıklar değiştiğinde verileri yeniden getiriyoruz
  useEffect(() => {
    fetchData();
  }, [lokasyonId, plakaValues, aracTipiValues, departmanValues, baslangicTarihi, bitisTarihi, parameterType]);

  return (
    <div
      style={{
        width: "100%",
        height: "470px",
        borderRadius: "5px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #f0f0f0",
        padding: "10px",
        filter: "drop-shadow(0 0 0.75rem rgba(0, 0, 0, 0.1))",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "10px",
        }}
      >
        <Text
          style={{
            fontWeight: "500",
            fontSize: "17px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "100%",
          }}
        >
          {t("yillikYakitTuketimleri")} {startYear} - {endYear}
        </Text>
        <Select value={parameterType} onChange={(value) => setParameterType(value)} style={{ width: 120 }}>
          {parameterOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
        </Select>
      </div>
      {isLoading ? (
        <Spin />
      ) : (
        <ResponsiveContainer width="100%" height={400}>
          <BarChart
            data={data}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="yil" />
            <YAxis />
            <Tooltip
              formatter={(value) =>
                Number(value).toLocaleString("tr-TR", {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })
              }
            />
            <Legend />
            <Bar dataKey="deger" fill="#8884d8" name={parameterTypeNameMap[parameterType]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export default YillikYakitTuketimleri;
