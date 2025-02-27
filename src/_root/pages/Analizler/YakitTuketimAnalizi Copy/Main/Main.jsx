import React, { useState, useEffect } from "react";
import { useForm, FormProvider, useFormContext } from "react-hook-form";
import ShortInfo from "../components/Component1.jsx";
import Filters from "./../Filters/Filters.jsx";
import LokasyonBazindaYakitTuketimleri from "./components/LokasyonBazindaYakitTuketimleri.jsx";
import YillikYakitTuketimleri from "../components/YillikYakitTuketimleri.jsx";
import AylikYakitTuketimleri from "../components/AylikYakitTuketimleri.jsx";
import BolgelereGoreToplamMiktarDagilimi from "../components/BolgelereGoreToplamMiktarDagilimi.jsx";
import AraclarArasiYakitGiderKarsilastirmaTablosu from "./components/AraclarArasiYakitGiderKarsilastirmaTablosu.jsx";
import YakitVerimliligi from "./components/YakitVerimliligi.jsx";

function Main(props) {
  const {
    control,
    watch,
    setValue,
    getValues,
    formState: { errors },
  } = useFormContext();
  const [isWideScreen, setIsWideScreen] = useState(window.innerWidth > 850);
  const [isScrolled, setIsScrolled] = useState(false);

  // handleScroll fonksiyonunu useEffect dışında tanımlıyoruz
  const handleScroll = (e) => {
    // console.log("Scroll Y:", e.target.scrollTop);
    setIsScrolled(e.target.scrollTop > 50);
  };

  useEffect(() => {
    const handleResize = () => {
      setIsWideScreen(window.innerWidth > 850);
    };

    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div
      style={{ display: "flex", flexDirection: "column", gap: "10px", overflow: "auto", height: "calc(100vh - 120px)" }}
      onScroll={handleScroll} // handleScroll burada tanımlanmalı
    >
      <div
        style={{
          // position: "sticky",
          // top: 7,
          // zIndex: 4,
          margin: "7px 7px 0px 7px",
          padding: "7px",
          backgroundColor: "white",
          border: "1px solid rgb(240, 240, 240)",
          borderRadius: "5px",
          filter: "drop-shadow(0 0 0.75rem rgba(0, 0, 0, 0.1))",
          /*filter: isScrolled ? "drop-shadow(0px 0px 5px rgba(0, 0, 0, 0.2))" : "none",*/
          /*transition: "filter 0.3s ease",*/ // Animasyonlu geçiş için
        }}
      >
        <Filters />
      </div>
      <ShortInfo />
      <div style={{ display: "flex", gap: "10px" }}>
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <YillikYakitTuketimleri />
        </div>
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <AylikYakitTuketimleri />
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: isWideScreen ? "row" : "column",
        }}
      >
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <BolgelereGoreToplamMiktarDagilimi />
        </div>
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <LokasyonBazindaYakitTuketimleri />
        </div>
      </div>
      <div
        style={{
          display: "flex",
          gap: "10px",
          flexDirection: isWideScreen ? "row" : "column",
        }}
      >
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <AraclarArasiYakitGiderKarsilastirmaTablosu />
        </div>
        <div style={{ flex: "1 1 49.6%", maxWidth: "49.6%" }}>
          <YakitVerimliligi />
        </div>
      </div>
    </div>
  );
}

export default Main;
