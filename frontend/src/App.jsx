import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx"
import Main from "./page/main/Main.jsx"
import TopicPage from "./page/topicpage/topicpage.jsx"
import ProfessorInfo from './page/topicpage/infoPage/ProfessorInfo.jsx';
import Professor from './page/Professor/Professor.jsx';

function App(){
	return (
		 //<BrowserRouter basename="/nycueelab">
		  	<Layout>
				<Routes>
					<Route path="/" element={<Main />} />

					<Route path="/topicpage" element={<TopicPage />} />
					<Route path="/topicpage/prof-info/:profId" element={<ProfessorInfo />} />

					{/* New route for detailed professor page */}
					<Route path="/professor/:profId" element={<Professor />} />
					<Route path="/professor" element={<Professor />} />

				</Routes>
		  	</Layout>
		//</BrowserRouter>
	);
};

export default App;
