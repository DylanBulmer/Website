import React from "react";
import { Layout, Menu, Icon } from 'antd';
const { Header, Sider, Content } = Layout;

import "antd/dist/antd.css";
import "../../public/css/ant.css";

class SiderDemo extends React.Component {
  state = {
    collapsed: false,
  };

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  render() {
    return (
      <Layout className="content">
        <Sider trigger={null} collapsible collapsed={this.state.collapsed}>
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Icon type="home" />
              <span>Home</span>
            </Menu.Item>
            <Menu.Item key="2">
              <Icon type="shop" />
              <span>Store</span>
            </Menu.Item>
            <Menu.Item key="3">
              <Icon type="layout" />
              <span>Blog</span>
            </Menu.Item>
            <Menu.Item key="4">
              <Icon type="play-circle" />
              <span>Gaming</span>
            </Menu.Item>
            <Menu.Item key="5">
              <Icon type="login" />
              <span>Login</span>
            </Menu.Item>
          </Menu>
        </Sider>
        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content
            style={{
              margin: '24px 16px',
              padding: 24,
              background: '#fff',
              minHeight: 280,
            }}
          >
            Content
          </Content>
        </Layout>
      </Layout>
    );
  }
}

export default SiderDemo;