import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Header from './Layout/Header';
import Homepage from './Pages/Homepage';
import About from './Pages/About';
import Services from './Pages/Services';
import Blog from './Pages/Blog';
import Contact from './Pages/Contact';
import './App.css'
import Footer from './Layout/Footer';
import Clubs from './Pages/Clubs';
import InfluencerMarketing from './Pages/InfluencerMarketing';
import PrComms from './Pages/PrComms';
import Radio from './Pages/Radio';
import Label from './Pages/Label';
import Layout from './Components/Layout';
import ArtistPage from './Components/ArtistPage';
import Login from './Pages/Login';
import Signup from './Pages/Signup';
import SinglePost from './Pages/BlogPages/SinglePost';
import BlogLayout from './Layout/BlogLayout';
import CreatePost from './Pages/BlogPages/CreatePost';


const App = () => {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Header />
        
        <main className="flex-grow">
          <Layout>
          <Routes>
            <Route path="/" element={<Homepage/>} />
            <Route path="/about" element={<About />} />
            <Route path="/artists/:id" element={<ArtistPage />} />
            <Route path="/services">
              <Route index element={<Services />} /> {/* Optional: default child route */}
              <Route path="clubs" element={<Clubs />} />
              <Route path="influencer-marketing" element={<InfluencerMarketing />} />
              <Route path="pr-comms" element={<PrComms />} /> {/* Changed from pr&comms */}
              <Route path="radio" element={<Radio />} />
              <Route path="label-services" element={<Label />} />
            </Route>
            <Route path="/blog" element={<BlogLayout />}>
              <Route index element={<Blog />} />
              <Route path=":id-:slug" element={<SinglePost />} /> 
              <Route path=":id" element={<SinglePost />} /> {/* Fallback for old URLs */}  
              <Route path="write" element={<CreatePost />} /> 
            </Route>

            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
                    {/* Catch-all route */}
           {/* <Route path="*" element={<Navigate to={"/"} />} /> */}
          </Routes>
          </Layout>
        </main>
      <Footer />
      </div>

    </Router>
  );
};

export default App;