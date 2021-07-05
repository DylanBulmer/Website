import React from "react";
import Head from "next/head";
import { Header } from "@/components";
import { css } from "@emotion/react";

const styles = css`
  .Blog {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;

    /* Image rendering */
    background: linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),
      url("/image/chalkboard.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;

    /* To not filter everything on the page... */
    z-index: -100;
  }
`;

export default function Servers() {
  return (
    <div className={styles.container}>
      <Head>
        <title>Blog | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Blog" />
      <div className="Blog" />
    </div>
  );
}
