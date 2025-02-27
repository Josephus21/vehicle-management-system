import React, { useEffect, useState } from "react";
import { Image, Spin, Upload, message } from "antd";
import { InboxOutlined, UserOutlined } from "@ant-design/icons";
import { useFormContext } from "react-hook-form";
import AxiosInstance from "../../../../../api/http";

const ResimUpload = ({ selectedRowID, setPhotoUploaded }) => {
  const { watch } = useFormContext();
  const [imageUrls, setImageUrls] = useState([]);
  const [loadingImages, setLoadingImages] = useState(false);
  const [refreshImages, setRefreshImages] = useState(false); // Resim listesini yenilemek için kullanılacak
  const secilenIsEmriID = watch("secilenIsEmriID");

  // Watch the 'kapali' field from the form
  const kapali = watch("kapali"); // Assuming 'kapali' is the name of the field in your form

  const fetchResimIds = async () => {
    try {
      setLoadingImages(true);

      const response = await AxiosInstance.get(`Photo/GetPhotosByRefGroup?refId=${selectedRowID}&refGroup=Arac`);
      const resimIDler = response.data; // API'den gelen verileri alıyoruz
      const urls = await Promise.all(
        resimIDler.map(async (resim) => {
          const resimResponse = await AxiosInstance.post(
            `Photo/DownloadPhotoById`,
            {
              photoId: resim.tbResimId,
              extension: resim.rsmUzanti,
              fileName: resim.rsmAd,
            },
            {
              responseType: "blob",
            }
          );
          return URL.createObjectURL(resimResponse.data); // Axios response objesinden blob data alınır
        })
      );
      setImageUrls(urls);
    } catch (error) {
      console.error("Resim ID'leri alınırken bir hata oluştu:", error);
      message.error("Resimler yüklenirken bir hata oluştu.");
    } finally {
      setLoadingImages(false);
    }
  };

  useEffect(() => {
    if (selectedRowID) {
      fetchResimIds();
    }
  }, [selectedRowID, refreshImages]); // refreshImages değişikliklerini de takip eder

  const draggerProps = {
    name: "images",
    multiple: true,
    showUploadList: false,
    beforeUpload: (file) => {
      const formData = new FormData();
      formData.append("images", file);
      AxiosInstance.post(`Photo/UploadPhoto?refId=${selectedRowID}&refGroup=ARAC`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })
        .then(() => {
          message.success(`${file.name} başarıyla yüklendi.`);
          setRefreshImages((prev) => !prev); // Başarılı yüklemeden sonra resim listesini yenile
          setPhotoUploaded((prev) => prev + 1);
        })
        .catch(() => {
          message.error(`${file.name} yükleme sırasında bir hata oluştu.`);
        });

      return false; // Yükleme işleminin varsayılan davranışını engeller
    },
    onDrop: (e) => {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <div>
      {loadingImages ? (
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <Spin />
        </div>
      ) : (
        imageUrls.map((url, index) => (
          <Image
            style={{
              margin: "10px",
              height: "150px",
              width: "150px",
              objectFit: "cover",
            }}
            key={index}
            src={url}
            fallback={<UserOutlined />}
          />
        ))
      )}
      <Upload.Dragger
        disabled={kapali} // Disable the upload component based on the value of 'kapali'
        {...draggerProps}
      >
        <p className="ant-upload-drag-icon">
          <InboxOutlined />
        </p>
        <p className="ant-upload-text">Tıklayın veya bu alana dosya sürükleyin</p>
        <p className="ant-upload-hint">
          Tek seferde bir veya birden fazla dosya yüklemeyi destekler. Şirket verileri veya diğer yasaklı dosyaların yüklenmesi kesinlikle yasaktır.
        </p>
      </Upload.Dragger>
    </div>
  );
};

export default ResimUpload;
