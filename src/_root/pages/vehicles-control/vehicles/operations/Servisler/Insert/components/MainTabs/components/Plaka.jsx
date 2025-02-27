import React, { useState, createRef, useEffect } from "react";
import { useFormContext, Controller } from "react-hook-form";
import { Select, Typography, Divider, Spin, Button, Input, message, Space } from "antd";
import AxiosInstance from "../../../../../../../../../../api/http";
import { PlusOutlined } from "@ant-design/icons";

const { Text, Link } = Typography;
const { Option } = Select;

export default function Plaka({ disabled, fieldRequirements, selectedRowsData }) {
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

  useEffect(() => {
    if (selectedRowsData && selectedRowsData.length > 0) {
      setOptions(selectedRowsData);
    }
  }, [selectedRowsData]);

  // add new status to selectbox

  // add new status to selectbox end
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px", justifyContent: "space-between" }}>
      {contextHolder}
      <div style={{ display: "flex", flexWrap: "wrap", gap: "5px", flexDirection: "column" }}>
        <Controller
          name="Plaka"
          control={control}
          rules={{ required: "Alan Boş Bırakılamaz!" }}
          render={({ field }) => (
            <Select
              {...field}
              status={errors.Plaka ? "error" : ""}
              disabled={disabled}
              key={selectKey}
              style={{ width: "300px" }}
              showSearch
              allowClear
              placeholder="Seçim Yapınız"
              optionFilterProp="children"
              filterOption={(input, option) => (option.label ? option.label.toLowerCase().includes(input.toLowerCase()) : false)}
              onDropdownVisibleChange={(open) => {}}
              options={options.map((item) => ({
                value: item.aracId, // Use the ID as the value
                label: item.plaka, // Display the name in the dropdown
              }))}
              onChange={(value) => {
                // Seçilen değerin ID'sini NedeniID alanına set et
                // `null` veya `undefined` değerlerini ele al
                setValue("Plaka", value ?? null);
                setValue("PlakaID", value ?? null);
                field.onChange(value ?? null);
              }}
              value={field.value ?? null} // Eğer `field.value` `undefined` ise, `null` kullanarak `Select` bileşenine geçir
            />
          )}
        />
        <Controller
          name="PlakaID"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text" // Set the type to "text" for name input
              style={{ display: "none" }}
            />
          )}
        />
        {errors.Plaka && <div style={{ color: "red", marginTop: "5px" }}>{errors.Plaka.message}</div>}
      </div>
    </div>
  );
}
