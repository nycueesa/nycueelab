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
import { useData } from "./hooks/useData.js";

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
  const { data: newData, loading: dataLoading } = useData();

  useEffect(() => {
    // 初始化過濾選項
    if (newData) {
      setFilterOptions(getFilterOptions(newData));
    }
  }, [newData]);

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
      // 檢查點擊是否在搜索容器外面，並且不在搜索結果內
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        // 檢查是否點擊的是搜索結果項目
        const isSearchResult = event.target.closest('[data-search-result]');
        if (!isSearchResult) {
          setShowSearchResults(false);
        }
      }
    };

    if (showSearchResults) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showSearchResults]);

  const handleSearch = (query, filters = {}) => {
    if (!newData) return;

    const hasFilters = Boolean(filters?.location || filters?.department);

    if (!query.trim() && !hasFilters) {
      setSearchResults([]);
      setShowSearchResults(false);
      return;
    }

    const results = searchProfessors(query, newData, filters);
    setSearchResults(results);
    setShowSearchResults(true);
  };

  const handleFilterChange = (filters) => {
    // Filter changes also trigger SearchBar.onSearch with同一批 filters，這裡無需額外處理
    const hasFilters = Boolean(filters?.location || filters?.department);
    if (hasFilters && !showSearchResults) {
      setShowSearchResults(true);
    }
  };

  const handleSearchResultClick = () => {
    setShowSearchResults(false);
  };
  // 所有頁面都使用淺色版本
  const theme = 'light';
  return (
    <>
      <Navbar ref={navbarRef} variant={theme} expand="lg"
             className={`${styles.navbarCustom} ${styles[`navbar${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
        <Container fluid className={styles.customContainer}>
          <Navbar.Brand as={Link} to="/" className={`${styles.brandTitle} ${styles[`brandTitle${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}>
            陽明交大電機專題資訊
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" className={`${styles.menuButton}`}>
            <svg
              className={`${styles.menuButtonImg} ${styles[`menuButtonImg${theme.charAt(0).toUpperCase() + theme.slice(1)}`]}`}
              width="54"
              height="58"
              viewBox="0 0 54 58"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="img"
              aria-label="menu"
            >
              <path d="M47.25 24.1667H6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M47.25 14.5H6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M47.25 33.8333H6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M47.25 43.5H6.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Navbar.Toggle>
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