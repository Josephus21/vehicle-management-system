import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { getItemWithExpiration } from "./utils/expireToken";
import AuthLayout from "./_auth/AuthLayout";
import RootLayout from "./_root/RootLayout";
import Dashboard from "./_root/pages/dashboard/Dashboard";
// arac yonetimi
import Vehicles from "./_root/pages/vehicles-control/vehicles/Vehicles";
import Yakit from "./_root/pages/vehicles-control/yakit/Yakit";
import Sefer from "./_root/pages/vehicles-control/sefer/Sefer";
import Sigorta from "./_root/pages/vehicles-control/sigorta/Sigorta";
import Kaza from "./_root/pages/vehicles-control/kaza/Kaza";
import Harcama from "./_root/pages/vehicles-control/harcama/Harcama";
import Ceza from "./_root/pages/vehicles-control/ceza/Ceza";
import KmUpdate from "./_root/pages/vehicles-control/hizli-km/KmUpdate";
// yakit yonetimi
import YakitTanimlar from "./_root/pages/yakit-yonetim/yakit-tanim/YakitTanimlar";
import YakitCikisFisleri from "./_root/pages/yakit-yonetim/cikis-fis/YakitCikisFisleri";
import YakitTransferler from "./_root/pages/yakit-yonetim/transferler/YakitTransferler";
import YakitGirisFisleri from "./_root/pages/yakit-yonetim/giris-fis/YakitGirisFisleri";
// malzeme depo
import Malzemeler from "./_root/pages/malzeme-depo/malzeme/Malzemeler";
import GirisFisleri from "./_root/pages/malzeme-depo/giris-fis/GirisFisleri";
import CikisFisleri from "./_root/pages/malzeme-depo/cikis-fis/CikisFisleri";
import Transferler from "./_root/pages/malzeme-depo/transferler/Transferler";
import Hareketler from "./_root/pages/malzeme-depo/hareketler/Hareketler";

import Suruculer from "./_root/pages/sistem-tanimlari/surucu/SurucuTanim";
import Settings from "./_root/pages/settings/Settings";
import MarkaList from "./_root/pages/sistem-tanimlari/marka-model/MarkaList";
import Sehirler from "./_root/pages/sistem-tanimlari/sehirler/Sehirler";
import Guzergah from "./_root/pages/sistem-tanimlari/guzergah/Guzergah";
import IsKartlari from "./_root/pages/sistem-tanimlari/is-kartlari/IsKartlari";

// Lastik Yonetimi
import LastikTanim from "./_root/pages/sistem-tanimlari/lastik-tanim/LastikTanim";
import Axle from "./_root/pages/LastikYonetimi/Axle/Axle.jsx";
import LastikIslemleri from "./_root/pages/LastikYonetimi/LastikIslemleri/LastikIslemleri";
import LastikEnvanteri from "./_root/pages/LastikYonetimi/LastikEnvanteri/LastikEnvanteri";

import CezaTanim from "./_root/pages/sistem-tanimlari/ceza-tanim/CezaTanim";
import ServisTanim from "./_root/pages/sistem-tanimlari/servis-tanim/ServisTanim";
import FirmaTanim from "./_root/pages/sistem-tanimlari/firma-tanim/FirmaTanim";
import PersonelTanim from "./_root/pages/sistem-tanimlari/personel-tanim/PersonelTanim";
import LokasyonTanimlari from "./_root/pages/sistem-tanimlari/LokasyonTanimlari/LokasyonTanimlari.jsx";
import YakitHaraketleri from "./_root/pages/yakit-yonetim/YakitHareketleri/YakitIslemleri.jsx";
import Ekspertizler from "./_root/pages/vehicles-control/Ekspertizler/Ekspertizler.jsx";

// Bakım ve Onarım
import PeriyordikBakimlar from "./_root/pages/BakimVeOnarim/PeriyodikBakimlar/PeriyodikBakimlar.jsx";

import Raporlar from "./_root/pages/raporlar/RaporYonetimi.jsx";
import KodYonetimi from "./_root/pages/kod-yonetimi/KodYonetimi";
import Hazirlaniyor from "./_root/pages/Hazirlaniyor";

import ServisIslemleri from "./_root/pages/vehicles-control/ServisIslemleri/ServisIslemleri";

// Analizler
import YakitTuketimAnalizi from "./_root/pages/Analizler/YakitTuketimAnalizi/YakitTuketimAnalizi.jsx";
import PerformansAnalizi from "./_root/pages/Analizler/PerformansAnalizi/PerformansAnalizi.jsx";
import MaliyetAnalizi from "./_root/pages/Analizler/MaliyetAnalizi/MaliyetAnalizi.jsx";

// sistem Ayarlari

import KullaniciTanimlari from "./_root/pages/SistemAyarlari/KullaniciTanimlari/KullaniciTanimlari.jsx";

