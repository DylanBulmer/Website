import React from "react";
import Head from "next/head";
import { css } from "@emotion/react";

const styles = css`
  .Blog {
    position: absolute;
    width: 100%;
    height: 100vh;
    left: 0px;
    top: 0px;

    /* Image rendering */
    background: linear-gradient(rgba(0, 0, 0, 0.25), rgba(0, 0, 0, 0.25)),
      url("/image/paper-plant.jpg");
    background-size: cover;
    background-position: top;
    background-repeat: no-repeat;
    filter: blur(1px);

    /* To not filter everything on the page... */
    z-index: -100;
  }
`;

export default function Servers() {
  return (
    <div css={styles}>
      <Head>
        <title>Blog | Bulmer Solutions</title>
      </Head>
      <div className="Blog" />
    </div>
  );
}
