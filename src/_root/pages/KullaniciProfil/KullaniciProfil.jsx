import React, { useState, useEffect } from "react";
import { UserOutlined } from "@ant-design/icons";
import { Avatar, Typography, Popover, Spin } from "antd";
import AxiosInstance from "../../../api/http";
import { useNavigate } from "react-router-dom";
import { t } from "i18next";

const { Text, Link } = Typography;

function KullaniciProfil() {
  const [userData, setUserData] = useState(null);
  const [avatarImage, setAvatarImage] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem("id") || sessionStorage.getItem("id");
    AxiosInstance.get(`Profile/GetUserInfoById?id=${id}`)
      .then((response) => {
        setUserData(response.data);

        if (response.data.defPhotoInfo.tbResimId > 0) {
          const photoData = {
            photoId: response.data.defPhotoInfo.tbResimId,
            extension: response.data.defPhotoInfo.rsmUzanti,
            fileName: response.data.defPhotoInfo.rsmAd,
          };

          AxiosInstance.post("Photo/DownloadPhotoById", photoData, { responseType: "blob" })
            .then((imageResponse) => {
              const imageBlob = imageResponse.data;
              const imageUrl = URL.createObjectURL(imageBlob);
              setAvatarImage(imageUrl);
              setLoading(false);
            })
            .catch((error) => {
              console.error(error);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    localStorage.removeItem("id");
    sessionStorage.removeItem("id");
    navigate("/login");
  };

  const popoverContent = (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "10px" }}>
      <Text style={{ cursor: "pointer" }} onClick={() => navigate("/edit_profile", { state: { userData } })}>
        {t("profiliDuzenle")}
      </Text>
      <Text style={{ cursor: "pointer", color: "#ff4d4f" }} onClick={handleLogout}>
        {t("cikisYap")}
      </Text>
    </div>
  );

  return (
    <Popover content={popoverContent} trigger="click">
      <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "10px", cursor: "pointer" }}>
        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "5px" }}>
          <Text>{userData?.isim}</Text>
          <Text>{userData?.soyAd}</Text>
        </div>
        {loading ? <Spin /> : <Avatar size={40} src={avatarImage} icon={!avatarImage && <UserOutlined />} />}
      </div>
    </Popover>
  );
}

export default KullaniciProfil;
