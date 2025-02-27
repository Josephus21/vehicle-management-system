import React from "react";
import { Button, Result } from "antd";
import { t } from "i18next";

export default function NotFound() {
  const handleGoHome = () => {
    window.location.href = "/"; // Ana sayfanın URL'sini buraya yazın
  };

  return (
    <div
      style={{
        height: "calc(100vh - 210px)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Result
        status="404"
        title={t("yetkisizIslem!")}
        subTitle={t("lutfenYoneticinizIleGorusun")}
        extra={
          <Button type="primary" onClick={handleGoHome}>
            Ana Sayfaya Dön
          </Button>
        }
      />
    </div>
  );
}
