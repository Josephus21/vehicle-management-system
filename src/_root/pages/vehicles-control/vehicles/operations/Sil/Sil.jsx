import React, { useState, useEffect } from "react";
import { Popconfirm, message } from "antd";
import { QuestionCircleOutlined } from "@ant-design/icons";
import AxiosInstance from "../../../../../../api/http";
import PropTypes from "prop-types";

const Sil = ({ ids, onDeleteSuccess, onCancel }) => {
  const [visible, setVisible] = useState(true); // Show Popconfirm when component mounts

  // Reset the visible state when the component is mounted
  useEffect(() => {
    setVisible(true);
  }, []);

  const handleDelete = async () => {
    const body = ids; // IDs to delete
    try {
      const response = await AxiosInstance.post(`Vehicle/DeleteVehicleItemById`, body);
      if ([200, 201, 202, 204].includes(response.data.statusCode)) {
        message.success("İşlem Başarılı.");
        setVisible(false); // Close the Popconfirm on success
        if (onDeleteSuccess) {
          onDeleteSuccess();
        }
      } else if (response.data.statusCode === 401) {
        message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
        // Do not close Popconfirm so user can try again
      } else if (response.data.statusCode === 409) {
        message.error("Bu aracın " + response.data.message + " kaydı var");
      } else {
        message.error("İşlem Başarısız.");
        // Do not close Popconfirm so user can try again
      }
    } catch (error) {
      console.error("Silme işlemi sırasında hata oluştu:", error);
      message.error("Silme işlemi sırasında hata oluştu.");
      // Do not close Popconfirm so user can try again
    }
  };

  const handleCancel = () => {
    setVisible(false); // Close the Popconfirm on cancel
    if (onCancel) {
      onCancel();
    }
  };

  return (
    <Popconfirm
      title="Silme İşlemi"
      description="Bu öğeyi silmek istediğinize emin misiniz?"
      onConfirm={handleDelete}
      onCancel={handleCancel}
      okText="Evet"
      cancelText="Hayır"
      open={visible}
      icon={<QuestionCircleOutlined style={{ color: "red" }} />}
    >
      {/* Popconfirm needs a trigger element; using a span as a placeholder */}
      <span />
    </Popconfirm>
  );
};

Sil.propTypes = {
  ids: PropTypes.array.isRequired,
  onDeleteSuccess: PropTypes.func,
  onCancel: PropTypes.func,
};

export default Sil;
