import React from "react";
import Head from "next/head";
import { Header } from "@/components";
import { css } from "@emotion/react";

const styles = css`
  .Servers {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;

    /* Image rendering */
    background: url("/image/datacenter.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: saturate(200%) brightness(40%) blur(2px);

    /* To not filter everything on the page... */
    z-index: -100;
  }
`;

export default function Servers() {
  return (
    <div css={styles}>
      <Head>
        <title>Servers | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Servers" />
      <div className="Servers" />
    </div>
  );
}
