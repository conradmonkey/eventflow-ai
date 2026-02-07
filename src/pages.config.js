/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import EventPlannerProfile from './pages/EventPlannerProfile';
import Home from './pages/Home';
import LightingDesign from './pages/LightingDesign';
import OutdoorLayoutPlanner from './pages/OutdoorLayoutPlanner';
import PermitInvestigation from './pages/PermitInvestigation';
import PermitInvestigator from './pages/PermitInvestigator';
import RoomDesigner from './pages/RoomDesigner';
import SoundDesign from './pages/SoundDesign';
import StageDesign from './pages/StageDesign';
import TentDesign from './pages/TentDesign';
import VenueScouting from './pages/VenueScouting';
import VideoWallDesign from './pages/VideoWallDesign';
import VideoWallDrawing from './pages/VideoWallDrawing';


export const PAGES = {
    "EventPlannerProfile": EventPlannerProfile,
    "Home": Home,
    "LightingDesign": LightingDesign,
    "OutdoorLayoutPlanner": OutdoorLayoutPlanner,
    "PermitInvestigation": PermitInvestigation,
    "PermitInvestigator": PermitInvestigator,
    "RoomDesigner": RoomDesigner,
    "SoundDesign": SoundDesign,
    "StageDesign": StageDesign,
    "TentDesign": TentDesign,
    "VenueScouting": VenueScouting,
    "VideoWallDesign": VideoWallDesign,
    "VideoWallDrawing": VideoWallDrawing,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
};