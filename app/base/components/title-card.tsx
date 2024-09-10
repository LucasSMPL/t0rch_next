"use client";
import Image from "next/image";
import { useEffect } from "react";

const TitleCard = ({ refreshData }: { refreshData: () => Promise<void> }) => {
  useEffect(() => {
    const interval = setInterval(
      () => refreshData(),
      /// every 60 seconds
      60 * 1000
    );
    return () => clearInterval(interval);
  }, [refreshData]);
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        marginBottom: "5px",
      }}
    >
      <Image
        src="/t0xSM.svg"
        alt="t0 wordmark"
        width="450"
        height="150"
        className="my-16"
      />
    </div>
  );
};

export default TitleCard;
