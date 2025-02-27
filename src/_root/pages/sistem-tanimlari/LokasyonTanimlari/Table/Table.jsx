import React, { useCallback, useEffect, useState } from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import { Input, Table, Spin } from "antd";
import AxiosInstance from "../../../../../api/http.jsx";
import CreateDrawer from "../Insert/CreateDrawer";
import { HomeOutlined, SearchOutlined } from "@ant-design/icons";
import EditDrawer from "../Update/EditDrawer";
import BreadcrumbComp from "../../../../components/breadcrumb/Breadcrumb.jsx";
import ContextMenu from "../components/ContextMenu/ContextMenu.jsx";
import { t } from "i18next";
import styled from "styled-components";

const breadcrumb = [{ href: "/", title: <HomeOutlined /> }, { title: t("lokasyonTanimlari") }];

const CustomSpin = styled(Spin)`
  .ant-spin-dot-item {
    background-color: #0091ff !important; /* Blue color */
  }
`;

export default function MainTable() {
  const { watch, control, setValue } = useFormContext();
  const { fields, append, replace } = useFieldArray({
    control,
    name: "lokasyon", // Name of the field array
  });

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]); // State for selected rows
  const [loading, setLoading] = useState(true);

  // edit drawer için
  const [drawer, setDrawer] = useState({
    visible: false,
    data: null,
  });
  // edit drawer için son

  // arama işlevi için

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [expandedRowKeys, setExpandedRowKeys] = useState([]);

  useEffect(() => {
    const timerId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 1000); // 1000 ms gecikme

    return () => clearTimeout(timerId); // Kullanıcı yazmaya devam ederse timeout'u iptal et
  }, [searchTerm]);

  const toLowerTurkish = (str) => {
    return str.replace(/İ/g, "i").replace(/I/g, "ı").toLowerCase();
  };

  const filterTree = (nodeList, searchTerm, path = []) => {
    let isMatchFound = false;
    let expandedKeys = [];

    const lowerSearchTerm = toLowerTurkish(searchTerm);

    const filtered = nodeList
      .map((node) => {
        let nodeMatch = toLowerTurkish(node.LOK_TANIM).includes(lowerSearchTerm);
        let childrenMatch = false;
        let filteredChildren = [];

        if (node.children) {
          const result = filterTree(node.children, lowerSearchTerm, path.concat(node.key));
          childrenMatch = result.isMatch;
          filteredChildren = result.filtered;
          expandedKeys = expandedKeys.concat(result.expandedKeys);
        }

        if (nodeMatch || childrenMatch) {
          isMatchFound = true;
          expandedKeys = expandedKeys.concat(path);
          // Eğer düğüm eşleşirse, tüm çocuklarını da dahil et
          return { ...node, children: childrenMatch ? filteredChildren : node.children };
        }

        return null;
      })
      .filter((node) => node !== null);

    return { filtered, isMatch: isMatchFound, expandedKeys };
  };

  useEffect(() => {
    if (debouncedSearchTerm) {
      const result = filterTree(fields, debouncedSearchTerm);
      setFilteredData(result.filtered);
      setExpandedRowKeys([...new Set(result.expandedKeys)]);
    } else {
      setFilteredData(fields);
      setExpandedRowKeys([]);
    }
  }, [debouncedSearchTerm, fields]);

  const onTableRowExpand = (expanded, record) => {
    const keys = expanded ? [...expandedRowKeys, record.key] : expandedRowKeys.filter((k) => k !== record.key);

    setExpandedRowKeys(keys);
  };

  // arama işlevi için son

  useEffect(() => {
    fetchEquipmentData();
  }, []);

  const fetchEquipmentData = async () => {
    try {
      setLoading(true); // Yükleme başladığında
      const response = await AxiosInstance.get("Location/GetLocationList");
      if (response.data) {
        const formattedData = formatDataForTable(response.data);
        replace(formattedData); // Populate the field array
        setLoading(false); // Yükleme bittiğinde
      } else {
        console.error("API response is not in expected format");
      }
    } catch (error) {
      console.error("Error in API request:", error);
      setLoading(false); // Hata durumunda da yükleme bitti
    }
  };

  const formatDataForTable = (data) => {
    let nodes = {};
    let tree = [];

    // Her bir lokasyonu bir node olarak hazırlayın
    data.forEach((item) => {
      nodes[item.lokasyonId] = {
        ...item,
        key: item.lokasyonId,
        lokasyonTanim: item.lokasyonTanim,
        lokasyonTip: item.lokasyonTipId,
        lokasyonPersonel: item.lokasyonDegistirenId,
        children: [],
      };
    });

    // Lokasyonlar arasındaki ilişkileri kurun
    data.forEach((item) => {
      if (item.anaLokasyonId && nodes[item.anaLokasyonId]) {
        // Çocuk düğümleri burada oluşturun
        nodes[item.anaLokasyonId].children.push(nodes[item.lokasyonId]);
      } else {
        // Eğer üst düzey bir lokasyon ise, ağacın köküne ekleyin
        tree.push(nodes[item.lokasyonId]);
      }
    });

    // Çocukları olmayan düğümlerde children alanını silin
    Object.values(nodes).forEach((node) => {
      if (node.children.length === 0) {
        delete node.children;
      }
    });

    return tree;
  };

  const columns = [
    // {
    //   title: "",
    //   key: "key",
    //   dataIndex: "key",
    //   width: 150,
    //   render: (text, record) => <div >{record.key}</div>,
    // },
    {
      title: "Lokasyon Tanımı",
      key: "lokasyonBilgisi",
      width: "100%",
      ellipsis: true,
      render: (text, record) => <div>{record.lokasyonTanim}</div>,
    },
    // {
    //   title: "Lokasyon Tipi",
    //   key: "LOK_TIP",
    //   width: 150,
    //   ellipsis: true,
    //   render: (text, record) => <div>{record.lokasyonTip}</div>,
    // },
    // {
    //   title: "Yönetici",
    //   key: "LOK_PERSONEL",
    //   width: 150,
    //   ellipsis: true,
    //   render: (text, record) => <div>{record.lokasyonPersonel}</div>,
    // },
    // Other columns...
  ];

  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows); // Update selected rows state
    // Seçilen satırın ID'sini formun bir alanına yazdır
    if (newSelectedRowKeys.length > 0) {
      setValue("selectedLokasyonId", newSelectedRowKeys[0]);
    } else {
      setValue("selectedLokasyonId", null);
    }
  };

  const rowSelection = {
    type: "radio", // Radio tipi seçim kutuları kullan
    selectedRowKeys,
    onChange: onSelectChange,
    // You can add more configuration here if needed
  };

  const onRowClick = (record) => {
    return {
      onClick: () => {
        setDrawer({ visible: true, data: record });
      },
    };
  };

  // kaydet düğmesine basıldıktan sonra apiye tekrardan istek atmasını sağlamak
  const refreshTableData = useCallback(() => {
    // Assuming `fetch` is your function to fetch table data
    fetchEquipmentData();
  }, [fetchEquipmentData]);

  // kaydet düğmesine basıldıktan sonra apiye tekrardan istek atmasını sağlamak son

  return (
    <div>
      {/* <div
        style={{
          backgroundColor: "white",
          marginBottom: "15px",
          padding: "15px",
          borderRadius: "8px 8px 8px 8px",
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
        }}
      >
        <BreadcrumbComp items={breadcrumb} />
      </div> */}
      <div
        style={{
          backgroundColor: "white",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          marginBottom: "15px",
          gap: "10px",
          padding: "15px",
          borderRadius: "8px 8px 8px 8px",
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", flexDirection: "row", gap: "10px" }}>
          <Input
            style={{ width: "250px" }}
            type="text"
            placeholder="Arama yap..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            prefix={<SearchOutlined style={{ color: "#0091ff" }} />} // Arama ikonunu ekle
          />
          <CreateDrawer selectedLokasyonId={selectedRowKeys[0]} onRefresh={refreshTableData} />
        </div>

        <ContextMenu selectedRows={selectedRows} refreshTableData={refreshTableData} />
      </div>
      <div
        style={{
          backgroundColor: "white",
          padding: "10px",
          height: "calc(100vh - 290px)",
          borderRadius: "8px 8px 8px 8px",
          filter: "drop-shadow(0px 2px 4px rgba(0,0,0,0.1))",
        }}
      >
        <CustomSpin spinning={loading}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={debouncedSearchTerm ? filteredData : fields}
            pagination={false}
            onRow={onRowClick}
            scroll={{ y: "calc(100vh - 300px)" }}
            expandedRowKeys={expandedRowKeys}
            onExpand={onTableRowExpand} // Elle genişletme/küçültme işlemlerini takip et
          />
        </CustomSpin>
        <EditDrawer selectedRow={drawer.data} onDrawerClose={() => setDrawer({ ...drawer, visible: false })} drawerVisible={drawer.visible} onRefresh={refreshTableData} />
      </div>
    </div>
  );
}
