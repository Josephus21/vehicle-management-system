import React, { useEffect, useState, useCallback } from "react";
import AxsiosInstance from "../../../../../../../../api/http";
import { Table, Select, Input, Button, message, Spin, Modal } from "antd";
import AxiosInstance from "../../../../../../../../api/http.jsx";
import { HolderOutlined, SearchOutlined, MenuOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons";
import { useFormContext } from "react-hook-form";
import EditDurum from "./EditDurum.jsx";
import IsertDurum from "./InsertDurum.jsx";
import { IoSettings } from "react-icons/io5";

function DurumModal({ guncellemeBasarili }) {
  const [colorList, setColorList] = useState([]);
  const [data, setData] = useState([]);
  const { setValue } = useFormContext();
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [drawer, setDrawer] = useState({
    visible: false,
    data: null,
  });

  const fetchEquipmentData = async () => {
    try {
      setLoading(true);
      // API isteğinde keyword ve currentPage kullanılıyor
      const response = await AxiosInstance.get(`AppraisalsSettings/GetAppraisalsSettings`);
      if (response) {
        // Gelen veriyi formatla ve state'e ata
        const formattedData = response.data.map((item) => ({
          ...item,
          key: item.aracEkspertizAyarId,
          // Diğer alanlarınız...
        }));
        setData(formattedData);
        setLoading(false);
      } else {
        console.error("API response is not in expected format");
        setLoading(false);
      }
    } catch (error) {
      console.error("Error in API request:", error);
      setLoading(false);
      if (navigator.onLine) {
        // İnternet bağlantısı var
        message.error("Hata Mesajı: " + error.message);
      } else {
        // İnternet bağlantısı yok
        message.error("Internet Bağlantısı Mevcut Değil.");
      }
    }
  };

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const columns = [
    {
      title: "Durum ve Renk",
      key: "durumRenk",
      render: (text, record) => (
        <div style={{ display: "flex", alignItems: "center" }}>
          <div
            style={{
              width: 15,
              height: 15,
              borderRadius: "50%",
              backgroundColor: record.aracEkspertizRenk, // Assuming aracEkspertizRenk contains the color code
              marginRight: 10,
            }}
          />
          <a onClick={() => onRowClick(record)}>{record.aracEkspertizDurum}</a>
        </div>
      ),
    },
  ];

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);
    if (newSelectedRowKeys.length > 0) {
      setValue("selectedLokasyonId", newSelectedRowKeys[0]);
    } else {
      setValue("selectedLokasyonId", null);
    }
    // Seçilen satırların verisini bul
    const newSelectedRows = data.filter((row) => newSelectedRowKeys.includes(row.key));
    setSelectedRows(newSelectedRows); // Seçilen satırların verilerini state'e ata
  };

  const rowSelection = {
    type: "checkbox",
    selectedRowKeys,
    onChange: onSelectChange,
  };

  const onRowClick = (record) => {
    setDrawer({ visible: true, data: record });
  };

  const normalizeString = (str) => {
    if (str === null) {
      return "";
    }
    return str
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/ğ/gim, "g")
      .replace(/ü/gim, "u")
      .replace(/ş/gim, "s")
      .replace(/ı/gim, "i")
      .replace(/ö/gim, "o")
      .replace(/ç/gim, "c");
  };

  useEffect(() => {
    const filtered = data.filter((item) => normalizeString(item.aracEkspertizDurum).includes(normalizeString(searchTerm)));
    setFilteredData(filtered);
  }, [searchTerm, data]);

  const showModal = () => {
    setIsModalVisible(true);
    fetchEquipmentData();
  };

  const handleOk = () => {
    setIsModalVisible(false);
  };

  const handleCancel = () => {
    setIsModalVisible(false);
    guncellemeBasarili();
  };

  const refreshTableData = useCallback(() => {
    // Sayfa numarasını 1 yap
    // setCurrentPage(1);

    // `body` içerisindeki filtreleri ve arama terimini sıfırla
    // setBody({
    //   keyword: "",
    //   filters: {},
    // });
    // setSearchTerm("");

    // Tablodan seçilen kayıtların checkbox işaretini kaldır
    setSelectedRowKeys([]);
    setSelectedRows([]);

    // Verileri yeniden çekmek için `fetchEquipmentData` fonksiyonunu çağır
    fetchEquipmentData();
    // Burada `body` ve `currentPage`'i güncellediğimiz için, bu değerlerin en güncel hallerini kullanarak veri çekme işlemi yapılır.
    // Ancak, `fetchEquipmentData` içinde `body` ve `currentPage`'e bağlı olarak veri çekiliyorsa, bu değerlerin güncellenmesi yeterli olacaktır.
    // Bu nedenle, doğrudan `fetchEquipmentData` fonksiyonunu çağırmak yerine, bu değerlerin güncellenmesini bekleyebiliriz.
  }, []); // Bağımlılıkları kaldırdık, çünkü fonksiyon içindeki değerler zaten en güncel halleriyle kullanılıyor.

  return (
    <div>
      <Button type="primary" onClick={showModal} style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
        <IoSettings style={{ fontSize: "20px" }} />
      </Button>

      <Modal
        title="Durum Listesi"
        width={800}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
        footer={null} // Remove default footer buttons
      >
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <Input
              style={{ width: "250px", maxWidth: "200px" }}
              type="text"
              placeholder="Arama yap..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<SearchOutlined style={{ color: "#0091ff" }} />}
            />
            <IsertDurum onRefresh={refreshTableData} />
          </div>
          <Spin spinning={loading}>
            <Table
              rowSelection={rowSelection}
              columns={columns}
              dataSource={searchTerm ? filteredData : data}
              pagination={{
                defaultPageSize: 10,
                showSizeChanger: true,
                pageSizeOptions: ["10", "20", "50", "100"],
                position: ["bottomRight"],
                showTotal: (total, range) => `Toplam ${total}`,
                showQuickJumper: true,
              }}
              scroll={{ y: "calc(100vh - 370px)" }}
            />
          </Spin>
          <EditDurum selectedRow={drawer.data} onDrawerClose={() => setDrawer({ ...drawer, visible: false })} drawerVisible={drawer.visible} onRefresh={refreshTableData} />
        </div>
      </Modal>
    </div>
  );
}

export default DurumModal;
