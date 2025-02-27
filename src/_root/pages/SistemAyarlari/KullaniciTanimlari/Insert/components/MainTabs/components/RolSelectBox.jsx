import React, { useState } from "react";
import { Select } from "antd";
import { Controller, useFormContext } from "react-hook-form";
import { t } from "i18next";

function RolSelectBox() {
  const { control } = useFormContext();
  const [options, setOptions] = useState([
    { value: "1", label: "Yönetici" },
    { value: "2", label: "Süpervizor" },
    { value: "3", label: "Depo Yöneticisi" },
    // Add more options as needed
  ]);

  return (
    <>
      <Controller
        name="rolSelect"
        control={control}
        defaultValue={[]}
        render={({ field }) => <Select {...field} mode="multiple" allowClear style={{ width: "100%" }} placeholder={t("secimYapin")} options={options} />}
      />
    </>
  );
}

export default RolSelectBox;
