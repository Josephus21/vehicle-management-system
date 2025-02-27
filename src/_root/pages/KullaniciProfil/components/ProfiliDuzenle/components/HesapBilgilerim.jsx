import React, { useEffect, useState } from "react";
import { Avatar, Spin, Typography, Image, Button, Modal, message } from "antd";
import { Controller, useFormContext } from "react-hook-form";
import { UserOutlined, EditOutlined, PictureOutlined } from "@ant-design/icons";
import AxiosInstance from "../../../../../../api/http.jsx";
/* import HesapBilgileriDuzenle from "../../HesapBilgileriDuzenle.jsx"; */
/* import ResimUpload from "./Resim/ResimUpload.jsx"; // AppContext'i import edin */
import { TiDelete } from "react-icons/ti";
const { Text } = Typography;

function HesapBilgilerim({ userData }) {
  const {
    control,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const [imageUrl, setImageUrl] = useState(null); // Resim URL'sini saklamak için state tanımlayın
  const [loadingImage, setLoadingImage] = useState(false); // Yükleme durumu için yeni bir state
  const [isModalVisible, setIsModalVisible] = useState(false); // Modal'ın görünürlüğünü kontrol etmek için state
  const [isModalVisible1, setIsModalVisible1] = useState(false); // Modal'ın görünürlüğünü kontrol etmek için state

  const userName = watch("userName");

  const Body = {
    PRS_ISIM: userData?.PRS_ISIM,
    KLL_KOD: userData?.KLL_KOD,
    KLL_TANIM: userData?.KLL_TANIM,
    PRS_EMAIL: userData?.PRS_EMAIL,
    PRS_TELEFON: userData?.PRS_TELEFON,
    PRS_DAHILI: userData?.PRS_DAHILI,
    PRS_ADRES: userData?.PRS_ADRES,
    PRS_ACIKLAMA: userData?.PRS_ACIKLAMA,
    KLL_AKTIF: userData?.KLL_AKTIF,
    PRS_UNVAN: userData?.PRS_UNVAN,
    PRS_GSM: userData?.PRS_GSM,
    PRS_RESIM_ID: "",
    KLL_PERSONEL_ID: userData?.KLL_PERSONEL_ID,
    KLL_NEW_USER: userData?.KLL_NEW_USER,
    KLL_DEGISTIRME_TARIH: userData?.KLL_DEGISTIRME_TARIH,
  };

  const deletePicture = () => {
    if (userData?.PRS_RESIM_ID) {
      AxiosInstance.post(`UpdateKullaniciProfile`, Body)
        .then((response) => {
          console.log("Data sent successfully:", response);
          if (response.status_code === 200 || response.status_code === 201) {
            message.success("Güncelleme Başarılı.");
            /* setIsButtonClicked((prev) => !prev); // Başarılı yüklemeden sonra resim listesini yenile */
            setImageUrl(null);
          } else if (response.data.statusCode === 401) {
            message.error("Bu işlemi yapmaya yetkiniz bulunmamaktadır.");
          } else {
            message.error("Güncelleme Başarısız Oldu.");
          }
        })
        .catch((error) => {
          // Handle errors here, e.g.:
          console.error("Error sending data:", error);
          message.error("Başarısız Olundu.");
        });
      console.log({ Body });
    }
  };

  // const deletePicture1 = async () => {
  //   if (userData?.PRS_RESIM_ID) {
  //     try {
  //       const response = await AxiosInstance.get(
  //         `ResimSil?resimID=${userData?.PRS_RESIM_ID}`
  //       );
  //       setIsButtonClicked((prev) => !prev); // Başarılı yüklemeden sonra resim listesini yenile
  //       setImageUrl(null);
  //     } catch (error) {
  //       console.error("Error fetching user data:", error);
  //     }
  //   }
  // };

  useEffect(() => {
    // userData.userResimID değeri gelene kadar bekler
    if (userData?.PRS_RESIM_ID !== undefined) {
      const fetchImage = async () => {
        try {
          setLoadingImage(true); // Resim yüklenmeye başladığında loadingImage'i true yap
          // responseType olarak 'blob' seçilir.
          const response = await AxiosInstance.get(`ResimGetirById?id=${userData?.PRS_RESIM_ID}`, {
            responseType: "blob",
          });
          // Yanıttaki blob verisi bir URL'ye dönüştürülür.
          const imageBlob = response;
          const imageObjectURL = URL.createObjectURL(imageBlob);
          setImageUrl(imageObjectURL);
        } catch (error) {
          console.error("Error fetching image:", error);
        } finally {
          setLoadingImage(false); // Resim yüklendikten sonra veya hata durumunda loadingImage'i false yap
        }
      };

      fetchImage();

      // Component unmount olduğunda veya resim değiştiğinde oluşturulan URL iptal edilir.
      return () => {
        if (imageUrl) {
          URL.revokeObjectURL(imageUrl);
        }
      };
    }
  }, [userData?.PRS_RESIM_ID]); // Dependency array'e imageUrl eklenir.

  // useEffect(() => {
  //   setValue("userName", "Kullanıcı Adı");
  // }, []);
  //
  // useEffect(() => {
  //   console.log(userName);
  // }, [userName]);

  const showModal = () => {
    setIsModalVisible(true); // Modal'ı göster
  };

  const uploadPhoto = () => {
    setIsModalVisible1(true); // Modal'ı göster
  };

  return (
    <div
      style={{
        padding: "0 20px",
        display: "flex",
        gap: "10px",
        flexDirection: "column",
      }}
    >
      <Text style={{ fontWeight: "500", fontSize: "16px" }}>Hesap Bilgilerim</Text>
      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #e1e1e1",
          padding: "10px",
        }}
      >
        <div style={{ display: "flex", gap: "10px" }}>
          <div style={{ position: "relative", width: "84px", height: "84px" }}>
            {imageUrl ? (
              <Image.PreviewGroup>
                <Image
                  width={84}
                  height={84}
                  src={imageUrl}
                  placeholder={loadingImage ? <Spin /> : <UserOutlined />}
                  style={{ borderRadius: "50%", minWidth: "84px" }} // Resmi yuvarlak yap
                />
              </Image.PreviewGroup>
            ) : (
              <Avatar
                style={{ minHeight: "84px", minWidth: "84px" }}
                size={84}
                icon={!loadingImage && <UserOutlined />} // Yükleme olmadığı ve imageUrl yoksa ikonu göster
              >
                {loadingImage && <Spin />}
                {/* Resim yüklenirken Spin göster */}
              </Avatar>
            )}
            <Button
              style={{
                position: "absolute",
                bottom: "0px",
                right: "0px",
                minHeight: "32px",
                maxHeight: "32px",
                width: "32px",
              }}
              size={"medium"}
              shape="circle"
              icon={<PictureOutlined />}
              onClick={uploadPhoto}
            />

            <TiDelete
              style={{
                fontSize: "35px",
                position: "absolute",
                top: "-8px",
                right: "-8px",
                cursor: "pointer",
                color: "red",
                dropShadow: "2px 2px 5px rgba(0,0,0,0.9)",
              }}
              onClick={deletePicture}
            />
          </div>

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column" }}>
              <Text style={{ fontWeight: "500", fontSize: "15px" }}>
                {userData?.isim || "Bilinmiyor"} {userData?.soyAd || ""}
              </Text>
              <Text type="secondary">{userData?.PRS_UNVAN || ""}</Text>
              <Text type="secondary">{userData?.PRS_ADRES || ""}</Text>
            </div>
            <Button style={{ maxHeight: "32px", minHeight: "32px", minWidth: "32px", maxWidth: "32px" }} shape="circle" icon={<EditOutlined />} onClick={showModal} />
          </div>
        </div>
      </div>

      <div
        style={{
          borderRadius: "16px",
          border: "1px solid #e1e1e1",
          padding: "20px",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div
          style={{
            display: "flex",
            gap: "10px",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontWeight: "500",
              fontSize: "16px",
              marginBottom: "10px",
            }}
          >
            Kişisel Bilgilerim
          </Text>
          <Button style={{ maxHeight: "32px", minHeight: "32px", minWidth: "32px", maxWidth: "32px" }} shape="circle" icon={<EditOutlined />} onClick={showModal} />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gridGap: "10px",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">İsim</Text>
            <Text>{userData?.isim || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Soyisim</Text>
            <Text>{userData?.soyAd || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Kullanici Kodu</Text>
            <Text>{userData?.kullaniciKod || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">E-posta</Text>
            <Text>{userData?.email || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Telefon</Text>
            <Text>{userData?.telefon || "Bilinmiyor"}</Text>
          </div>
          {/*  <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Dahili</Text>
            <Text>{userData?.PRS_DAHILI || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Adres</Text>
            <Text>{userData?.PRS_ADRES || "Bilinmiyor"}</Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <Text type="secondary">Açıklama</Text>
            <Text>{userData?.PRS_ACIKLAMA || "Bilinmiyor"}</Text>
          </div> */}
        </div>
      </div>
      {/*  <HesapBilgileriDuzenle
        accountEditModalOpen={isModalVisible}
        accountEditModalClose={() => {
          setIsModalVisible(false);
        }}
      /> */}

      <Modal title="Resim Yükle" centered open={isModalVisible1} onOk={() => setIsModalVisible1(false)} onCancel={() => setIsModalVisible1(false)} width={800}>
        {/* <ResimUpload /> */}
      </Modal>
    </div>
  );
}

export default HesapBilgilerim;
