import React from 'react';
import { Link, useLocation } from "react-router-dom";
import { Container } from "react-bootstrap";
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';

import 'bootstrap/dist/css/bootstrap.min.css';
import { useEffect, useState, useRef } from "react";
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from "react-redux";
import { setPositionPage } from "./redux/commonSlice.js";
import styles from "./Layout.module.css";

import SearchBar from "./components/SearchBar.jsx";
import SearchResults from "./components/SearchResults.jsx";
import HomeIcon from "./components/HomeIcon.jsx";
import { searchProfessors, getFilterOptions } from "./utils/searchEngine.js";
import allData from "./assets/allData.json";

import eesaLogo from "@/assets/icon.jpg";
import houseIcon from "@/assets/house.svg";
import magnifierIcon from "@/assets/megnifier.svg";


function TopNavbar() {
  const [show1, setShow1] = useState(false);
  const [show2, setShow2] = useState(false);
  const [show3, setShow3] = useState(false);
  const [show4, setShow4] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [filterOptions, setFilterOptions] = useState({});
  const navbarRef = useRef(null);
  const searchContainerRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // 初始化過濾選項
    setFilterOptions(getFilterOptions(allData));
  }, []);

  useEffect(() => {
    const updateNavbarHeight = () => {
      const height = navbarRef.current?.offsetHeight || 0;
      document.documentElement.style.setProperty('--navbar-height', `${height}px`);
    };

    updateNavbarHeight();
    window.addEventListener('resize', updateNavbarHeight);
    return () => {
      window.removeEventListener('resize', updateNavbarHeight);
    };
  }, []);

  // 點擊外面關閉搜尋結果
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowSearchResults(false);
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const handleSearch = (query, filters) => {
    if (!query.trim()) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = searchProfessors(query, allData, filters);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleFilterChange = (filters) => {
    // 過濾器改變時會自動觸發 handleSearch
  };

  const handleSearchResultClick = () => {
    setShowSearchResults(false);
  };
  // 判斷是否使用淺色版本
  const isLightVersion = location.pathname === '/topicpage'; // 首頁使用淺色版本，可以根據需求添加其他路徑
  const theme = isLightVersion ? 'light' : 'dark';
  return (
    <>
      <Navbar ref={navbarRef} variant={theme} expand="lg"
             className={`${styles.navbarCustom} ${styles[`navbar${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
        <Container fluid className={styles.customContainer}>
          <Navbar.Brand as={Link} to="/" className={`${styles.brandTitle} ${styles[`brandTitle${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
            陽明交大電機專題資訊
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              {/* Desktop version */}
              <div className={`${styles.navRight} ${styles[`navRight${theme.charAt(0).toUpperCase() + theme.slice(1)}`]} d-none d-lg-flex`}>
                <div ref={searchContainerRef}>
                  <SearchBar
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filterOptions={filterOptions}
                  />
                </div>
                <Link to="/" className={`${styles.navIcon} ${styles[`navIcon${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
                  <HomeIcon width={28} height={28} />
                </Link>
              </div>
              {/* Mobile version */}
              <div className="d-lg-none">
                <div ref={searchContainerRef} style={{ marginBottom: '10px' }}>
                  <SearchBar
                    onSearch={handleSearch}
                    onFilterChange={handleFilterChange}
                    filterOptions={filterOptions}
                  />
                </div>
                <Nav.Link as={Link} to="/" className={styles.mobileNavLink}>
                  <HomeIcon width={24} height={24} className={styles.mobileIcon} />
                  首頁
                </Nav.Link>
              </div>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <SearchResults
        results={searchResults}
        isOpen={showSearchResults}
        onClose={() => setShowSearchResults(false)}
        onResultClick={handleSearchResultClick}
      />
    </>
  );
};

function Footer() {

    return(
        <footer className={styles.navbarFooter}>
            <div className={styles.contactRow}>
            <span className={styles.contactItem}>| TEL | +886-3-xyz-xxxx</span>
            <span className={styles.contactItem}>| Email | Imtensor@gmail.com</span>
            <span className={styles.contactItem}>| Address | 新竹市東區大學路1001號工程五館219B室</span>
            </div>
            <hr className={styles.contactHr} />
            <div className={styles.contactCopyRight}>
            Copyright © National Yang Ming Chiao Tung University EESA | Team NaNashi & Chang. All Rights Reserved.
            </div>
        </footer>      
    )
}
export default function Layout({ children }) {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const location = useLocation();
    const positions = useSelector((state) => state.positionPage);

    // Check if current page is main page
    const isMainPage = location.pathname === '/';

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
    <div className={styles.layoutContainer}>
      {!isMainPage && <TopNavbar />}
      <main className={`${styles.layoutMain} ${isMainPage ? styles.noNavbar : ''}`}>{children}</main>
      {!isMainPage && <Footer />}
    </div>
  );
}