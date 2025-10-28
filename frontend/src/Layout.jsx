import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import NavDropdown from 'react-bootstrap/NavDropdown';
import Dropdown from 'react-bootstrap/Dropdown';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useRef } from "react";
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
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  
  

  // 判斷是否使用淺色版本
  const isLightVersion = location.pathname === '/intro/eesa-intro'; // 首頁使用淺色版本，可以根據需求添加其他路徑

  const theme = isLightVersion ? 'light' : 'dark';
  
  return (
    <Navbar variant={theme} expand="lg" 
           className={`navbar-custom navbar-${theme}`}>
      <Container fluid className="custom-container">
        <div className={`nav-left nav-left-${theme}`}>
          <Navbar.Brand as={Link} to="/" className={`brand-title brand-title-${theme}`}>
            陽明交大電機專題資訊
          </Navbar.Brand>
        </div>
        <div className={`nav-right nav-right-${theme}`}>
          <Link to="/" className={`nav-icon nav-icon-${theme}`}>
            <img src={houseIcon} alt="Home" />
          </Link>
          <div className={`nav-search nav-search-${theme}`}>
            <img src={magnifierIcon} alt="Search" className={`search-icon search-icon-${theme}`} />
            <input type="text" placeholder="搜尋" className={`search-input search-input-${theme}`} />
          </div>
          <NavDropdown 
            title={<img src={menuIcon} alt="Menu" />}
            id="nav-dropdown-menu"
            className={`menu-button menu-button-${theme}`}
            show={menuOpen}
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <NavDropdown.Item as={Link} to="/" onClick={() => setMenuOpen(false)}>首頁</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/intro/eesa-intro" onClick={() => setMenuOpen(false)}>關於系學會</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/event/event-intro" onClick={() => setMenuOpen(false)}>活動簡介</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/resource/project" onClick={() => setMenuOpen(false)}>專題資訊</NavDropdown.Item>
            <NavDropdown.Item as={Link} to="/file/calendar" onClick={() => setMenuOpen(false)}>行事曆</NavDropdown.Item>
          </NavDropdown>
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
      
      // Remove /nycueelab/ prefix before storing
      const pathWithoutBase = currentPath.replace('/nycueelab', '') || '/';
      console.log("Path without base:", pathWithoutBase);
      
      dispatch(setPositionPage(pathWithoutBase));
      localStorage.setItem('lastPath', pathWithoutBase);
    }, []);

    // 刷新自動 navigate
    useEffect(() => {
      console.log(positions);
      const currentPathWithoutBase = window.location.pathname.replace('/nycueelab', '') || '/';
      
      if (positions && positions !== currentPathWithoutBase) {
        navigate(positions, { replace: true });
      }
    }, [navigate]);  


    

  return (
    <div className="layout-container">
      <TopNavbar />
      <main className="layout-main">{children}</main>
      <Footer />
    </div>
  );
}