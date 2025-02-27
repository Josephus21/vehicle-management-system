import { useState } from "react";
import "@ant-design/v5-patch-for-react-19";
import { Link, useNavigate } from "react-router-dom";
import { t } from "i18next";
import { Button, Input, message, Spin, Form, Typography, Checkbox } from "antd";
import { EyeInvisibleOutlined, EyeTwoTone } from "@ant-design/icons";
import { LoginUserService } from "../api/service";
import { setItemWithExpiration } from "../utils/expireToken";
import SuccessAlert from "../components/alerts/SuccessAlert";
import ErrorAlert from "../components/alerts/ErrorAlert";
import LanguageSelectbox from "../_root/components/lang/LanguageSelectbox.jsx";
import { useForm } from "antd/lib/form/Form";
import { MdVpnKey } from "react-icons/md";
import styled from "styled-components";

const { Text } = Typography;

const ImageContainer = styled.div`
  background: linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5)), url("/images/ats_login_image.webp");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 100vh;
  display: flex;
  justify-content: flex-end;
  width: 100%;

  @media (max-width: 600px) {
    display: none;
  }
`;

const FormContainer = styled.div`
  background-color: white;
  width: 100%;
  max-width: 800px;
  height: 100vh;
  display: flex;
  padding: 20px 0 20px 0;
  justify-content: space-between;
  align-items: center;
  flex-direction: column;

  @media (max-width: 600px) {
    max-width: 100%;
  }
  @media (min-width: 600px) {
    min-width: 600px;
  }
`;

const AuthLayout = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [form] = useForm();

  const navigate = useNavigate();

  const onFinish = (values) => {
    console.log("Success:", values);
    onSubmit(values);
  };
  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
  };

  const handleChangeCompanyKey = () => {
    localStorage.removeItem("companyKey");
    navigate("/CompanyKeyPage");
  };

  const companyKey = localStorage.getItem("companyKey");

  const onSubmit = async (data) => {
    setIsLoading(true);
    const body = {
      KULLANICIKOD: data.username,
      SIFRE: data.password,
      firmaSifre: companyKey,
    };

    try {
      const response = await LoginUserService(body);
      if (response?.data.accessToken) {
        setIsSuccess(true);
        setItemWithExpiration("token", response?.data.accessToken, 24, response?.data.siraNo, data.remember);
        navigate("/");
      }
      if (response?.data.siraNo === 0) {
        message.error("Kullanıcı adı veya şifre hatalıdır.");
      }
    } catch (error) {
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      style={{
        /* background: `linear-gradient(rgba(255, 255, 255, 0.7), rgba(255, 255, 255, 0.5)), url('/images/ats_login_image.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat", */
        minHeight: "100vh",
        display: "flex",
        justifyContent: "flex-end",
        width: "100%",
      }}
    >
      <ImageContainer></ImageContainer>
      <FormContainer>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "34px", width: "150px" }}></div>
        <div style={{ width: "400px" }}>
          <div style={{ marginBottom: "70px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <img src="/images/ats_pro_logo.png" alt="ats logo" className="login-logo-img self-center" />
              <LanguageSelectbox />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "20px" }}>
            <Text style={{ fontSize: "23px", fontWeight: 600 }}>{t("Giris")} !</Text>
            <Text>{t("hosGeldinizKullaniciKoduVeSifreniziGiriniz")}</Text>
          </div>
          <Form
            form={form}
            name="basic"
            labelCol={{
              span: 8,
            }}
            wrapperCol={{
              span: 24,
            }}
            style={{
              maxWidth: 600,
            }}
            initialValues={{
              remember: true,
            }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            autoComplete="off"
          >
            <Form.Item
              label=""
              name="username"
              rules={[
                {
                  required: true,
                  message: t("lutfenKullaniciKodunuzuGiriniz"),
                },
              ]}
            >
              <Input
                placeholder={t("KullaniciKodu")}
                style={{
                  height: "40px",
                  borderTop: "0px solid #ffffff00",
                  borderRight: "0px solid #ffffff00",
                  borderBottom: "0px solid #ffffff00",
                  backgroundColor: "#F4F2F2",
                  borderLeft: "4px solid #3C6ABC",
                  borderRadius: "0px",
                }}
              />
            </Form.Item>

            <Form.Item
              label=""
              name="password"
              rules={[
                {
                  required: true,
                  message: t("lutfenSifreniziGiriniz"),
                },
              ]}
            >
              <Input.Password
                placeholder={t("sifre")}
                style={{
                  height: "40px",
                  borderTop: "0px solid #ffffff00",
                  borderRight: "0px solid #ffffff00",
                  borderBottom: "0px solid #ffffff00",
                  backgroundColor: "#F4F2F2",
                  borderLeft: "4px solid #3C6ABC",
                  borderRadius: "0px",
                }}
              />
            </Form.Item>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
              <Form.Item name="remember" valuePropName="checked" label={null} wrapperCol={{ offset: 0 }} style={{ marginBottom: "0px" }}>
                <Checkbox>{t("beniHatirla")}</Checkbox>
              </Form.Item>
              <Button style={{ marginTop: "0px", borderRadius: "10px", height: "35px", borderColor: "#F7941E", color: "#F7941E" }} onClick={handleChangeCompanyKey}>
                <MdVpnKey style={{ fontSize: "17px" }} />
              </Button>
            </div>

            <Form.Item label={null} wrapperCol={{ offset: 0 }}>
              <Button loading={isLoading} style={{ width: "100%", borderRadius: "20px", backgroundColor: "#3C6ABC", color: "white", height: "40px" }} type="" htmlType="submit">
                {t("login")}
              </Button>
            </Form.Item>
          </Form>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "34px" }}>
          {/* <img src="/images/orjinLogo.png" alt="ats logo" style={{ width: "150px" }} /> */}
        </div>
      </FormContainer>
    </div>
  );
};

export default AuthLayout;

// password pattern --> pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/
// username pattern --> pattern: /^[a-zA-Z0-9_]+$/
