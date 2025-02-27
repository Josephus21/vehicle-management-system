// src/components/YapayZekayaSor.js

import React, { useState, useEffect, useRef } from "react";
import { Button, Modal, Input, List, Typography, Divider, Spin, message as AntMessage, Table } from "antd";
import AxiosInstance from "../../../../../../../../api/http";
import { isMarkdownTable } from "./utils/isMarkdownTable";
import { parseMarkdownTable } from "./utils/parseMarkdownTable";
import { splitMarkdownTable } from "./utils/splitMarkdownTable";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import "./YapayZekayaSor.css"; // Ensure this path is correct

const { TextArea } = Input;

// Tabloyu render eden bileşen
const TableRenderer = ({ markdown }) => {
  const { columns, data } = parseMarkdownTable(markdown);
  if (!columns || !data) {
    return <div>Tablo verisi hatalı.</div>;
  }
  return <Table columns={columns} dataSource={data} pagination={false} bordered />;
};

// Normal metni render eden bileşen
const TextRenderer = ({ text }) => {
  return <ReactMarkdown remarkPlugins={[remarkGfm]}>{text}</ReactMarkdown>;
};

function YapayZekayaSor({ selectedRows }) {
  // Modal görünürlüğünü kontrol eden durum
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Sohbet mesajlarını saklayan durum
  const [messages, setMessages] = useState([]);

  // Kullanıcının girdiği mesajı saklayan durum
  const [userInput, setUserInput] = useState("");

  // API'den gelen araç bilgilerini saklayan durum
  const [vehicleData, setVehicleData] = useState(null);

  // İlk yükleme durumunu tutan state
  const [initialLoading, setInitialLoading] = useState(false);

  // Yanıt beklerken (mesaj gönderdiğimizde) bekleme durumunu tutan state
  const [responseLoading, setResponseLoading] = useState(false);

  // Mesaj listesini otomatik kaydırmak için ref
  const messageListRef = useRef(null);

  // Use environment variable for Gemini API key
  const GEMINI = import.meta.env.VITE_APP_GEMINI;

  // Modal açıldığında araç bilgilerini çek ve sohbete başla
  const showModal = async () => {
    if (!selectedRows || !selectedRows.key) {
      AntMessage.error("Bir araç seçmelisiniz.");
      return;
    }

    setIsModalVisible(true);
    setInitialLoading(true);

    try {
      const response = await AxiosInstance.get(`Vehicle/GetVehicleById`, {
        params: { id: selectedRows.key },
      });

      setVehicleData(response.data);
    } catch (error) {
      console.error("API Hatası:", error);
      AntMessage.error("Araç bilgileri yüklenirken bir hata oluştu.");
      setIsModalVisible(false);
    }
  };

  // Modal'ı kapatma fonksiyonu
  const handleCancel = () => {
    setIsModalVisible(false);
    setMessages([]);
    setUserInput("");
    setVehicleData(null);
  };

  useEffect(() => {
    if (vehicleData) {
      sendToGemini("Araç bilgileri: " + JSON.stringify(vehicleData));
    }
  }, [vehicleData]);

  // Google Gemini API'ye mesaj gönderme fonksiyonu
  const sendToGemini = async (message) => {
    const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI}`;

    try {
      const response = await fetch(GEMINI_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: message,
                },
              ],
            },
          ],
          systemInstruction: {
            role: "system",
            parts: [
              {
                text:
                  "Sen bir araç bilgisi asistanısın. Aşağıda araçla ilgili detaylı bilgiler verilmiştir. Bu bilgileri kullanarak kullanıcının sorularına cevap ver. Kullanıcı bir soru sormasını bekle:\n" +
                  JSON.stringify(vehicleData),
              },
            ],
          },
        }),
      });

      if (response) {
        setInitialLoading(false);
      }

      if (!response.ok) {
        throw new Error(`Google Gemini API Hatası: ${response.statusText}`);
      }

      const data = await response.json();
      const geminiResponse = data.candidates[0].content.parts[0].text;

      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: geminiResponse }]);
    } catch (error) {
      console.error("Gemini API Hatası:", error);
      AntMessage.error("Google Gemini API ile iletişim kurulamadı.");
      setMessages((prevMessages) => [...prevMessages, { sender: "bot", text: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
    }
  };

  // Mesaj gönderme fonksiyonu
  const handleSend = async () => {
    if (userInput.trim() === "") return;

    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    // Yanıt beklerken loading aç
    setResponseLoading(true);

    try {
      await sendToGemini(userInput);
    } catch (error) {
      console.error("Mesaj gönderme sırasında hata:", error);
      setMessages((prev) => [...prev, { sender: "bot", text: "Bir hata oluştu. Lütfen tekrar deneyin." }]);
      AntMessage.error("Mesaj gönderilirken bir hata oluştu.");
    } finally {
      setResponseLoading(false);
    }
  };

  // Mesajlar güncellendiğinde otomatik kaydır
  useEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  // Mesaj render işlemini güncelleme
  const renderMessage = (item) => {
    const isUser = item.sender === "user";

    if (isUser) {
      return (
        <List.Item
          key={item.key || Math.random()} // unique key
          style={{
            display: "flex",
            justifyContent: "flex-end",
          }}
        >
          <div
            style={{
              backgroundColor: "#e6f7ff",
              padding: "8px 12px",
              borderRadius: "8px",
              maxWidth: "80%",
              wordBreak: "break-word",
              textAlign: "right",
            }}
          >
            <TextRenderer text={item.text} />
          </div>
        </List.Item>
      );
    }

    // Bot mesajları için metni parçala
    const { before, table, after } = splitMarkdownTable(item.text);

    return (
      <List.Item
        key={item.key || Math.random()} // unique key
        style={{
          display: "flex",
          justifyContent: "flex-start",
        }}
      >
        <div
          style={{
            backgroundColor: "#f5f5f5",
            padding: "8px 12px",
            borderRadius: "8px",
            maxWidth: "80%",
            wordBreak: "break-word",
            textAlign: "left",
          }}
        >
          {before && <TextRenderer text={before} />}
          {table && <TableRenderer markdown={table} />}
          {after && <TextRenderer text={after} />}
        </div>
      </List.Item>
    );
  };

  return (
    <div>
      <div style={{ cursor: "pointer" }} onClick={showModal}>
        Yapay Zekaya Sor
      </div>

      <Modal title="Yapay Zeka ile Sohbet" open={isModalVisible} onCancel={handleCancel} footer={null} width={1200}>
        {initialLoading ? (
          <div style={{ textAlign: "center", marginBottom: "20px" }}>
            <Spin />
          </div>
        ) : (
          <>
            <div ref={messageListRef} style={{ maxHeight: "calc(100vh - 310px)", overflowY: "auto" }}>
              <List dataSource={messages} renderItem={renderMessage} locale={{ emptyText: "Sohbete başlayın!" }} />
            </div>
            <Divider />
            <TextArea
              rows={4}
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              placeholder="Mesajınızı yazın..."
              onPressEnter={(e) => {
                if (!e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              disabled={responseLoading}
            />
            <Button type="primary" onClick={handleSend} style={{ marginTop: "10px" }} block disabled={responseLoading}>
              {responseLoading ? <Spin /> : "Gönder"}
            </Button>
          </>
        )}
      </Modal>
    </div>
  );
}

export default YapayZekayaSor;
