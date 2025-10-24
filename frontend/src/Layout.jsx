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

function TopNavbar() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);

  return (
    <Navbar variant="dark" expand="lg" className="bg-body-tertiary">
      <Container fluid className = "custom-container">
        <Navbar.Brand as={Link} to="/" className = "main-logo">
          {/* 這裡之後有新icon再換掉 */}
          <img src={eesaLogo} className = "Lab-logo" alt="系學會icon"/>
          <div>
            NYCU-eesa        
          </div>      
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="basic-navbar-nav" />
        <Navbar.Collapse id="basic-navbar-nav">
          <Nav className="ms-auto">
            <Nav.Link className = "nav-main-page" as={Link} to="/" >首頁</Nav.Link>
            <NavDropdown  title="系學會介紹" 
                          id="basic-nav-dropdown"
                          className="nav-dropdown-intro"
                          show={show1}
                          onMouseEnter={() => setShow1(true)}
                          onMouseLeave={() => setShow1(false)}> 
              <NavDropdown.Item as={Link} to="/intro/eesa-intro">關於系學會</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/intro/member"> 成員</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/intro/academic">學術部</NavDropdown.Item>
              {/* <NavDropdown.Item as={Link} to="/intro/social">活器部</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/intro/human">人力部</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/intro/marketing">行銷部</NavDropdown.Item> */}
              {/* ...其他部門連結待補`*/}
            </NavDropdown>
            <NavDropdown  title="活動" 
                          id="basic-nav-dropdown"
                          className="nav-dropdown-event dropdown-2word"
                          show={show2}
                          onMouseEnter={() => setShow2(true)}
                          onMouseLeave={() => setShow2(false)}> 
              <NavDropdown.Item as={Link} to="/event/event-intro">活動簡介</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/event/new-info">最新資訊</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/event/timeline">時間軸</NavDropdown.Item>
            </NavDropdown>
            <Nav.Link className = "nav-team-page" as={Link} to="/team">系隊資訊</Nav.Link>
            <NavDropdown  title="學習資訊" 
                          id="basic-nav-dropdown"
                          className='nav-dropdown-resource'
                          show={show3}
                          onMouseEnter={() => setShow3(true)}
                          onMouseLeave={() => setShow3(false)}> 
              <NavDropdown.Item as={Link} to="/resource/prevexam">考古網</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/resource/project">專題資訊</NavDropdown.Item>
            </NavDropdown>
            <NavDropdown  title="系上資料" 
                          id="basic-nav-dropdown"
                          className='nav-dropdown-file'
                          show={show4}
                          onMouseEnter={() => setShow4(true)}
                          onMouseLeave={() => setShow4(false)}> 
              <NavDropdown.Item as={Link} to="/file/calendar">行事曆</NavDropdown.Item>
              <NavDropdown.Item as={Link} to="/file/course-tool">選課工具</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
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