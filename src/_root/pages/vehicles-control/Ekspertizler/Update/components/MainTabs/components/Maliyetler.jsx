import React, { useEffect } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Modal, InputNumber, Typography, Divider } from "antd";

const { Text, Link } = Typography;
const { TextArea } = InputNumber;

function Maliyetler(props) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const iscilikUcreti = watch("iscilikUcreti") || 0;
  const malzemeUcreti = watch("malzemeUcreti") || 0;
  const digerUcreti = watch("digerUcreti") || 0;
  const kdvUcreti = watch("kdvUcreti") || 0;
  const eksiUcreti = watch("eksiUcreti") || 0;

  useEffect(() => {
    const toplamUcret = iscilikUcreti + malzemeUcreti + digerUcreti + kdvUcreti - eksiUcreti;
    setValue("toplamUcret", toplamUcret);
  }, [iscilikUcreti, malzemeUcreti, digerUcreti, kdvUcreti, eksiUcreti]);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text>İşçilik Ücreti:</Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="iscilikUcreti" control={control} render={({ field }) => <InputNumber {...field} style={{ flex: 1 }} />} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text>Mlz. Ücreti:</Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="malzemeUcreti" control={control} render={({ field }) => <InputNumber {...field} style={{ flex: 1 }} />} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text>Diğer:</Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="digerUcreti" control={control} render={({ field }) => <InputNumber {...field} style={{ flex: 1 }} />} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text>KDV:</Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="kdvUcreti" control={control} render={({ field }) => <InputNumber {...field} style={{ flex: 1 }} />} />
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text></Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="eksiUcreti" control={control} render={({ field }) => <InputNumber {...field} style={{ flex: 1 }} />} />
        </div>
      </div>
      <Divider style={{ margin: "8px 0" }} />
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "200px", maxWidth: "200px" }}>
        <Text>Toplam:</Text>
        <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", maxWidth: "100px", minWidth: "100px", gap: "10px", width: "100%" }}>
          <Controller name="toplamUcret" control={control} render={({ field }) => <InputNumber {...field} disabled style={{ flex: 1 }} />} />
        </div>
      </div>
    </div>
  );
}

export default Maliyetler;
