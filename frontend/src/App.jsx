import React from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout.jsx"
import Main from "./page/main/Main.jsx"
import Contact from "./page/contact/Contact.jsx"
import Activities from "./page/activities/Activities.jsx"
import EesaIntro from "./page/intro/EesaIntro.jsx"
import Member from "./page/intro/Member.jsx"
import Academic from "./page/intro/Academic.jsx";
import EventIntro from "./page/event/EventIntro.jsx"
import NewInfo from "./page/event/NewInfo.jsx"
import Timeline from "./page/event/Timeline.jsx"
import Team from "./page/team/Team.jsx"
import PrevExam from "./page/resource/PrevExam.jsx"
import Project from "./page/resource/Project.jsx"
import Calendar from "./page/file/Calendar.jsx"
import CourseTool from "./page/file/CourseTool.jsx"
import TopicPage from "./page/topicpage/topicpage.jsx"

function App(){		
	return (
		// <BrowserRouter basename="/nycueelab">
		  	<Layout>
				<Routes>
			  		<Route path="/" element={<Main />} />

					<Route path="/intro/eesa-intro" element={<EesaIntro />} />
					<Route path="/intro/member" element={<Member />} />
					<Route path="/intro/academic" element={<Academic />} />

					<Route path="/event/event-intro" element={<EventIntro />} />
					<Route path="/event/new-info" element={<NewInfo />} />
					<Route path="/event/timeline" element={<Timeline />} />

					<Route path="/team" element={<Team />} />

					<Route path="/resource/prevexam" element={<PrevExam />} />
					<Route path="/resource/project" element={<Project />} />

					<Route path="/file/calendar" element={<Calendar />} />
					<Route path="/file/course-tool" element={<CourseTool />} />

			  		<Route path="/activities" element={<Activities />} />
			  		<Route path="/contact" element={<Contact />} />

					<Route path="/topicpage" element={<TopicPage />} />
					
				</Routes>
		  	</Layout>
		// </BrowserRouter>
	);
};

export default App;
