import React, { useEffect, useState } from "react";
import { t } from "i18next";
import KmLog from "../../../../../components/table/KmLog.jsx";
import { Button, Modal } from "antd";
import { GetVehicleByIdService } from "../../../../../../api/services/vehicles/vehicles/services.jsx";
import dayjs from "dayjs";
import { GetDocumentsByRefGroupService, GetPhotosByRefGroupService } from "../../../../../../api/services/upload/services.jsx";

function KmTakibi({ visible, onClose, ids, selectedRowsData }) {
  const [dataSource, setDataSource] = useState([]);
  const [kmHistryModal, setKmHistryModal] = useState(false);
  const [dataStatus, setDataStatus] = useState(false);

  useEffect(() => {
    GetVehicleByIdService(ids).then((res) => {
      setDataSource(res.data);
    });
  }, [ids, status, dataStatus]);

  const footer = [
    <Button key="back" className="btn cancel-btn" onClick={onClose}>
      {t("kapat")}
    </Button>,
  ];

  return (
    <div>
      <Modal title={`${t("kilometreTakibi")}: ${dataSource?.plaka}`} open={visible} onCancel={onClose} maskClosable={false} footer={footer} width={1200}>
        <KmLog data={dataSource} setDataStatus={setDataStatus} />
      </Modal>
    </div>
  );
}

export default KmTakibi;
