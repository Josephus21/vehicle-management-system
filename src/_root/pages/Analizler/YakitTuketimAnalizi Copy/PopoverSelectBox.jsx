import React, { useState, useEffect } from "react";
import { Popover, Input, Spin } from "antd";
import { CloseCircleOutlined, DownOutlined } from "@ant-design/icons";
import AxiosInstance from "../../../../api/http.jsx";
import { Controller, useFormContext } from "react-hook-form";
import FlexSearch from "flexsearch";

const PopoverSelectBox = () => {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const [visible, setVisible] = useState(false);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [index, setIndex] = useState(null);

  const locationName = watch("locationName");
  const locationId = watch("locationId");

  const normalizeText = (text) =>
    text
      .toLocaleLowerCase("tr-TR")
      .normalize("NFKD")
      .replace(/[\u0300-\u036F]/g, "");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await AxiosInstance.get("Location/GetLocationList");
        setData(response.data);

        const newIndex = new FlexSearch.Index({
          tokenize: "forward",
          encode: false,
          language: "tr",
        });

        response.data.forEach((item) => {
          const normalizedText = normalizeText(item.lokasyonTanim);
          newIndex.add(item.lokasyonId, normalizedText);
        });

        setIndex(newIndex);
      } catch (error) {
        console.error("API hata:", error);
      }
      setLoading(false);
    };

    if (visible) {
      fetchData();
    } else {
      setSearchTerm(""); // Clear search term when popover is closed
    }
  }, [visible]);

  const handleSelect = (value, id) => {
    setValue("locationName", value);
    setValue("locationId", id);
    setVisible(false);
  };

  const handleClear = () => {
    setValue("locationName", null);
    setValue("locationId", null);
  };

  const normalizedSearchTerm = normalizeText(searchTerm);

  const filteredData = React.useMemo(() => {
    if (!normalizedSearchTerm) {
      return data;
    }
    if (index) {
      const results = index.search(normalizedSearchTerm);
      return data.filter((item) => results.includes(item.lokasyonId));
    }
    return [];
  }, [normalizedSearchTerm, index, data]);

  const popoverContent = (
    <div style={{ width: "300px", height: "300px" }}>
      <Input placeholder="Ara..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} style={{ marginBottom: "10px" }} />
      <div style={{ height: "255px", overflowY: "auto" }}>
        {loading ? (
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          >
            <Spin />
          </div>
        ) : (
          filteredData.map((item) => (
            <div
              key={item.lokasyonId}
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "5px 10px",
                borderRadius: "5px",
                cursor: "pointer",
                backgroundColor: locationName === item.lokasyonTanim ? "#0086ff5c" : "white",
                border: locationName === item.lokasyonTanim ? "1px solid #0097ff" : "none",
                marginBottom: "5px",
              }}
              onClick={() => handleSelect(item.lokasyonTanim, item.lokasyonId)}
            >
              <span>{item.lokasyonTanim}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <div style={{ maxWidth: "300px", position: "relative" }}>
      <Popover content={popoverContent} trigger="click" open={visible} onOpenChange={(visible) => setVisible(visible)}>
        <Controller name="locationName" control={control} render={({ field }) => <Input {...field} placeholder="Seçim yapın" readOnly onClick={() => setVisible(true)} />} />
      </Popover>
      {locationName && locationId ? (
        <CloseCircleOutlined
          onClick={handleClear}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "rgba(0, 0, 0, 0.45)",
          }}
        />
      ) : (
        <DownOutlined
          onClick={() => setVisible(!visible)}
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            cursor: "pointer",
            color: "rgba(0, 0, 0, 0.45)",
          }}
        />
      )}
      <Controller name="locationId" control={control} render={({ field }) => <Input {...field} style={{ display: "none" }} />} />
    </div>
  );
};

export default PopoverSelectBox;
