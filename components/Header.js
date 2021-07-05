import { css } from "@emotion/react";
import Link from "next/link";
import { Logo } from ".";

const styles = css`
  width: calc(100% - 16px);
  position: relative;
  background-color: rgba(0, 0, 0, 0.25);
  padding: 8px 8px;
  height: 36px;
  box-shadow: 4px 4px 4px rgba(0,0,0,0.1);

  .title {
    font-size: 24px;
  }

  .nav {
    float: right;
    display: inline;
    font-size: 24px;
  }

  .nav a {
    text-decoration: none;
    color: white;
    line-height: 36px;
    font-weight: normal;
  }

  .nav a:hover {
    color: orange;
    font-weight: normal;
  }
`;

function Header() {
  return (
    <div css={styles}>
      <Logo.Full />
      <div className="nav">
        <Link href="/">
          <a>Home</a>
        </Link>
        <span> / </span>
        <Link href="/portfolio">
          <a>Portfolio</a>
        </Link>
        <span> / </span>
        <Link href="/blog">
          <a>Blog</a>
        </Link>
        <span> / </span>
        <Link href="/servers">
          <a>Servers</a>
        </Link>
      </div>
      {/* <div className="title">{props.title}</div> */}
    </div>
  );
}

export default Header;
