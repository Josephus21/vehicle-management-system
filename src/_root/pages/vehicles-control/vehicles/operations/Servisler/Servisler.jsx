import React, { useEffect } from "react";
import { Button, Modal, Typography } from "antd";
import { t } from "i18next";
import Table from "./Table/Table.jsx";
import { FormProvider, useForm } from "react-hook-form";
import AxiosInstance from "../../../../../../api/http.jsx";

const { Text } = Typography;

function Servisler({ visible, onClose, ids, selectedRowsData }) {
  const formMethods = useForm();

  const footer = [
    <Button key="back" className="btn cancel-btn" onClick={onClose}>
      {t("kapat")}
    </Button>,
  ];

  return (
    <FormProvider {...formMethods}>
      <div>
        <Modal
          title={`Servis İşlemleri - Plaka: [${selectedRowsData?.map((item) => item.plaka).join(", ")}]`}
          open={visible}
          onCancel={onClose}
          maskClosable={false}
          footer={footer}
          width={1200}
        >
          <Table ids={ids} selectedRowsData={selectedRowsData} />
        </Modal>
      </div>
    </FormProvider>
  );
}

export default Servisler;
