import React, { useState, useEffect, useRef } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  Moon, 
  Sun, 
  MapPin, 
  Download,
  Briefcase,
  GraduationCap,
  Code,
  User,
  Send,
  MessageSquare,
  Sparkles,
  X,
  Loader2,
  Bot,
  Award
} from 'lucide-react';

const Portfolio = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [activeSection, setActiveSection] = useState('about');
  
  // AI Chat State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', text: "Hi! I'm Edwin's AI assistant. Ask me anything about his Data Engineering experience, cloud certifications, or work history." }
  ]);
  const [userQuery, setUserQuery] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  // AI Message Drafter State
  const [isDrafting, setIsDrafting] = useState(false);
  const [draftPrompt, setDraftPrompt] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [showDraftInput, setShowDraftInput] = useState(false);

  // Constants
  const apiKey = import.meta.env.VITE_GEMINI_API_KEY; // System provides this at runtime

  // --- PERSONAL DATA FROM RESUME ---
  const personalInfo = {
    name: "Edwin Quijas",
    title: "Senior Data Engineer & Cloud Architect",
    location: "Melbourne, Australia",
    email: "edwinquijas@gmail.com",
    bio: "Experienced multidimensional Data Engineer with over 15 years of expertise in Banking, Telco, and Healthcare domains. I specialize in designing scalable cloud infrastructure and data pipelines on AWS, Azure, and Microsoft Fabric. I am a certified Professional Scrum Master and PMP with deep experience in CI/CD, Terraform, and Databricks.",
    socials: {
      github: "#", 
      linkedin: "#", 
      twitter: "#"
    }
  };

  const experience = [
    {
      id: 1,
      role: "Senior Consultant (Data Engineer)",
      company: "Cognizant",
      period: "Sep 2021 – Nov 2024",
      description: "Designed and implemented scalable data pipelines for clients like NAB, Merricks Capital, and Goulburn Valley Water. Developed Gold/Presentation layer models using Kimball methodology and managed cloud infrastructure via Terraform (IaC) on AWS/Azure. Led performance optimization and CI/CD implementation."
    },
    {
      id: 2,
      role: "Senior BI Consultant",
      company: "NostraData",
      period: "Apr 2017 – Sep 2021",
      description: "Built end-to-end BI solutions in AWS (S3, EC2, Redshift, RDS). Developed optimized Data Warehouse tables and dashboards using MicroStrategy, PowerBI, and QuickSight. Led onshore and offshore BI teams and managed client stakeholder communication."
    },
    {
      id: 3,
      role: "Senior BI Consultant",
      company: "Teradata Corporation",
      period: "Aug 2015 – Mar 2017",
      description: "Led the team in implementing BI solutions to drive business insights. Conducted performance tuning, ETL/ELT development, and MicroStrategy training. Managed onshore client communications and issue resolution."
    },
    {
      id: 4,
      role: "Business Intelligence Consultant",
      company: "Fujitsu Malaysia",
      period: "Jan 2011 – Aug 2015",
      description: "Took a lead role in BI implementation. Developed dashboards for Telco clients to analyze subscriber activity. Focused on process improvement and KPI leveraging to maximize performance."
    },
    {
      id: 5,
      role: "Software Engineer",
      company: "Accenture",
      period: "May 2008 – Dec 2010",
      description: "Facilitated BI provision for decision-making processes. Consolidated data from diverse sources, managed databases, and presented analytical results to management."
    }
  ];

  const education = [
    {
      degree: "B.S. Computer Engineering",
      school: "University of the East, Philippines",
      year: "2007"
    }
  ];

  const skills = [
    { category: "Cloud Platforms", items: ["AWS", "Azure", "Microsoft Fabric", "Databricks", "Snowflake"] },
    { category: "Data Engineering", items: ["PySpark", "SQL", "Python", "ETL/ELT", "Kimball Methodology", "Data Modeling"] },
    { category: "DevOps & Tools", items: ["Terraform", "GitHub", "Azure DevOps", "CI/CD", "Azure Data Factory"] },
    { category: "Certifications", items: ["Fabric Data Engineer Assoc", "Databricks Data Engineer Assoc", "Azure Data Engineer Assoc", "AWS Solutions Architect", "PMP", "Professional Scrum Master I"] }
  ];

  // Toggle dark mode
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const toggleTheme = () => setDarkMode(!darkMode);

  const scrollToSection = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  // --- Gemini API Logic ---

  const callGemini = async (prompt, systemInstruction = "") => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: systemInstruction }] }
    };

    let attempt = 0;
    const maxRetries = 3;
    const delays = [1000, 2000, 4000];

    while (attempt <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now. Try again?";
      } catch (e) {
        if (attempt === maxRetries) return "Sorry, I'm currently offline. Please try again later.";
        await new Promise(resolve => setTimeout(resolve, delays[attempt]));
        attempt++;
      }
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userQuery.trim() || isChatLoading) return;

    const newMsg = { role: 'user', text: userQuery };
    setChatMessages(prev => [...prev, newMsg]);
    setUserQuery('');
    setIsChatLoading(true);

    // Context specifically derived from Edwin's CV
    const contextData = JSON.stringify({ personalInfo, experience, skills, education });
    
    const systemPrompt = `You are an AI assistant for Edwin Quijas. You are embedded in his portfolio website.
    Your goal is to answer visitor questions about Edwin using ONLY the provided JSON data.
    
    Key Highlights to Emphasize:
    - He has over 15 years of experience.
    - He holds multiple certifications (AWS, Azure, Databricks, Fabric, PMP).
    - He has strong expertise in Terraform, Python, and PySpark.
    
    Traits:
    - Professional, friendly, and concise.
    - Speak in the first person ("I" or "My") as if you are Edwin's digital twin, OR third person ("Edwin"), whichever flows better.
    - If asked about something not in the data (like his exact street address), politely decline, though you can mention he is based in Melbourne/Mambourin.
    - Keep answers short (under 3 sentences) unless asked for details.
    
    Data: ${contextData}`;

    // Construct conversation history for context
    const history = chatMessages.slice(-4).map(m => `${m.role}: ${m.text}`).join('\n');
    const fullPrompt = `${history}\nuser: ${newMsg.text}\nassistant:`;

    const responseText = await callGemini(fullPrompt, systemPrompt);

    setChatMessages(prev => [...prev, { role: 'assistant', text: responseText }]);
    setIsChatLoading(false);
  };

  const handleMagicDraft = async () => {
    if (!draftPrompt.trim()) return;
    setIsDrafting(true);

    const systemPrompt = "You are a helpful writing assistant for a portfolio contact form.";
    const userPrompt = `Draft a polite, professional, and concise message from a visitor to Edwin Quijas.
    The visitor's intent is: "${draftPrompt}".
    The message should be ready to send (no placeholders). Keep it under 100 words.`;

    const draftedText = await callGemini(userPrompt, systemPrompt);
    
    setContactMessage(draftedText);
    setIsDrafting(false);
    setShowDraftInput(false);
    setDraftPrompt('');
  };

  return (
    <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'} font-sans selection:bg-indigo-500 selection:text-white`}>
      
      {/* Navigation Bar */}
      <nav className={`fixed top-0 w-full z-50 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-serif italic">E</div>
            <span>Quijas</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-medium">
            {['About', 'Experience', 'Skills', 'Contact'].map((item) => (
              <button 
                key={item}
                onClick={() => scrollToSection(item.toLowerCase())}
                className={`hover:text-indigo-600 transition-colors ${activeSection === item.toLowerCase() ? 'text-indigo-600' : 'text-slate-500 dark:text-slate-400'}`}
              >
                {item}
              </button>
            ))}
          </div>

          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'bg-slate-800 text-yellow-400 hover:bg-slate-700' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
            aria-label="Toggle Theme"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-6 pt-32 pb-20">
        
        {/* Header / Hero Section */}
        <section id="about" className="mb-24 fade-in-up">
          <div className="grid md:grid-cols-3 gap-12 items-start">
            <div className="md:col-span-2 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                </span>
                Available for Opportunities
              </div>
              
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight">
                Hello, I'm {personalInfo.name}. <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400">
                  {personalInfo.title}.
                </span>
              </h1>
              
              <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl">
                {personalInfo.bio}
              </p>

              <div className="flex flex-wrap gap-4 pt-4">
                <a href={`mailto:${personalInfo.email}`} className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all hover:shadow-lg hover:shadow-indigo-500/30">
                  <Mail size={18} />
                  Contact Me
                </a>
                <button 
                  onClick={() => setIsChatOpen(true)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium border transition-all group ${darkMode ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}
                >
                  <Bot size={18} className="text-indigo-500 group-hover:animate-bounce" />
                  Ask AI About My Experience
                </button>
              </div>

              <div className="flex gap-4 pt-2 text-slate-500 dark:text-slate-400">
                <a href={personalInfo.socials.github} className="hover:text-indigo-600 transition-colors"><Github size={24} /></a>
                <a href={personalInfo.socials.linkedin} className="hover:text-indigo-600 transition-colors"><Linkedin size={24} /></a>
              </div>
            </div>

            {/* Abstract Profile Image / Card */}
            <div className="relative group">
              <div className={`absolute -inset-1 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 bg-gradient-to-r from-indigo-600 to-purple-600`}></div>
              <div className={`relative aspect-[3/4] rounded-xl overflow-hidden shadow-2xl ${darkMode ? 'bg-slate-900' : 'bg-white'}`}>
                {/* Placeholder for user image */}
                <div className="w-full h-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center relative overflow-hidden">
                   <div className="absolute inset-0 opacity-10 dark:opacity-20" style={{
                       backgroundImage: 'radial-gradient(#6366f1 2px, transparent 2px)',
                       backgroundSize: '30px 30px'
                   }}></div>
                   <User size={64} className="text-slate-400" />
                </div>
                
                {/* Floating Info Card */}
                <div className={`absolute bottom-4 left-4 right-4 p-4 rounded-lg backdrop-blur-md border ${darkMode ? 'bg-slate-900/80 border-slate-700' : 'bg-white/80 border-slate-200'}`}>
                   <div className="flex items-center gap-2 text-sm font-semibold">
                     <MapPin size={16} className="text-indigo-500"/>
                     {personalInfo.location}
                   </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <hr className={`border-t mb-24 ${darkMode ? 'border-slate-800' : 'border-slate-200'}`} />

        {/* Experience Section */}
        <section id="experience" className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Briefcase size={24} />
            </div>
            <h2 className="text-3xl font-bold">Work Experience</h2>
          </div>

          <div className="space-y-12 relative border-l-2 border-slate-200 dark:border-slate-800 ml-3 md:ml-6 pl-8 md:pl-12">
            {experience.map((job) => (
              <div key={job.id} className="relative group">
                <div className={`absolute -left-[41px] md:-left-[57px] top-0 w-5 h-5 rounded-full border-4 transition-colors ${darkMode ? 'bg-slate-900 border-slate-700 group-hover:border-indigo-500' : 'bg-white border-slate-300 group-hover:border-indigo-500'}`}></div>
                
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                  <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">{job.role}</h3>
                  <span className="text-sm font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">{job.period}</span>
                </div>
                <div className="text-indigo-600 dark:text-indigo-400 font-medium mb-4">{job.company}</div>
                <p className="text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
                  {job.description}
                </p>
              </div>
            ))}
          </div>
        </section>
        
        {/* Education Section */}
        <section className="mb-24">
           <div className="flex items-center gap-4 mb-8">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <GraduationCap size={24} />
            </div>
            <h2 className="text-3xl font-bold">Education</h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            {education.map((edu, index) => (
              <div key={index} className={`p-6 rounded-xl border transition-all hover:shadow-lg ${darkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-indigo-200'}`}>
                <h3 className="text-lg font-bold">{edu.degree}</h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">{edu.school}</p>
                <p className="text-sm text-indigo-600 dark:text-indigo-400 mt-4">{edu.year}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="mb-24">
          <div className="flex items-center gap-4 mb-12">
            <div className="p-3 rounded-lg bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300">
              <Code size={24} />
            </div>
            <h2 className="text-3xl font-bold">Skills & Certifications</h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {skills.map((skillGroup, idx) => (
              <div key={idx} className="space-y-4">
                <h3 className="font-semibold text-lg text-slate-900 dark:text-slate-100 border-b pb-2 border-slate-200 dark:border-slate-800 flex items-center gap-2">
                  {skillGroup.category === "Certifications" && <Award size={16} className="text-indigo-500" />}
                  {skillGroup.category}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {skillGroup.items.map((skill) => (
                    <span 
                      key={skill} 
                      className={`px-3 py-1.5 text-sm rounded-md transition-colors ${darkMode ? 'bg-slate-800 text-slate-300 hover:text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Contact Section */}
        <section id="contact">
          <div className={`rounded-3xl p-8 md:p-12 overflow-hidden relative ${darkMode ? 'bg-slate-900' : 'bg-slate-900 text-white'}`}>
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-y-1/2 -translate-x-1/2"></div>

            <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className={`text-3xl md:text-4xl font-bold mb-4 ${!darkMode ? 'text-white' : 'text-slate-100'}`}>Let's work together</h2>
                <p className={`mb-8 text-lg ${!darkMode ? 'text-slate-300' : 'text-slate-400'}`}>
                  I'm currently available for opportunities in Data Engineering and Cloud Architecture. Drop me a line if you have a project or role in mind.
                </p>
                
                <div className="space-y-4">
                  <a href={`mailto:${personalInfo.email}`} className={`flex items-center gap-3 text-lg font-medium hover:text-indigo-400 transition-colors ${!darkMode ? 'text-white' : 'text-slate-200'}`}>
                    <Mail /> {personalInfo.email}
                  </a>
                  <div className={`flex items-center gap-3 text-lg font-medium ${!darkMode ? 'text-white' : 'text-slate-200'}`}>
                    <MapPin /> {personalInfo.location}
                  </div>
                </div>
              </div>

              <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                <div>
                  <label htmlFor="name" className={`block text-sm font-medium mb-1 ${!darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Name</label>
                  <input type="text" id="name" className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400'}`} placeholder="Your name" />
                </div>
                <div>
                  <label htmlFor="email" className={`block text-sm font-medium mb-1 ${!darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Email</label>
                  <input type="email" id="email" className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400'}`} placeholder="your@email.com" />
                </div>
                
                {/* AI Drafting Feature */}
                <div className="relative">
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="message" className={`block text-sm font-medium ${!darkMode ? 'text-slate-300' : 'text-slate-400'}`}>Message</label>
                    
                    {!showDraftInput && (
                       <button 
                         type="button"
                         onClick={() => setShowDraftInput(true)}
                         className="text-xs flex items-center gap-1 text-indigo-400 hover:text-indigo-300 transition-colors"
                       >
                         <Sparkles size={12} /> Magic Draft
                       </button>
                    )}
                  </div>
                  
                  {showDraftInput && (
                    <div className={`mb-3 p-3 rounded-lg border ${darkMode ? 'bg-slate-800 border-indigo-500/50' : 'bg-slate-100 border-indigo-300'}`}>
                      <p className="text-xs mb-2 opacity-70">Tell AI what you want to say (e.g. "Ask for a coffee chat about a Data Engineer role"):</p>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={draftPrompt}
                          onChange={(e) => setDraftPrompt(e.target.value)}
                          className={`flex-1 px-3 py-1.5 text-sm rounded border outline-none ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-300'}`}
                          placeholder="Short prompt..."
                          onKeyDown={(e) => e.key === 'Enter' && handleMagicDraft()}
                        />
                        <button 
                          type="button" 
                          onClick={handleMagicDraft}
                          disabled={isDrafting}
                          className="bg-indigo-600 text-white px-3 py-1.5 rounded text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 flex items-center gap-1"
                        >
                          {isDrafting ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                          Generate
                        </button>
                      </div>
                    </div>
                  )}

                  <textarea 
                    id="message" 
                    rows="4" 
                    value={contactMessage}
                    onChange={(e) => setContactMessage(e.target.value)}
                    className={`w-full px-4 py-3 rounded-lg border focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-800/50 border-slate-700 text-white placeholder-slate-400'}`} 
                    placeholder="Tell me about your project..."
                  ></textarea>
                </div>

                <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold text-lg transition-colors flex items-center justify-center gap-2">
                  Send Message <Send size={20} />
                </button>
              </form>
            </div>
          </div>
        </section>

      </main>

      {/* Floating Chat Button */}
      <button 
        onClick={() => setIsChatOpen(true)}
        className={`fixed bottom-6 right-6 p-4 rounded-full shadow-2xl z-40 transition-transform hover:scale-105 ${darkMode ? 'bg-indigo-600 text-white hover:bg-indigo-500' : 'bg-slate-900 text-white hover:bg-slate-800'} ${isChatOpen ? 'scale-0' : 'scale-100'}`}
      >
        <MessageSquare size={24} />
      </button>

      {/* Chat Interface Modal */}
      {isChatOpen && (
        <div className={`fixed bottom-6 right-6 w-80 md:w-96 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col border transition-all ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-white border-slate-200'}`} style={{ maxHeight: '600px', height: '80vh' }}>
          
          {/* Chat Header */}
          <div className="p-4 bg-indigo-600 text-white flex justify-between items-center shrink-0">
            <div className="flex items-center gap-2">
              <div className="bg-white/20 p-1.5 rounded-lg backdrop-blur-sm">
                <Bot size={18} />
              </div>
              <div>
                <h3 className="font-bold text-sm">Edwin's Digital Twin</h3>
                <p className="text-xs text-indigo-100 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  Online
                </p>
              </div>
            </div>
            <button onClick={() => setIsChatOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors">
              <X size={18} />
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : darkMode 
                      ? 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700' 
                      : 'bg-slate-100 text-slate-800 rounded-tl-none'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className={`p-3 rounded-2xl rounded-tl-none flex items-center gap-2 ${darkMode ? 'bg-slate-800' : 'bg-slate-100'}`}>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <form onSubmit={handleChatSubmit} className={`p-3 border-t shrink-0 ${darkMode ? 'border-slate-800 bg-slate-900' : 'border-slate-100 bg-white'}`}>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Ask about my experience..."
                className={`flex-1 px-4 py-2 text-sm rounded-full border outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white placeholder-slate-500' : 'bg-slate-100 border-transparent text-slate-900'}`}
              />
              <button 
                type="submit" 
                disabled={isChatLoading || !userQuery.trim()}
                className="p-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send size={18} />
              </button>
            </div>
            <div className="text-center mt-2">
              <span className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
                Powered by Gemini <Sparkles size={8} />
              </span>
            </div>
          </form>
        </div>
      )}

      {/* Simple Footer */}
      <footer className={`py-8 text-center text-sm ${darkMode ? 'bg-slate-950 text-slate-600' : 'bg-slate-50 text-slate-500'}`}>
        <p>&copy; {new Date().getFullYear()} {personalInfo.name}. All rights reserved.</p>
      </footer>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .fade-in-up {
          animation: fadeIn 0.6s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default App;