import React, { useCallback, useEffect, useState } from "react";
import { Button, Input, Modal, Table } from "antd";
import { CheckOutlined, CloseOutlined, SearchOutlined } from "@ant-design/icons";
import { useFormContext } from "react-hook-form";
import AxiosInstance from "../../../../../../../../api/http";
import CreateModal from "./Insert/CreateModal";
import EditModal from "./Update/EditModal";

export default function KontrolListesiTablo({ isActive }) {
  const [loading, setLoading] = useState(false);
  const { control, watch, setValue } = useFormContext();
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRowsData, setSelectedRowsData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchCount, setSearchCount] = useState(0);
  const [debounceTimer, setDebounceTimer] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // tarihleri kullanıcının local ayarlarına bakarak formatlayıp ekrana o şekilde yazdırmak için

  // Intl.DateTimeFormat kullanarak tarih formatlama
  const formatDate = (date) => {
    if (!date) return "";

    // Örnek bir tarih formatla ve ay formatını belirle
    const sampleDate = new Date(2021, 0, 21); // Ocak ayı için örnek bir tarih
    const sampleFormatted = new Intl.DateTimeFormat(navigator.language).format(sampleDate);

    let monthFormat;
    if (sampleFormatted.includes("January")) {
      monthFormat = "long"; // Tam ad ("January")
    } else if (sampleFormatted.includes("Jan")) {
      monthFormat = "short"; // Üç harfli kısaltma ("Jan")
    } else {
      monthFormat = "2-digit"; // Sayısal gösterim ("01")
    }

    // Kullanıcı için tarihi formatla
    const formatter = new Intl.DateTimeFormat(navigator.language, {
      year: "numeric",
      month: monthFormat,
      day: "2-digit",
    });
    return formatter.format(new Date(date));
  };

  // tarihleri kullanıcının local ayarlarına bakarak formatlayıp ekrana o şekilde yazdırmak için sonu

  const columns = [
    {
      title: "İş Tanımı",
      dataIndex: "isTanim",
      key: "isTanim",
      width: 150,
      ellipsis: true,
      render: (text, record) => (
        <span
          style={{ cursor: "pointer", color: "#1890ff" }}
          onClick={() => {
            setSelectedRow(record);
            setIsModalVisible(true);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "İş Tipi",
      dataIndex: "isTip",
      key: "isTip",
      width: 100,
      ellipsis: true,
    },
    {
      title: "İşçilik Ücreti",
      dataIndex: "iscilikUcreti",
      key: "iscilikUcreti",
      width: 100,
      ellipsis: true,
    },
  ];

  const plaka = watch("Plaka");
  const aracID = watch("PlakaID");
  const secilenKayitID = watch("secilenKayitID");

  // const fetch = useCallback(() => {
  //   if (isActive) {
  //     setLoading(true);
  //     AxiosInstance.get(`FetchIsEmriKontrolList?isemriID=${secilenKayitID}`)
  //       .then((response) => {
  //         const fetchedData = response.map((item) => ({
  //           ...item,
  //           key: item.TB_ISEMRI_KONTROLLIST_ID,
  //         }));
  //         setData(fetchedData);
  //       })
  //       .catch((error) => {
  //         // Hata işleme
  //         console.error("API isteği sırasında hata oluştu:", error);
  //       })
  //       .finally(() => setLoading(false));
  //   }
  // }, [secilenKayitID, isActive]); // secilenKayitID değiştiğinde fetch fonksiyonunu güncelle

  const fetch = useCallback(() => {
    if (isActive) {
      setLoading(true);

      AxiosInstance.get(`ServiceWorkCard/GetServiceWorkCardByServiceId?serviceId=${secilenKayitID}&page=${pagination.current}&parameter=${searchTerm}`)
        .then((response) => {
          const { list, recordCount } = response.data;
          const fetchedData = list.map((item) => ({
            ...item,
            key: item.siraNo,
          }));
          setData(fetchedData);
          setPagination((prev) => ({
            ...prev,
            total: recordCount,
          }));
        })
        .finally(() => setLoading(false));
    }
  }, [pagination.current, searchTerm, isActive, secilenKayitID]); // pagination.current, searchTerm veya plakaID değiştiğinde fetch fonksiyonunu güncelle

  useEffect(() => {
    if (secilenKayitID) {
      // secilenKayitID'nin varlığını ve geçerliliğini kontrol edin
      fetch(); // fetch fonksiyonunu çağırın
    }
  }, [secilenKayitID]); // secilenKayitID veya fetch fonksiyonu değiştiğinde useEffect'i tetikle

  const onRowSelectChange = (selectedKeys) => {
    setSelectedRowKeys(selectedKeys.length ? [selectedKeys[0]] : []);
  };

  const onRowClick = (record) => {
    setSelectedRow(record);
    setIsModalVisible(true);
  };

  const refreshTable = useCallback(() => {
    fetch(); // fetch fonksiyonu tabloyu yeniler
    setValue("refreshTable", true);
  }, [fetch]);

  const handleTableChange = (newPagination) => {
    setPagination(newPagination);
  };

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timeout = setTimeout(() => {
      if (searchTerm.trim() !== "") {
        fetch(); // Trigger the API request based on your search logic
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search term changes
        setSearchCount(searchCount + 1);
      } else if (searchTerm.trim() === "" && searchCount > 0) {
        fetch(); // Fetch data without search term
        setPagination((prev) => ({ ...prev, current: 1 })); // Reset to page 1 when search term changes
      }
    }, 2000);

    setDebounceTimer(timeout);

    return () => clearTimeout(timeout);
  }, [searchTerm, fetch]);

  return (
    <div style={{ marginBottom: "25px" }}>
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <Input
          style={{ width: "250px", marginBottom: "10px" }}
          type="text"
          placeholder="Arama yap..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          prefix={<SearchOutlined style={{ color: "#0091ff" }} />}
        />
        <CreateModal onRefresh={refreshTable} secilenKayitID={secilenKayitID} plaka={plaka} aracID={aracID} />
      </div>

      <Table
        rowSelection={{
          type: "checkbox", // Change from 'radio' to 'checkbox'
          selectedRowKeys,
          onChange: (selectedKeys, selectedRows) => {
            setSelectedRowKeys(selectedKeys);
            setSelectedRowsData(selectedRows); // Store the selected rows' data
          },
        }}
        size={"small"}
        columns={columns}
        dataSource={data}
        pagination={pagination}
        onChange={handleTableChange}
        loading={loading}
        scroll={{
          // x: "auto",
          y: "100px",
        }}
      />
      {isModalVisible && (
        <EditModal
          selectedRow={selectedRow}
          isModalVisible={isModalVisible}
          onModalClose={() => {
            setIsModalVisible(false);
            setSelectedRow(null);
          }}
          onRefresh={refreshTable}
          secilenUstKayitID={secilenKayitID}
        />
      )}
    </div>
  );
}
