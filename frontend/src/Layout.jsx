import React from 'react';
import { Link } from "react-router-dom";
import { Container } from "react-bootstrap";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { setPositionPage } from "./redux/commonSlice.js";
import "./Layout.css";

import eesaLogo from "@/assets/icon.jpg";
import houseIcon from "@/assets/house.svg";
import magnifierIcon from "@/assets/megnifier.svg";
import menuIcon from "@/assets/menu.svg";

function TopNavbar() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);

  return (
    <Navbar variant="dark" expand="lg" className="bg-body-tertiary">
      <Container fluid className="custom-container">
        <div className="nav-left">
          <Navbar.Brand as={Link} to="/" className="brand-title">
            陽明交大電機專題資訊
          </Navbar.Brand>
        </div>
        <div className="nav-right">
          <Link to="/" className="nav-icon">
            <img src={houseIcon} alt="Home" />
          </Link>
          <div className="nav-search">
            <img src={magnifierIcon} alt="Search" className="search-icon" />
            <input type="text" placeholder="搜尋" className="search-input" />
          </div>
          <button className="menu-button">
            <img src={menuIcon} alt="Menu" />
          </button>
        </div>
      </Container>
    </Navbar>
  );
};

function Footer() {

    return(
        <footer className="navbar-footer">
            <div className="contactRow">
            <span className="contactItem">| TEL | +886-3-xyz-xxxx</span>
            <span className="contactItem">| Email | AiSMARTLab@gmail.com</span>
            <span className="contactItem">| Address | 新竹市東區大學路1001號工程五館222室</span>
            </div>
            <hr className="contactHr" />
            <div className="contactCopyRight">
            Copyright © Autonomous intelligent Sensory Microsystems with Analog Reconfigurable Technologies Laboratory
            </div>
        </footer>      
    )
}

export default function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const positions = useSelector((state) => state.positionPage);

    // 頁面一載入就紀錄位置
    useEffect(() => {
      const currentPath = window.location.pathname;
      console.log("Current path:", currentPath);
      dispatch(setPositionPage(currentPath));
      // 存 localStorage
      localStorage.setItem('lastPath', currentPath);
    }, []);

    // 刷新自動 navigate
    useEffect(() => {
      console.log(positions);
    if (positions !== window.location.pathname) {
      navigate(positions, { replace: true });
    }
    }, [navigate]);  

  return (
    <div>
      <TopNavbar />
      <main>{children}</main>
      <Footer />
    </div>
  );
}