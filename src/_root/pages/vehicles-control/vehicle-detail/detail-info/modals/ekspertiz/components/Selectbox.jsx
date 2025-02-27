import React, { useState, createRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Select, Typography, Divider, Spin, Button, Input, message, Space } from "antd";
import AxiosInstance from "../../../../../../../../api/http";
import { PlusOutlined } from "@ant-design/icons";

const { Text, Link } = Typography;
const { Option } = Select;

export default function Selectbox({ disabled, fieldRequirements }) {
  const {
    control,
    setValue,
    watch,
    formState: { errors },
  } = useFormContext();
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = createRef();
  const [name, setName] = useState("");
  const [selectKey, setSelectKey] = useState(0);

  // message
  const [messageApi, contextHolder] = message.useMessage();

  // message end

  // const prosedurTab = watch("prosedurTab");

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await AxiosInstance.get(`AppraisalsSettings/GetAppraisalsSettings`);
      if (response && response.data) {
        setOptions(response.data);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const onNameChange = (e) => {
    setName(e.target.value);
  };

  // add new status to selectbox

  // const addItem = () => {
  //   if (name.trim() !== "") {
  //     if (options.some((option) => option.aracEkspertizDurum === name)) {
  //       messageApi.open({
  //         type: "warning",
  //         content: "Bu durum zaten var!",
  //       });
  //       return;
  //     }
  //
  //     setLoading(true);
  //     AxiosInstance.post(`AddIsNeden?entity=${name}&isTanimId=${prosedurTab}`)
  //       .then((response) => {
  //         if (response.status_code === 201) {
  //           // Assuming 'id' is directly in the response
  //           const newId = response.id; // Adjust this line based on your actual response structure
  //
  //           messageApi.open({
  //             type: "success",
  //             content: "Ekleme Başarılı",
  //           });
  //           setOptions((prevOptions) => [...prevOptions, { aracEkspertizAyarId: newId, aracEkspertizDurum: name }]);
  //           setSelectKey((prevKey) => prevKey + 1);
  //           setName("");
  //         } else {
  //           // Error handling
  //           messageApi.open({
  //             type: "error",
  //             content: "An error occurred", // Adjust the error message as needed
  //           });
  //         }
  //       })
  //       .catch((error) => {
  //         // Handle Axios errors
  //         console.error("Error adding item to API:", error);
  //         messageApi.open({
  //           type: "error",
  //           content: "An error occurred while adding the item.",
  //         });
  //       })
  //       .finally(() => {
  //         setLoading(false);
  //       });
  //   }
  // };

  // add new status to selectbox end
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
      {contextHolder}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flexDirection: "column" }}>
        <Controller
          name="durum"
          control={control}
          // rules={{ required: fieldRequirements.durum ? "Alan Boş Bırakılamaz!" : false }}
          render={({ field }) => (
            <Select
              {...field}
              // status={errors.durum ? "error" : ""}
              disabled={disabled}
              key={selectKey}
              style={{ width: "300px" }}
              showSearch
              allowClear
              placeholder="Seçim Yapınız"
              optionFilterProp="children"
              filterOption={(input, option) => (option.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false)}
              onDropdownVisibleChange={(open) => {
                if (open) {
                  fetchData(); // Fetch data when the dropdown is opened
                }
              }}
              // dropdownRender={(menu) => (
              //   <Spin spinning={loading}>
              //     {menu}
              //     <Divider
              //       style={{
              //         margin: "8px 0",
              //       }}
              //     />
              //     <Space
              //       style={{
              //         padding: "0 8px 4px",
              //       }}
              //     >
              //       <Input placeholder="" ref={inputRef} value={name} onChange={onNameChange} />
              //       <Button type="text" icon={<PlusOutlined />} onClick={addItem}>
              //         Ekle
              //       </Button>
              //     </Space>
              //   </Spin>
              // )}
              options={options.map((item) => ({
                value: item.aracEkspertizAyarId, // Use the ID as the value
                label: item.aracEkspertizDurum, // Display the name in the dropdown
              }))}
              onChange={(value) => {
                // Seçilen değerin ID'sini NedeniID alanına set et
                // `null` veya `undefined` değerlerini ele al
                setValue("durum", value ?? null);
                setValue("durumID", value ?? null);
                field.onChange(value ?? null);
              }}
              value={field.value ?? null} // Eğer `field.value` `undefined` ise, `null` kullanarak `Select` bileşenine geçir
            />
          )}
        />
        <Controller
          name="durumID"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text" // Set the type to "text" for name input
              style={{ display: "none" }}
            />
          )}
        />
        {/*{errors.durum && <div style={{ color: "red", marginTop: "5px" }}>{errors.durum.message}</div>}*/}
      </div>
    </div>
  );
}
