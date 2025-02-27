import React, { useEffect } from "react";
import AxiosInstance from "../../../../../api/http";
import { Button, message, Popconfirm } from "antd";
import { DeleteOutlined, QuestionCircleOutlined } from "@ant-design/icons";
import { t } from "i18next";

export default function Sil({ selectedRows, refreshTableData, disabled, hidePopover }) {
  // Sil düğmesini gizlemek için koşullu stil
  const buttonStyle = disabled ? { display: "none" } : {};

  // Silme işlemini tetikleyecek fonksiyon
  const handleDelete = async () => {
    let isError = false;
    // Map over selectedRows to create an array of body objects
    const body = selectedRows.map((row) => row.key);
    try {
      // Silme API isteğini gönder
      const response = await AxiosInstance.post(`Employee/DeleteEmployeeById`, body);
      console.log("Silme işlemi başarılı:", response);
      if (response.data.statusCode === 200 || response.data.statusCode === 201 || response.data.statusCode === 202 || response.data.statusCode === 204) {
        message.success("İşlem Başarılı.");
      } else if (response.data.statusCode === 401) {
        message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
      } /* else if (response.data.statusCode === 409) {
        message.error("Bu aracın " + response.data.message + " kaydı var");
      }  */ else if (response.data.statusCode === 409) {
        const kayitTipleri = {
          1: t("Servis Is"),
        };
        const kayitTipi = kayitTipleri[response.data.message] || response.data.message;
        message.error(`Bu personele ait ${kayitTipi} kaydı var`);
      } else {
        message.error("İşlem Başarısız.");
      }
      // Burada başarılı silme işlemi sonrası yapılacak işlemler bulunabilir.
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
      message.error("Silme işlemi sırasında hata oluştu.");
    }
    // Tüm silme işlemleri tamamlandıktan sonra ve hata oluşmamışsa refreshTableData'i çağır
    if (!isError) {
      refreshTableData();
      hidePopover(); // Silme işlemi başarılı olursa Popover'ı kapat
    }
  };

  return (
    <div style={buttonStyle}>
      <Popconfirm
        title="Silme İşlemi"
        description="Bu öğeyi silmek istediğinize emin misiniz?"
        onConfirm={handleDelete}
        okText="Evet"
        cancelText="Hayır"
        icon={
          <QuestionCircleOutlined
            style={{
              color: "red",
            }}
          />
        }
      >
        <Button style={{ paddingLeft: "0px" }} type="link" danger icon={<DeleteOutlined />}>
          Sil
        </Button>
      </Popconfirm>
    </div>
  );
}
