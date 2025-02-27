import React, { useCallback, useEffect, useState } from "react";
import { Table, Button, Modal, Checkbox, Input, Spin, Typography, Tag, message, Tooltip, Popover, Tour } from "antd";
import { HolderOutlined, SearchOutlined, MenuOutlined, HomeOutlined, ArrowDownOutlined, ArrowUpOutlined, CheckOutlined, CloseOutlined, MoreOutlined } from "@ant-design/icons";
import { DndContext, useSensor, useSensors, PointerSensor, KeyboardSensor } from "@dnd-kit/core";
import { sortableKeyboardCoordinates, arrayMove, useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Resizable } from "react-resizable";
import "./ResizeStyle.css";
import AxiosInstance from "../../../../../api/http";
import { useFormContext } from "react-hook-form";
import styled from "styled-components";
import dayjs from "dayjs";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";

const { Text } = Typography;

const StyledButton = styled(Button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0px 8px;
  height: 32px !important;
`;

// Sütunların boyutlarını ayarlamak için kullanılan component

const ResizableTitle = (props) => {
  const { onResize, width, ...restProps } = props;

  // tabloyu genişletmek için kullanılan alanın stil özellikleri
  const handleStyle = {
    position: "absolute",
    bottom: 0,
    right: "-5px",
    width: "20%",
    height: "100%", // this is the area that is draggable, you can adjust it
    zIndex: 2, // ensure it's above other elements
    cursor: "col-resize",
    padding: "0px",
    backgroundSize: "0px",
  };

  if (!width) {
    return <th {...restProps} />;
  }
  return (
    <Resizable
      width={width}
      height={0}
      handle={
        <span
          className="react-resizable-handle"
          onClick={(e) => {
            e.stopPropagation();
          }}
          style={handleStyle}
        />
      }
      onResize={onResize}
      draggableOpts={{
        enableUserSelectHack: false,
      }}
    >
      <th {...restProps} />
    </Resizable>
  );
};
// Sütunların boyutlarını ayarlamak için kullanılan component sonu

// Sütunların sürüklenebilir olmasını sağlayan component

const DraggableRow = ({ id, text, index, moveRow, className, style, visible, onVisibilityChange, ...restProps }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const styleWithTransform = {
    ...style,
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    backgroundColor: isDragging ? "#f0f0f0" : "",
    display: "flex",
    alignItems: "center",
    gap: 8,
  };

  return (
    <div ref={setNodeRef} style={styleWithTransform} {...restProps} {...attributes}>
      {/* <Checkbox
        checked={visible}
        onChange={(e) => onVisibilityChange(index, e.target.checked)}
        style={{ marginLeft: "auto" }}
      /> */}
      <div
        {...listeners}
        style={{
          cursor: "grab",
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
        }}
      >
        <HolderOutlined style={{ marginRight: 8 }} />
        {text}
      </div>
    </div>
  );
};

// Sütunların sürüklenebilir olmasını sağlayan component sonu

const AraclarArasiYakitGiderKarsilastirmaTablosu = () => {
  const {
    control,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useFormContext();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [data, setData] = useState([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [localeDateFormat, setLocaleDateFormat] = useState("DD/MM/YYYY"); // Varsayılan format
  const [localeTimeFormat, setLocaleTimeFormat] = useState("HH:mm"); // Default time format
  const [loading, setLoading] = useState(false); // Set initial loading state to false
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0); // Total data count
  const [popoverVisible, setPopoverVisible] = useState(false); // Popover için state
  const [tourVisible, setTourVisible] = useState(false); // Tour için state
  const [isExpandedModalVisible, setIsExpandedModalVisible] = useState(false); // Expanded modal visibility state
  const [pageSize, setPageSize] = useState(10); // Page size
  const [drawer, setDrawer] = useState({
    visible: false,
    data: null,
  });
  const navigate = useNavigate();

  const [selectedRows, setSelectedRows] = useState([]);

  const lokasyonId = watch("locationValues");
  const plakaValues = watch("plakaValues");
  const aracTipiValues = watch("aracTipiValues");
  const departmanValues = watch("departmanValues");
  const baslangicTarihi = watch("baslangicTarihi") ? dayjs(watch("baslangicTarihi")).format("YYYY-MM-DD") : null;
  const bitisTarihi = watch("bitisTarihi") ? dayjs(watch("bitisTarihi")).format("YYYY-MM-DD") : null;

  const startYear = baslangicTarihi ? dayjs(baslangicTarihi).year() : 0;
  const endYear = bitisTarihi ? dayjs(bitisTarihi).year() : 0;

  // API Data Fetching with diff and setPointId
  const fetchData = async (diff, targetPage) => {
    setLoading(true);
    const body = {
      plaka: plakaValues || "",
      aracTipi: aracTipiValues || "",
      lokasyon: lokasyonId || "",
      departman: departmanValues || "",
      startDate: baslangicTarihi || null,
      endDate: bitisTarihi || null,
      startYear: startYear,
      endYear: endYear,
      parameterType: 1,
      searchTerm: searchTerm || null,
    };
    try {
      let currentSetPointId = 0;

      if (diff > 0) {
        // Moving forward
        currentSetPointId = data[data.length - 1]?.aracId || 0;
      } else if (diff < 0) {
        // Moving backward
        currentSetPointId = data[0]?.aracId || 0;
      } else {
        currentSetPointId = 0;
      }

      const response = await AxiosInstance.post(`ModuleAnalysis/FuelAnalysis/GetFuelAnalysisInfoByType?type=9&diff=${diff}&setPointId=${currentSetPointId}`, body);

      const total = response.data.recordCount;
      setTotalCount(total);
      setCurrentPage(targetPage);

      const newData = response.data.list.map((item) => ({
        ...item,
        key: item.aracId, // Assign key directly from siraNo
      }));

      if (newData.length > 0) {
        setData(newData);
      } else {
        message.warning("No data found.");
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      message.error("An error occurred while fetching data.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(0, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDateWithDayjs = (dateString) => {
    const formattedDate = dayjs(dateString);
    return formattedDate.isValid() ? formattedDate.format("YYYY-MM-DD") : "";
  };

  // sistemin locale'una göre tarih formatlamasını yapar
  const formatDateWithLocale = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(navigator.language).format(date);
  };

  // tarih formatlamasını kullanıcının yerel tarih formatına göre ayarlayın

  useEffect(() => {
    // Format the date based on the user's locale
    const dateFormatter = new Intl.DateTimeFormat(navigator.language);
    const sampleDate = new Date(2021, 10, 21);
    const formattedSampleDate = dateFormatter.format(sampleDate);
    setLocaleDateFormat(formattedSampleDate.replace("2021", "YYYY").replace("21", "DD").replace("11", "MM"));

    // Format the time based on the user's locale
    const timeFormatter = new Intl.DateTimeFormat(navigator.language, {
      hour: "numeric",
      minute: "numeric",
    });
    const sampleTime = new Date(2021, 10, 21, 13, 45); // Use a sample time, e.g., 13:45
    const formattedSampleTime = timeFormatter.format(sampleTime);

    // Check if the formatted time contains AM/PM, which implies a 12-hour format
    const is12HourFormat = /AM|PM/.test(formattedSampleTime);
    setLocaleTimeFormat(is12HourFormat ? "hh:mm A" : "HH:mm");
  }, []);

  // Search handling
  // Define handleSearch function
  const handleSearch = () => {
    fetchData(0, 1);
  };

  const handleTableChange = (page) => {
    const diff = page - currentPage;
    fetchData(diff, page);
  };

  const onSelectChange = (newSelectedRowKeys) => {
    setSelectedRowKeys(newSelectedRowKeys);

    // Find selected rows data
    const newSelectedRows = data.filter((row) => newSelectedRowKeys.includes(row.key));
    setSelectedRows(newSelectedRows);
  };

  const onRowClick = (record) => {
    setDrawer({ visible: true, data: record });
  };

  const refreshTableData = useCallback(() => {
    setSelectedRowKeys([]);
    setSelectedRows([]);
    fetchData(0, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Columns definition (adjust as needed)
  const initialColumns = [
    {
      title: t("plaka"),
      dataIndex: "plaka",
      key: "plaka",
      width: 200,
      ellipsis: true,
      visible: true,
      sorter: (a, b) => {
        if (a.plaka === null && b.plaka === null) return 0;
        if (a.plaka === null) return 1;
        if (b.plaka === null) return -1;
        return a.plaka.localeCompare(b.plaka);
      },
    },
    {
      title: t("model"),
      dataIndex: "model",
      key: "model",
      width: 200,
      ellipsis: true,
      visible: true,
      sorter: (a, b) => {
        if (a.model === null && b.model === null) return 0;
        if (a.model === null) return 1;
        if (b.model === null) return -1;
        return a.model.localeCompare(b.model);
      },
    },
    {
      title: t("surucuIsim"),
      dataIndex: "surucuIsim",
      key: "surucuIsim",
      width: 200,
      ellipsis: true,
      visible: true,
      sorter: (a, b) => {
        if (a.surucuIsim === null && b.surucuIsim === null) return 0;
        if (a.surucuIsim === null) return 1;
        if (b.surucuIsim === null) return -1;
        return a.surucuIsim.localeCompare(b.surucuIsim);
      },
    },
    {
      title: t("yakitTuketimi"),
      dataIndex: "toplamYakitTuketimi",
      key: "toplamYakitTuketimi",
      width: 100,
      ellipsis: true,
      visible: true,
      render: (value, record) => {
        if (!value) return null;
        return <span>{value.toFixed(Number(record?.ortalamaFormat) || 2)}</span>;
      },
      sorter: (a, b) => {
        if (a.toplamYakitTuketimi === null && b.toplamYakitTuketimi === null) return 0;
        if (a.toplamYakitTuketimi === null) return 1;
        if (b.toplamYakitTuketimi === null) return -1;
        return a.toplamYakitTuketimi - b.toplamYakitTuketimi;
      },
    },
    {
      title: t("km"),
      dataIndex: "toplamKm",
      key: "toplamKm",
      width: 100,
      ellipsis: true,
      visible: true,
      render: (value, record) => {
        if (!value) return null;
        return <span>{value.toFixed(Number(record?.tutarFormat) || 2)}</span>;
      },
      sorter: (a, b) => {
        if (a.toplamKm === null && b.toplamKm === null) return 0;
        if (a.toplamKm === null) return 1;
        if (b.toplamKm === null) return -1;
        return a.toplamKm - b.toplamKm;
      },
    },
    {
      title: t("kmBasinaYakit"),
      dataIndex: "kmBasinaYakit",
      key: "kmBasinaYakit",
      width: 100,
      ellipsis: true,
      visible: true,
      render: (value, record) => {
        if (!value) return null;
        return <span>{value.toFixed(Number(record?.ortalamaFormat) || 2)}</span>;
      },
      sorter: (a, b) => {
        if (a.kmBasinaYakit === null && b.kmBasinaYakit === null) return 0;
        if (a.kmBasinaYakit === null) return 1;
        if (b.kmBasinaYakit === null) return -1;
        return a.kmBasinaYakit - b.kmBasinaYakit;
      },
    },
    {
      title: t("yakitMaliyeti"),
      dataIndex: "toplamYakitMaliyeti",
      key: "toplamYakitMaliyeti",
      width: 100,
      ellipsis: true,
      visible: true,
      render: (value, record) => {
        if (!value) return null;
        return <span>{value.toFixed(Number(record?.tutarFormat) || 2)}</span>;
      },
      sorter: (a, b) => {
        if (a.toplamYakitMaliyeti === null && b.toplamYakitMaliyeti === null) return 0;
        if (a.toplamYakitMaliyeti === null) return 1;
        if (b.toplamYakitMaliyeti === null) return -1;
        return a.toplamYakitMaliyeti - b.toplamYakitMaliyeti;
      },
    },
    {
      title: t("ortalamaYakitFiyati"),
      dataIndex: "ortalamaYakitFiyati",
      key: "ortalamaYakitFiyati",
      width: 100,
      ellipsis: true,
      visible: true,
      render: (value, record) => {
        if (!value) return null;
        return <span>{value.toFixed(Number(record?.tutarFormat) || 2)}</span>;
      },
      sorter: (a, b) => {
        if (a.ortalamaYakitFiyati === null && b.ortalamaYakitFiyati === null) return 0;
        if (a.ortalamaYakitFiyati === null) return 1;
        if (b.ortalamaYakitFiyati === null) return -1;
        return a.ortalamaYakitFiyati - b.ortalamaYakitFiyati;
      },
    },
  ];

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

  const formatTime = (time) => {
    if (!time || time.trim() === "") return ""; // `trim` metodu ile baştaki ve sondaki boşlukları temizle

    try {
      // Saati ve dakikayı parçalara ayır, boşlukları temizle
      const [hours, minutes] = time
        .trim()
        .split(":")
        .map((part) => part.trim());

      // Saat ve dakika değerlerinin geçerliliğini kontrol et
      const hoursInt = parseInt(hours, 10);
      const minutesInt = parseInt(minutes, 10);
      if (isNaN(hoursInt) || isNaN(minutesInt) || hoursInt < 0 || hoursInt > 23 || minutesInt < 0 || minutesInt > 59) {
        // throw new Error("Invalid time format"); // hata fırlatır ve uygulamanın çalışmasını durdurur
        console.error("Invalid time format:", time);
        // return time; // Hatalı formatı olduğu gibi döndür
        return ""; // Hata durumunda boş bir string döndür
      }

      // Geçerli tarih ile birlikte bir Date nesnesi oluştur ve sadece saat ve dakika bilgilerini ayarla
      const date = new Date();
      date.setHours(hoursInt, minutesInt, 0);

      // Kullanıcının lokal ayarlarına uygun olarak saat ve dakikayı formatla
      // `hour12` seçeneğini belirtmeyerek Intl.DateTimeFormat'ın kullanıcının yerel ayarlarına göre otomatik seçim yapmasına izin ver
      const formatter = new Intl.DateTimeFormat(navigator.language, {
        hour: "numeric",
        minute: "2-digit",
        // hour12 seçeneği burada belirtilmiyor; böylece otomatik olarak kullanıcının sistem ayarlarına göre belirleniyor
      });

      // Formatlanmış saati döndür
      return formatter.format(date);
    } catch (error) {
      console.error("Error formatting time:", error);
      return ""; // Hata durumunda boş bir string döndür
      // return time; // Hatalı formatı olduğu gibi döndür
    }
  };

  // tarihleri kullanıcının local ayarlarına bakarak formatlayıp ekrana o şekilde yazdırmak için sonu

  // Manage columns from localStorage or default
  const [columns, setColumns] = useState(() => {
    const savedOrder = localStorage.getItem("columnOrderAraclarArasiKarsilastirma");
    const savedVisibility = localStorage.getItem("columnVisibilityAraclarArasiKarsilastirma");
    const savedWidths = localStorage.getItem("columnWidthsAraclarArasiKarsilastirma");

    let order = savedOrder ? JSON.parse(savedOrder) : [];
    let visibility = savedVisibility ? JSON.parse(savedVisibility) : {};
    let widths = savedWidths ? JSON.parse(savedWidths) : {};

    initialColumns.forEach((col) => {
      if (!order.includes(col.key)) {
        order.push(col.key);
      }
      if (visibility[col.key] === undefined) {
        visibility[col.key] = col.visible;
      }
      if (widths[col.key] === undefined) {
        widths[col.key] = col.width;
      }
    });

    localStorage.setItem("columnOrderAraclarArasiKarsilastirma", JSON.stringify(order));
    localStorage.setItem("columnVisibilityAraclarArasiKarsilastirma", JSON.stringify(visibility));
    localStorage.setItem("columnWidthsAraclarArasiKarsilastirma", JSON.stringify(widths));

    return order.map((key) => {
      const column = initialColumns.find((col) => col.key === key);
      return { ...column, visible: visibility[key], width: widths[key] };
    });
  });

  // Save columns to localStorage
  useEffect(() => {
    localStorage.setItem("columnOrderAraclarArasiKarsilastirma", JSON.stringify(columns.map((col) => col.key)));
    localStorage.setItem(
      "columnVisibilityAraclarArasiKarsilastirma",
      JSON.stringify(
        columns.reduce(
          (acc, col) => ({
            ...acc,
            [col.key]: col.visible,
          }),
          {}
        )
      )
    );
    localStorage.setItem(
      "columnWidthsAraclarArasiKarsilastirma",
      JSON.stringify(
        columns.reduce(
          (acc, col) => ({
            ...acc,
            [col.key]: col.width,
          }),
          {}
        )
      )
    );
  }, [columns]);

  // Handle column resize
  const handleResize =
    (key) =>
    (_, { size }) => {
      setColumns((prev) => prev.map((col) => (col.key === key ? { ...col, width: size.width } : col)));
    };

  const components = {
    header: {
      cell: ResizableTitle,
    },
  };

  const mergedColumns = columns.map((col) => ({
    ...col,
    onHeaderCell: (column) => ({
      width: column.width,
      onResize: handleResize(column.key),
    }),
  }));

  // Filtered columns
  const filteredColumns = mergedColumns.filter((col) => col.visible);

  // Handle drag and drop
  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = columns.findIndex((column) => column.key === active.id);
      const newIndex = columns.findIndex((column) => column.key === over.id);
      if (oldIndex !== -1 && newIndex !== -1) {
        setColumns((columns) => arrayMove(columns, oldIndex, newIndex));
      } else {
        console.error(`Column with key ${active.id} or ${over.id} does not exist.`);
      }
    }
  };

  // Toggle column visibility
  const toggleVisibility = (key, checked) => {
    const index = columns.findIndex((col) => col.key === key);
    if (index !== -1) {
      const newColumns = [...columns];
      newColumns[index].visible = checked;
      setColumns(newColumns);
    } else {
      console.error(`Column with key ${key} does not exist.`);
    }
  };

  // Reset columns
  const resetColumns = () => {
    localStorage.removeItem("columnOrderAraclarArasiKarsilastirma");
    localStorage.removeItem("columnVisibilityAraclarArasiKarsilastirma");
    localStorage.removeItem("columnWidthsAraclarArasiKarsilastirma");
    window.location.reload();
  };

  // Bileşen başlığını bir değişkene atayın
  const componentTitle = t("araclarArasiYakitTuketimiVeGiderKarsilastirmasi");

  const handleModalOpen = () => {
    setIsExpandedModalVisible(true);
    setPopoverVisible(false); // Modal açıldığında popover'ı kapatır
  };

  const handleTourOpen = () => {
    setTourVisible(true); // Tour'u açar
    setPopoverVisible(false); // Popover'ı kapatır
  };

  const steps = [
    // ... adımlar ...
  ];

  const content = (
    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
      <div style={{ cursor: "pointer" }} onClick={handleModalOpen}>
        Büyüt
      </div>
      <div style={{ cursor: "pointer" }} onClick={handleTourOpen}>
        Bilgi
      </div>
    </div>
  );

  return (
    <>
      {/* Modal for managing columns */}
      <Modal title="Sütunları Yönet" centered width={800} open={isModalVisible} onOk={() => setIsModalVisible(false)} onCancel={() => setIsModalVisible(false)}>
        <Text style={{ marginBottom: "15px" }}>Aşağıdaki Ekranlardan Sütunları Göster / Gizle ve Sıralamalarını Ayarlayabilirsiniz.</Text>
        <div
          style={{
            display: "flex",
            width: "100%",
            justifyContent: "center",
            marginTop: "10px",
          }}
        >
          <Button onClick={resetColumns} style={{ marginBottom: "15px" }}>
            Sütunları Sıfırla
          </Button>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div
            style={{
              width: "46%",
              border: "1px solid #8080806e",
              borderRadius: "8px",
              padding: "10px",
            }}
          >
            <div
              style={{
                marginBottom: "20px",
                borderBottom: "1px solid #80808051",
                padding: "8px 8px 12px 8px",
              }}
            >
              <Text style={{ fontWeight: 600 }}>Sütunları Göster / Gizle</Text>
            </div>
            <div style={{ height: "400px", overflow: "auto" }}>
              {initialColumns.map((col) => (
                <div style={{ display: "flex", gap: "10px" }} key={col.key}>
                  <Checkbox checked={columns.find((column) => column.key === col.key)?.visible || false} onChange={(e) => toggleVisibility(col.key, e.target.checked)} />
                  {col.title}
                </div>
              ))}
            </div>
          </div>

          <DndContext
            onDragEnd={handleDragEnd}
            sensors={useSensors(
              useSensor(PointerSensor),
              useSensor(KeyboardSensor, {
                coordinateGetter: sortableKeyboardCoordinates,
              })
            )}
          >
            <div
              style={{
                width: "46%",
                border: "1px solid #8080806e",
                borderRadius: "8px",
                padding: "10px",
              }}
            >
              <div
                style={{
                  marginBottom: "20px",
                  borderBottom: "1px solid #80808051",
                  padding: "8px 8px 12px 8px",
                }}
              >
                <Text style={{ fontWeight: 600 }}>Sütunların Sıralamasını Ayarla</Text>
              </div>
              <div style={{ height: "400px", overflow: "auto" }}>
                <SortableContext items={columns.filter((col) => col.visible).map((col) => col.key)} strategy={verticalListSortingStrategy}>
                  {columns
                    .filter((col) => col.visible)
                    .map((col, index) => (
                      <DraggableRow key={col.key} id={col.key} index={index} text={col.title} />
                    ))}
                </SortableContext>
              </div>
            </div>
          </DndContext>
        </div>
      </Modal>

      <div
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "5px",
          backgroundColor: "white",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          padding: "15px 10px 0px 10px",
          border: "1px solid #f0f0f0",
          filter: "drop-shadow(0 0 0.75rem rgba(0, 0, 0, 0.1))",
        }}
      >
        {/* Toolbar */}
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            gap: "10px",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              flexDirection: "row",
              gap: "10px",
              alignItems: "center",
            }}
          >
            <StyledButton onClick={() => setIsModalVisible(true)}>
              <MenuOutlined />
            </StyledButton>
            <Text style={{ fontWeight: "500", fontSize: "17px" }}>
              {componentTitle} {`(${baslangicTarihi && bitisTarihi ? `${formatDateWithLocale(baslangicTarihi)} / ${formatDateWithLocale(bitisTarihi)}` : ""})`}
            </Text>
          </div>

          <Popover placement="bottom" content={content} trigger="click" open={popoverVisible} onOpenChange={(visible) => setPopoverVisible(visible)}>
            <Button
              type="text"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "0px 5px",
                height: "32px",
                zIndex: 3,
              }}
            >
              <MoreOutlined style={{ cursor: "pointer", fontWeight: "500", fontSize: "16px" }} />
            </Button>
          </Popover>
        </div>
        {/* Table */}
        <div style={{ width: "100%", height: "calc(100% - 5px)", overflow: "auto" }}>
          <Spin spinning={loading}>
            <Table
              components={components}
              columns={filteredColumns}
              dataSource={data}
              pagination={{
                current: currentPage,
                total: totalCount,
                pageSize: 10,
                showSizeChanger: false,
                showQuickJumper: true,
                onChange: handleTableChange,
                showTotal: (total, range) => `Toplam ${total} kayıt`,
              }}
              scroll={{ y: "100vh" }}
            />
          </Spin>
        </div>

        <Tour open={tourVisible} onClose={() => setTourVisible(false)} steps={steps} />

        {/* Expanded Modal */}
        <Modal
          title={
            <div style={{ display: "flex", flexDirection: "row", gap: "10px", alignItems: "center" }}>
              <StyledButton onClick={() => setIsModalVisible(true)}>
                <MenuOutlined />
              </StyledButton>
              <Text style={{ fontWeight: "500", fontSize: "17px" }}>
                {componentTitle} {`(${baslangicTarihi && bitisTarihi ? `${formatDateWithLocale(baslangicTarihi)} / ${formatDateWithLocale(bitisTarihi)}` : ""})`}
              </Text>
            </div>
          }
          centered
          open={isExpandedModalVisible}
          onOk={() => setIsExpandedModalVisible(false)}
          onCancel={() => setIsExpandedModalVisible(false)}
          width="90%"
          destroyOnClose
        >
          <div>
            <Spin spinning={loading}>
              <Table
                components={components}
                columns={filteredColumns}
                dataSource={data}
                pagination={{
                  current: currentPage,
                  total: totalCount,
                  pageSize: 10,
                  showSizeChanger: false,
                  showQuickJumper: true,
                  onChange: handleTableChange,
                  showTotal: (total, range) => `Toplam ${total} kayıt`,
                }}
                scroll={{ y: "100vh" }}
              />
            </Spin>
          </div>
        </Modal>
      </div>
    </>
  );
};

export default AraclarArasiYakitGiderKarsilastirmaTablosu;
