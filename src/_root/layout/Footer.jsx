import { Layout } from "antd";
import dayjs from "dayjs";

const { Footer } = Layout;

const FooterComp = () => {
  const currentYear = dayjs().year();

  return (
    <Footer className="footer">
      <small>© 1998 - {currentYear} Orjin Yazılım</small>
    </Footer>
  );
};

export default FooterComp;