// Profil Duzenleme

import ProfiliDuzenleTabs from "./_root/pages/KullaniciProfil/components/ProfiliDuzenle/ProfiliDuzenleTabs.jsx";

// Yetkısız İşlem

import YetkisizIslem from "./_root/pages/YekisizIslem";

import DenemeTable from "./_root/pages/Deneme/DenemeTable.jsx";

import CompanyKeyPage from "./_auth/CompanyKeyPage.jsx";

const App = () => {
  const [hasToken, setHasToken] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = getItemWithExpiration("token");
    const companyKey = localStorage.getItem("companyKey");

    if (!token && !companyKey) {
      navigate("/CompanyKeyPage");
    } else if (!token && companyKey) {
      setHasToken(true);
      navigate("/login");
    } else {
      setHasToken(false);
    }
  }, [navigate]);

  return (
    <Routes>
      <Route path="/" element={<RootLayout />}>
        <Route index element={<Dashboard />} />
        {/* arac yonetimi */}
        <Route path="/araclar" element={<Vehicles />} />
        <Route path="/hizli-km-guncelleme" element={<KmUpdate />} />
        <Route path="/yakit-islemleri" element={<Yakit />} />
        <Route path="/kod-yonetimi" element={<KodYonetimi />} />
        <Route path="/ceza-islemleri" element={<Ceza />} />
        <Route path="/sigorta-islemleri" element={<Sigorta />} />
        <Route path="/harcama-islemleri" element={<Harcama />} />
        <Route path="/kaza-islemleri" element={<Kaza />} />
        <Route path="/sefer-islemleri" element={<Sefer />} />
        <Route path="/servis-islemleri" element={<ServisIslemleri />} />
        <Route path="/ekspertizler" element={<Ekspertizler />} />
        {/* yakit yonetimi */}
        <Route path="/yakit-tanimlari" element={<YakitTanimlar />} />
        <Route path="/yakit-giris-fisleri" element={<YakitGirisFisleri />} />
        <Route path="/yakit-cikis-fisleri" element={<YakitCikisFisleri />} />
        <Route path="/yakit-transferler" element={<YakitTransferler />} />
        <Route path="/yakit-hareketleri" element={<YakitHaraketleri />} />
        {/* malzeme depo */}
        <Route path="/malzeme-tanimlari" element={<Malzemeler />} />
        <Route path="/giris-fisleri" element={<GirisFisleri />} />
        <Route path="/cikis-fisleri" element={<CikisFisleri />} />
        <Route path="/transferler" element={<Transferler />} />

        <Route path="/lokasyon-tanimlari" element={<LokasyonTanimlari />} />

        <Route path="/ayarlar" element={<Settings />} />
        <Route path="/hareketler" element={<Hareketler />} />
        <Route path="/arac-marka-ve-model" element={<MarkaList />} />
        <Route path="/sehir-tanimlari" element={<Sehirler />} />
        <Route path="/guzergah-tanimlari" element={<Guzergah />} />
        <Route path="/is-kartlari" element={<IsKartlari />} />

        {/* Lastik Yonetimi */}
        <Route path="/lastik-tanimlari" element={<LastikTanim />} />
        <Route path="/axle" element={<Axle />} />
        <Route path="/lastik-islemleri" element={<LastikIslemleri />} />
        <Route path="/lastik-envanteri" element={<LastikEnvanteri />} />

        <Route path="/ceza-tanimlari" element={<CezaTanim />} />
        <Route path="/servis-tanimlari" element={<ServisTanim />} />
        <Route path="/firma-tanimlari" element={<FirmaTanim />} />
        <Route path="/personel-tanimlari" element={<PersonelTanim />} />
        {/*Analızlar*/}
        <Route path="/fuel-analysis" element={<YakitTuketimAnalizi />} />
        <Route path="/performance-analysis" element={<PerformansAnalizi />} />
        <Route path="/cost-analysis" element={<MaliyetAnalizi />} />

        {/* Bakım ve Onarım */}
        <Route path="/Periodic-Maintenance" element={<PeriyordikBakimlar />} />

        <Route path="/surucu-tanimlari" element={<Suruculer />} />
        <Route path="/raporlar" element={<Raporlar />} />
        <Route path="/hazirlaniyor" element={<Hazirlaniyor />} />

        {/* Sistem Ayarlari */}
        <Route path="/user_definitions" element={<KullaniciTanimlari />} />

        {/* Profil Düzenleme */}
        <Route path="/edit_profile" element={<ProfiliDuzenleTabs />} />
        <Route path="/unauthorized" element={<YetkisizIslem />} />

        <Route path="/deneme" element={<DenemeTable />} />
      </Route>
      {hasToken && <Route path="/login" element={<AuthLayout />} />}
      <Route path="/CompanyKeyPage" element={<CompanyKeyPage />} />
    </Routes>
  );
};

export default App;
