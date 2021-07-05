import React from "react";
import { Header } from "@/components";

export default function Layout({children}) {
  return (
    <div>
      <Header />
      <div>
        {children}
      </div>
    </div>
  );
}
