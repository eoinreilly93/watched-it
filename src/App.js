import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Layout } from "antd";
import Search from "./components/Search/Search";

function App() {
  return (
    <Layout className="layout">
      <Layout.Content>
        <Search />
      </Layout.Content>
    </Layout>
  );
}

export default App;
