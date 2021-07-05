import React from "react";
import Head from "next/head";
import { Header } from "@/components";
import { css } from "@emotion/react";

const styles = css`
  .Portfolio {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;

    /* Image rendering */
    background: url("/image/man-writing.jpg");
    background-size: cover;
    background-position: center;
    background-repeat: no-repeat;
    filter: contrast(1.25) blur(2px);

    /* To not filter everything on the page... */
    z-index: -100;
  }

  .Portfolio:before {
    background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.55));
    content: "";
    width: 100%;
    height: 100vh;
    display: block;
  }
`;

export default function Servers() {
  return (
    <div css={styles}>
      <Head>
        <title>Portfolio | Bulmer Solutions</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Header title="Portfolio" />
      <div className="Portfolio" />
    </div>
  );
}
