"use client";
import { useState, createContext, useContext, ReactNode, useEffect } from 'react';

type Language = 'en' | 'hi';

const translations = {
    en: {
        dashboard: "Dashboard",
        maps: "Farm Maps",
        analytics: "Analytics",
        reports: "Reports",
        team: "Team",
        notifications: "Notifications",
        settings: "Settings",
        overview: "Field Overview",
        welcome: "Welcome back! Here's what's happening in your farm today.",
        yield: "Est. Yield",
        moisture: "Soil Moisture",
        pestRisk: "Pest Risk",
        launchDrone: "Launch Analysis",
        export: "Export Data",
        zonalAnalysis: "Zonal Analysis",
        alerts: "Critical Alerts",
        smartActions: "Smart Actions",
        proPlan: "PRO PLAN",
        upgrade: "Upgrade Now",
        flightLogs: "Flight Logs",
        gisEngine: "GIS Engine",
        initializing: "Initializing...",
        loadingData: "Loading multispectral data for North Field Sector 7",
        healthLegend: "Health Index Legend (NDVI)",
        optimal: "Optimal Vigor",
        moderate: "Moderate Stress",
        critical: "Critical/Soil",
        exportSuccess: "Report exported successfully!",
        analysisTitle: "Drone Reports & Logs",
        analysisDesc: "Access and manage all flight data and AI analysis reports.",
        newAnalysis: "New Analysis",
        selectFarm: "Select Farm",
        uploadImage: "Upload Multispectral/RGB Image",
        processing: "Processing Analysis...",
        selectFile: "Select File to Analyze",
        farmName: "Farm Name",
        date: "Date",
        ndviInfo: "NDVI Info",
        status: "Status",
        actions: "Actions",
        noReports: "No analysis reports found. Upload an image to get started.",
        costSavings: "Cost Savings",
        revenueBoost: "Revenue Boost",
        resourceUtilization: "Resource Utilization",
        predictiveInsights: "Predictive Insights",
        economicImpact: "Economic Impact",
        anomalyDetected: "Anomaly Detected",
        searchReports: "Search reports...",
        filter: "Filter",
        analysisFailedAlert: "Analysis failed. Please make sure the ML service and Backend are running.",
        analyzeTitle: "Hyperspace AI Analysis",
        analyzeDesc: "Upload multispectral drone imagery or RGB field photos to trigger our YOLOv8 and NDVI processing engine.",
        targetImage: "Target Image",
        clickToUpload: "Click to Upload Drone Imagery",
        processingEngine: "AI Processing Engine Active...",
        liveResults: "Live Analysis Results",
        uploadPrompt: "Upload an image to see NDVI index, disease detection, and yield forecasts.",
        ndviIndex: "NDVI INDEX",
        yieldEst: "YIELD EST.",
        healthyField: "Healthy Field",
        aiRecs: "AI Recommendations",
        viewFullHistory: "View Full History",
        planFlight: "Plan Flight",
        captureUpload: "Capture & Upload",
        aiProcessing: "AI Processing",
        insightsAction: "Insights & Action",
        flightPrep: "Flight Preparation",
        dataAcquisition: "Data Acquisition",
        launchMission: "Launch Mission & Capture",
        aiStrategy: "AI Strategy",
        flightExport: "Flight Export",
        lastUpdated: "Last Updated"
    },
    hi: {
        dashboard: "डैशबोर्ड",
        maps: "फार्म मैप्स",
        analytics: "एनालिटिक्स",
        reports: "रिपोर्ट्स",
        team: "टीम",
        notifications: "सूचनाएं",
        settings: "सेटिंग्स",
        overview: "खेत का अवलोकन",
        welcome: "वापसी पर स्वागत है! आज आपके खेत में क्या हो रहा है, यहाँ देखें।",
        yield: "अनुमानित उपज",
        moisture: "मिट्टी की नमी",
        pestRisk: "कीट जोखिम",
        launchDrone: "विश्लेषण शुरू करें",
        export: "डेटा निर्यात करें",
        zonalAnalysis: "क्षेत्रीय विश्लेषण",
        alerts: "महत्वपूर्ण अलर्ट",
        smartActions: "स्मार्ट क्रियाएं",
        proPlan: "प्रो प्लान",
        upgrade: "अभी अपग्रेड करें",
        flightLogs: "उड़ान लॉग",
        gisEngine: "GIS इंजन",
        initializing: "प्रारंभ हो रहा है...",
        loadingData: "उत्तर क्षेत्र सेक्टर 7 के लिए मल्टीस्पेक्ट्रल डेटा लोड हो रहा है",
        healthLegend: "स्वास्थ्य सूचकांक किंवदंती (NDVI)",
        optimal: "इष्टतम शक्ति",
        moderate: "मध्यम तनाव",
        critical: "गंभीर/मिट्टी",
        exportSuccess: "रिपोर्ट सफलतापूर्वक निर्यात की गई!",
        analysisTitle: "ड्रोन रिपोर्ट और लॉग",
        analysisDesc: "सभी उड़ान डेटा और AI विश्लेषण रिपोर्टों तक पहुंचें और प्रबंधित करें।",
        newAnalysis: "नया विश्लेषण",
        selectFarm: "फार्म चुनें",
        uploadImage: "मल्टीस्पेक्ट्रल/RGB इमेज अपलोड करें",
        processing: "विश्लेषण संसाधित हो रहा है...",
        selectFile: "विश्लेषण के लिए फ़ाइल चुनें",
        farmName: "फार्म का नाम",
        date: "तारीख",
        ndviInfo: "NDVI जानकारी",
        status: "स्थिति",
        actions: "कार्रवाई",
        noReports: "कोई विश्लेषण रिपोर्ट नहीं मिली। शुरू करने के लिए एक इमेज अपलोड करें।",
        costSavings: "लागत बचत",
        revenueBoost: "राजस्व वृद्धि",
        resourceUtilization: "संसाधन उपयोग",
        predictiveInsights: "भविष्यवाणी अंतर्दृष्टि",
        economicImpact: "आर्थिक प्रभाव",
        anomalyDetected: "विसंगति का पता चला",
        searchReports: "रिपोर्ट खोजें...",
        filter: "फ़िल्टर करें",
        analysisFailedAlert: "विश्लेषण विफल रहा। कृपया सुनिश्चित करें कि ML सेवा और बैकएंड चल रहे हैं।",
        analyzeTitle: "हाइपरस्पेस AI विश्लेषण",
        analyzeDesc: "हमारे YOLOv8 और NDVI प्रोसेसिंग इंजन को ट्रिगर करने के लिए मल्टीस्पेक्ट्रल ड्रोन इमेजरी या RGB फील्ड फोटो अपलोड करें।",
        targetImage: "लक्षित छवि",
        clickToUpload: "ड्रोन इमेजरी अपलोड करने के लिए क्लिक करें",
        processingEngine: "AI प्रोसेसिंग इंजन सक्रिय है...",
        liveResults: "लाइव विश्लेषण परिणाम",
        uploadPrompt: "NDVI इंडेक्स, रोग का पता लगाने और उपज के पूर्वानुमान देखने के लिए एक छवि अपलोड करें।",
        ndviIndex: "NDVI इंडेक्स",
        yieldEst: "उपज अनुमान",
        healthyField: "स्वस्थ खेत",
        aiRecs: "AI सिफारिशें",
        viewFullHistory: "पूरा इतिहास देखें",
        planFlight: "उड़ान की योजना",
        captureUpload: "कैप्चर और अपलोड",
        aiProcessing: "AI प्रसंस्करण",
        insightsAction: "अंतर्दृष्टि और कार्रवाई",
        flightPrep: "उड़ान की तैयारी",
        dataAcquisition: "डेटा अधिग्रहण",
        launchMission: "मिशन और कैप्चर लॉन्च करें",
        aiStrategy: "AI रणनीति",
        flightExport: "उड़ान निर्यात",
        lastUpdated: "पिछला अपडेट"
    }
};

interface LanguageContextType {
    lang: Language;
    setLang: (lang: Language) => void;
    t: (key: keyof typeof translations['en']) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [lang, setLang] = useState<Language>('en');

    // Persist language preference
    useEffect(() => {
        const savedLang = localStorage.getItem('lang') as Language;
        if (savedLang) setLang(savedLang);
    }, []);

    useEffect(() => {
        localStorage.setItem('lang', lang);
    }, [lang]);

    const t = (key: keyof typeof translations['en']) => {
        //@ts-ignore
        return translations[lang][key] || translations['en'][key] || key;
    };

    return (
        <LanguageContext.Provider value={{ lang, setLang, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
