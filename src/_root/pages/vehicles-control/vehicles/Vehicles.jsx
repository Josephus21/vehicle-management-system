import React, { useCallback, useEffect, useState } from "react";
import AxiosInstance from "../../../../api/http";
import AraclarTablo from "./AraclarTablo";
import { Spin } from "antd";

function Vehicles() {
  const [ayarlarData, setAyarlarData] = useState(null);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchAyarlardata = async () => {
    try {
      setDataLoaded(false);
      const response = await AxiosInstance.get("ReminderSettings/GetReminderSettingsItems");
      if (response.data) {
        setAyarlarData(response.data);
      } else {
        setAyarlarData(null); // Or set to an empty array if appropriate
      }
      setDataLoaded(true); // Always set dataLoaded to true
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setDataLoaded(true); // Ensure dataLoaded is true even if there's an error
    }
  };

  useEffect(() => {
    fetchAyarlardata();
  }, []);

  return <div>{ayarlarData ? <AraclarTablo ayarlarData={ayarlarData} /> : <Spin />}</div>;
}

export default Vehicles;
