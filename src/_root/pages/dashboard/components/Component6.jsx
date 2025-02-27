import React, { useEffect, useState } from "react";
import { Modal, Typography, Spin } from "antd";
import { useNavigate } from "react-router-dom"; // Import useNavigate

import http from "../../../../api/http.jsx";

const { Text } = Typography;

function Component5(updateApi) {
  const navigate = useNavigate(); // Initialize navigate
  const [data, setData] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [modalTitle, setModalTitle] = useState("");
  const [modalContent, setModalContent] = useState(null);

  const fetchData = async () => {
    setIsLoading(true);
    const body = {
      startYear: 2021,
    };
    try {
      const response = await http.post("Graphs/GetGraphInfoByType?type=12", body);
      if (response.data.statusCode === 401) {
        navigate("/unauthorized"); // Redirect to /unauthorized
        return; // Stop further execution
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showModal = (title, content) => {
    setModalTitle(title);
    setModalContent(content);
    setIsModalVisible(true);
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
  };
  const getRandomColor = () => {
    const letters = "0123456789ABCDEF";
    let color = "#";
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  };

  const hexToRgba = (hex, opacity) => {
    const bigint = parseInt(hex.slice(1), 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: "5px",
        backgroundColor: "white",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
        border: "1px solid #f0f0f0",
      }}
    >
      <div style={{ padding: "10px" }}>
        <Text style={{ fontWeight: "500", fontSize: "17px" }}> Hatırlatıcı </Text>
      </div>
      {isLoading ? (
        <Spin size="large" />
      ) : (
        <div
          style={{
            display: "flex",
            flexFlow: "wrap",
            justifyContent: "space-evenly",
            gap: "10px",
            overflow: "auto",
            height: "100vh",
            alignItems: "center",
            flexWrap: "wrap",
            flexDirection: "row",
            alignContent: "center",
          }}
        >
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Text
              style={{
                color: "green",
                fontSize: "50px",
              }}
            >
              {data?.yaklasanSure !== undefined ? data.yaklasanSure : ""}
            </Text>
            <Text> Süresi Yaklaşan </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Text
              style={{
                color: "#ffad00",
                fontSize: "50px",
              }}
            >
              {data?.kritikSure !== undefined ? data.kritikSure : ""}
            </Text>
            <Text> Kritik Süre </Text>
          </div>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column" }}>
            <Text
              style={{
                color: "red",
                fontSize: "50px",
              }}
            >
              {data?.gecenSure !== undefined ? data.gecenSure : ""}
            </Text>
            <Text> Süresi Geçen </Text>
          </div>
        </div>
      )}
      <Modal width="90%" centered title={modalTitle} open={isModalVisible} onOk={handleOk} onCancel={handleCancel}>
        <div>{modalContent}</div>
      </Modal>
    </div>
  );
}

export default Component5;
