import React from 'react';
import { Navigate, Routes, Route, useLocation } from "react-router-dom";
import { useEffect, useState } from 'react';
import Layout from "./Layout.jsx"
import Main from "./page/main/Main.jsx"
import TopicPage from "./page/topicpage/topicpage.jsx"
import Professor from './page/Professor/Professor.jsx';
import Feedback from './page/feedback/Feedback.jsx';
import Login from './page/Login/Login.jsx';
import ProfessorStatus from './page/ProfessorStatus/ProfessorStatus.jsx';
import { getCurrentUser } from './utils/auth.js';

function RequireLogin({ children }) {
    const location = useLocation();
    const [authorized, setAuthorized] = useState(null);

    useEffect(() => {
        let active = true;
        getCurrentUser().then((user) => {
            if (active) setAuthorized(Boolean(user));
        });
        return () => { active = false; };
    }, []);

    if (authorized === null) return <div role="status" style={{ padding: '3rem' }}>正在確認登入狀態…</div>;
    if (!authorized) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
    return children;
}

function App(){
	return (
		 //<BrowserRouter basename="/nycueelab">
		  	<Layout>
				<Routes>
					<Route path="/" element={<Main />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/professors/status" element={<RequireLogin><ProfessorStatus /></RequireLogin>} />

					<Route path="/topicpage" element={<TopicPage />} />

					{/* New route for detailed professor page */}
					<Route path="/professor/:profId" element={<Professor />} />
					<Route path="/professor" element={<Professor />} />

					<Route path="/feedback" element={<Feedback />} />

				</Routes>
		  	</Layout>
		//</BrowserRouter>
	);
};

export default App;
