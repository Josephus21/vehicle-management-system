import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { Table, Select, Input, Button } from "antd";
import AxiosInstance from "../../../../../../../../api/http";

const { Option } = Select;

const EkspertizTable = ({ onSelectChange, selectedOptions, vehicleExpertData, getData, fetchOptionsTrigger }) => {
  const [data, setData] = useState([]);
  const [options, setOptions] = useState([]);

  const fetchOptions = async () => {
    try {
      const response = await AxiosInstance.get("AppraisalsSettings/GetAppraisalsSettings");
      const apiData = response.data;

      const newOptions = apiData.map((item) => ({
        id: item.aracEkspertizAyarId,
        value: item.aracEkspertizDurum,
      }));

      // Sadece options'u güncelle
      setData((prevData) =>
        prevData.map((item) => ({
          ...item,
          options: newOptions, // Sadece options'u güncelle, diğer alanlara dokunma
        }))
      );
    } catch (error) {
      console.error("Error fetching data: ", error);
    }
  };

  useEffect(() => {
    const formattedData = [
      {
        key: "1",
        title: "1 - Sol Ön Çamurluk",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama1 || "", // Populate with dynamic data
        selectedOption: vehicleExpertData?.parcaDurum1 || "", // Set the selected option based on dynamic data
        selectedOptionID: vehicleExpertData?.parcaAyar1 || "", // Set the selected option based on the first item in the apiData array
      },
      {
        key: "2",
        title: "2 - Sol Ön Kapı",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama2 || "",
        selectedOption: vehicleExpertData?.parcaDurum2 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar2 || "",
      },
      {
        key: "3",
        title: "3 - Sol Arka Kapı",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama3 || "",
        selectedOption: vehicleExpertData?.parcaDurum3 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar3 || "",
      },
      {
        key: "4",
        title: "4 - Sol Arka Çamurluk",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama4 || "",
        selectedOption: vehicleExpertData?.parcaDurum4 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar4 || "",
      },
      {
        key: "5",
        title: "5 - Arka Tampon",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama5 || "",
        selectedOption: vehicleExpertData?.parcaDurum5 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar5 || "",
      },
      {
        key: "6",
        title: "6 - Arka Bagaj Kapağı",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama6 || "",
        selectedOption: vehicleExpertData?.parcaDurum6 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar6 || "",
      },
      {
        key: "7",
        title: "7 - Sağ Arka Çamurluk",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama7 || "",
        selectedOption: vehicleExpertData?.parcaDurum7 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar7 || "",
      },
      {
        key: "8",
        title: "8 - Sağ Arka Kapı",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama8 || "",
        selectedOption: vehicleExpertData?.parcaDurum8 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar8 || "",
      },
      {
        key: "9",
        title: "9 - Sağ Ön Kapı",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama9 || "",
        selectedOption: vehicleExpertData?.parcaDurum9 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar9 || "",
      },
      {
        key: "10",
        title: "10 - Sağ Ön Çamurluk",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama10 || "",
        selectedOption: vehicleExpertData?.parcaDurum10 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar10 || "",
      },
      {
        key: "11",
        title: "11 - Ön Tampon",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama11 || "",
        selectedOption: vehicleExpertData?.parcaDurum11 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar11 || "",
      },
      {
        key: "12",
        title: "12 - Ön Motor Kaputu",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama12 || "",
        selectedOption: vehicleExpertData?.parcaDurum12 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar12 || "",
      },
      {
        key: "13",
        title: "13 - Tavan",
        options: options,
        aciklama: vehicleExpertData?.aracEkspertizAciklama13 || "",
        selectedOption: vehicleExpertData?.parcaDurum13 || "",
        selectedOptionID: vehicleExpertData?.parcaAyar13 || "",
      },
      // Add the "aciklama" property to all other rows similarly...
    ];

    setData(formattedData);
  }, [vehicleExpertData, options]); // vehicleExpertData veya options değiştiğinde yeniden oluşturulur

  useEffect(() => {
    fetchOptions(); // İlk başta options'u yüklemek için
  }, []);

  useEffect(() => {
    if (fetchOptionsTrigger) {
      fetchOptions();
    }
  }, [fetchOptionsTrigger]);

  useEffect(() => {
    getData(data);
  }, [data]);

  // Trigger onSelectChange for each piece when vehicleExpertData is updated
  useEffect(() => {
    if (vehicleExpertData) {
      data.forEach((item, index) => {
        const selectedValue = vehicleExpertData[`parcaDurum${index + 1}`] || "";
        if (selectedValue) {
          onSelectChange(item.title, selectedValue);
        }
      });
    }
  }, [vehicleExpertData]);

  const handleSelectChange = (title, value, id) => {
    const newData = data.map((item) => (item.title === title ? { ...item, selectedOption: value, selectedOptionID: id } : item));
    setData(newData);
    onSelectChange(title, value, id); // Eğer parent component'e id'yi de iletmek isterseniz.
  };

  const handleAciklamaChange = (key, value) => {
    const newData = data.map((item) => (item.key === key ? { ...item, aciklama: value } : item));
    setData(newData);
  };

  const columns = [
    {
      title: "Parça",
      dataIndex: "title",
      key: "title",
      render: (text) => <span>{text}</span>,
    },
    {
      title: "Durum",
      dataIndex: "options",
      key: "options",
      render: (options, record) => (
        <Select
          style={{ width: 120 }}
          value={record.selectedOption}
          onDropdownVisibleChange={(open) => {
            if (open) {
              fetchOptions(); // Fetch options again when dropdown is opened
            }
          }}
          onChange={(value, option) => handleSelectChange(record.title, value, option.key)}
        >
          {options.map((option) => (
            <Option key={option.id} value={option.value}>
              {option.value}
            </Option>
          ))}
        </Select>
      ),
    },
    {
      title: "Açıklama",
      dataIndex: "aciklama",
      key: "aciklama",
      render: (text, record) => <Input value={record.aciklama} onChange={(e) => handleAciklamaChange(record.key, e.target.value)} placeholder="Açıklama giriniz" />,
    },
  ];

  const handleLogData = () => {
    console.log(data);
  };

  return (
    <>
      {/*<Button onClick={handleLogData}>Log Table Data</Button>*/}
      <Table dataSource={data} columns={columns} pagination={false} size="small" />
    </>
  );
};

// EkspertizTable.propTypes = {
//   onSelectChange: PropTypes.func.isRequired,
//   selectedOptions: PropTypes.object.isRequired,
//   vehicleExpertData: PropTypes.array, // Expect an array of vehicle expert data
// };

export default EkspertizTable;
