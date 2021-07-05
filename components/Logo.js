import React from "react";
import { css } from "@emotion/react";

const styles = css`
  background-image: url("/image/BS-Logo_Full.svg");
  height: 36px;
  width: 270.82px;
  display: inline-block;
`;

class LogoFull extends React.Component {
  render() {
    return <div css={styles} />;
  }
}

const Logo = {
  Full: LogoFull,
};

export default Logo;
