export type SectionId =
  | "home"
  | "about"
  | "projects"
  | "experience"
  | "education"
  | "skills"
  | "services"
  | "certifications"
  | "achievements"
  | "contact";

export const sections: { id: SectionId; label: string; number: string; side: -1 | 1 }[] = [
  { id: "home", label: "Home", number: "01", side: -1 },
  { id: "about", label: "About me", number: "02", side: 1 },
  { id: "projects", label: "Projects", number: "03", side: -1 },
  { id: "experience", label: "Experience", number: "04", side: 1 },
  { id: "education", label: "Education", number: "05", side: -1 },
  { id: "skills", label: "Skills", number: "06", side: 1 },
  { id: "services", label: "Services", number: "07", side: -1 },
  { id: "certifications", label: "Certifications", number: "08", side: 1 },
  { id: "achievements", label: "Achievements", number: "09", side: -1 },
  { id: "contact", label: "Contact", number: "10", side: 1 },
];

const github = "https://github.com/sajjadhaider1016-dot";
export const projects = [
  {
    id: "veyra-language-studio",
    title: "VEYRA — Language Studio",
    category: "Web Development",
    eyebrow: "Multilingual communication",
    description: "A language studio for helping people communicate across languages, with a focus on speaking naturally, understanding clearly, and staying connected.",
    features: [],
    contribution: "",
    tech: [] as string[],
    github: "",
    live: "https://veyra-scwb.onrender.com/",
    screenshot: "",
  },
  {
    id: "study-buddy",
    title: "Study Buddy",
    category: "Software & Applications",
    eyebrow: "Education / Study tool",
    description: "A student-focused study companion created to support more organized, productive study time.",
    features: ["Student-focused study experience", "Product interface preview on the live portfolio"],
    contribution: "Built a study companion for a more organized and productive study experience.",
    tech: [] as string[],
    github: `${github}/StudyBuddy`,
    live: "",
    screenshot: "/projects/study-buddy-live.png",
  },
  {
    id: "docedit",
    title: "DocEdit",
    category: "Web Development",
    eyebrow: "Full-stack product · 2026",
    description: "Collaborative document editor inspired by Google Docs featuring authentication, document sharing, rich-text editing, autosave functionality, TXT/Markdown import, and PostgreSQL integration.",
    features: ["Sign-in and shared-document permissions", "Rich-text editing", "TXT and Markdown imports", "Autosave and PostgreSQL persistence"],
    contribution: "Built the full-stack editor and its document collaboration, persistence, and import workflows.",
    tech: ["Next.js 15", "TypeScript", "Tailwind CSS", "TipTap", "PostgreSQL"],
    github: `${github}/docedit-submission`,
    live: "https://docedit-submission.vercel.app/",
    screenshot: "",
  },
  {
    id: "bzu-ai-assistant",
    title: "BZU AI Assistant",
    category: "AI & Machine Learning",
    eyebrow: "AI / Intelligent assistant · 2026",
    description: "AI-powered university assistant designed to help students access academic information through conversational AI and intelligent search capabilities.",
    features: ["University question flows", "PDF and DOCX support", "Image OCR", "Voice input", "Saved chat history"],
    contribution: "Built an AI assistant with university question flows and document, image, and voice input.",
    tech: ["Node.js", "Express", "JavaScript", "Groq", "OCR", "PDF / DOCX"],
    github: `${github}/BZU-AI-Assistant`,
    live: "https://bzu-ai-assistant-production-8cc9.up.railway.app/",
    screenshot: "",
  },
  {
    id: "recoveriest",
    title: "Recoveriest",
    category: "Web Development",
    eyebrow: "Digital platform / Account recovery · 2026",
    description: "Account recovery and support platform focused on helping users resolve account access and platform recovery issues efficiently.",
    features: ["Service pages", "Recovery case categories", "Guided inquiry path", "Anti-scam safeguards"],
    contribution: "Built the customer-facing recovery and support experience.",
    tech: ["Next.js", "Node.js", "Database systems"],
    github: "",
    live: "https://recoveriest-app.vercel.app/",
    screenshot: "/projects/recoveriest-live.png",
  },
  {
    id: "customer-support-ai-copilot",
    title: "Customer Support AI Copilot",
    category: "AI & Machine Learning",
    eyebrow: "AI / Customer support · 2025–2026",
    description: "A Grok-powered support copilot that classifies customer intent and priority, reads sentiment, drafts a reply, suggests next steps, and flags cases for human escalation.",
    features: ["Intent and priority classification", "Sentiment reading", "Reply drafts and suggested next steps", "Human escalation flags"],
    contribution: "Built the Python and Flask orchestration, business-context grounding, structured AI output, and escalation guidance.",
    tech: ["Python", "Flask", "Grok API", "Llama"],
    github: `${github}/Customer-Support-AI-Grok`,
    live: "",
    screenshot: "",
  },
  {
    id: "contentpilot-ai",
    title: "ContentPilot AI",
    category: "AI & Machine Learning",
    eyebrow: "AI content & marketing assistant · 2025–2026",
    description: "A Flask and Groq-powered assistant that turns a brief into platform-ready content for different audiences, tones, languages, and formats.",
    features: ["Content variants", "Repurposing", "Copy-ready marketing assets"],
    contribution: "Built prompt and output orchestration for adaptable marketing content.",
    tech: ["Python", "Flask", "Groq API", "Llama 3.3 70B"],
    github: `${github}/ContentPilot-AI`,
    live: "",
    screenshot: "",
  },
  {
    id: "course-registration",
    title: "Course Registration System",
    category: "Software & Applications",
    eyebrow: "Desktop application / C++ · 2025",
    description: "A downloadable desktop application for managing university course registrations and student academic records, built with object-oriented C++.",
    features: ["Menu-driven student records", "Course registration flows", "Windows download"],
    contribution: "Built the menu-driven student record and course registration application.",
    tech: ["C++", "Object-oriented programming"],
    github: "",
    live: "/projects/university-course-registration-system.exe",
    screenshot: "",
  },
  {
    id: "car-racing",
    title: "Car Racing Game",
    category: "Experiments",
    eyebrow: "Academic / C++ · 2025",
    description: "Interactive racing game developed using C++ and object-oriented programming concepts.",
    features: ["Keyboard-controlled movement", "Race state", "Core C++ game loop"],
    contribution: "Built the game loop, input movement, and race-state flow.",
    tech: ["C++", "Object-oriented programming"],
    github: "",
    live: "",
    screenshot: "",
  },
];

export const experience = [
  {
    role: "AI Automation & Web Developer",
    org: "Studio BDTLA",
    date: "Aug 2026 – Present · Remote",
    description: "Working remotely on AI automation and web development.",
    points: ["Develop web experiences for the studio", "Work on AI automation solutions", "Collaborate remotely with the team"],
    tags: ["AI automation", "Web development", "Remote"],
  },
  {
    role: "Artificial Intelligence Intern",
    org: "PROSTACKHUB",
    date: "2026 · Selected incoming",
    description: "Selected for an industrial internship program focused on applied AI and machine learning.",
    points: ["Applied AI and machine learning", "Data analysis and model development", "Industry-focused learning"],
    tags: ["Artificial intelligence", "Machine learning", "Data analysis"],
  },
  {
    role: "AI & Full-Stack Developer",
    org: "Self-employed",
    date: "Current · Ongoing",
    description: "Design and build practical software products, from AI-assisted workflows to complete web applications.",
    points: ["Build AI and full-stack products from idea to deployment", "Create responsive interfaces and connected backend workflows", "Explore education, productivity, and account-recovery solutions"],
    tags: ["Next.js", "React", "Node.js", "AI automation"],
  },
  {
    role: "Co-Founder",
    org: "China Vibes",
    date: "Current · Ongoing",
    description: "Contribute to a consumer brand by connecting day-to-day operations with customer experience and digital growth.",
    points: ["Support brand and digital operations", "Focus on customer experience and product promotion", "Bring a product-minded perspective to business decisions"],
    tags: ["Operations", "Customer experience", "Brand growth"],
  },
];

export const education = [
  { title: "Bachelor of Science in Artificial Intelligence", place: "Bahauddin Zakariya University (BZU)", status: "Current student", detail: "Focused on AI systems, full-stack product work, and applied software engineering." },
  { title: "Intermediate", place: "Punjab Group of Colleges", status: "Completed", detail: "Strong academic foundation with distinction-level performance." },
  { title: "Secondary Education", place: "Centre of Excellence", status: "Completed", detail: "Early academic excellence and competitive standing." },
];

export const skillGroups = [
  { title: "Frontend", detail: "Interfaces that feel considered, fast, and production-ready.", skills: ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js", "Tailwind CSS"] },
  { title: "Backend", detail: "Server-side systems, APIs, and authentication flows.", skills: ["Node.js", "Express.js", "REST APIs", "Authentication systems"] },
  { title: "Databases", detail: "Structured data and query-driven application logic.", skills: ["PostgreSQL", "SQLite", "MongoDB"] },
  { title: "Artificial intelligence", detail: "AI applications, agents, and intelligent automation.", skills: ["AI chatbots", "AI agents", "Prompt engineering", "Automation systems", "Groq", "Gemini AI", "LLM applications", "Python", "Machine learning", "OCR & document processing"] },
  { title: "Programming", detail: "Language fundamentals and software design.", skills: ["C++", "Object-oriented programming"] },
  { title: "Tools", detail: "Version control, containers, and deployment.", skills: ["Git", "GitHub", "Docker", "Vercel"] },
  { title: "Product & business", detail: "Applied services and product work across digital platforms.", skills: ["Meta account recovery", "Data recovery", "Digital marketing", "SEO", "Cybersecurity", "IT consulting", "Custom software development"] },
];

export const services = [
  { title: "Full-Stack Web Development", description: "Modern web applications using React, Next.js, Node.js, and scalable databases.", outcome: "A responsive product with connected interface, server logic, data persistence, and a deployment-ready foundation.", technologies: ["React", "Next.js", "Node.js", "PostgreSQL"] },
  { title: "AI Chatbot Development", description: "Intelligent conversational systems powered by modern AI models.", outcome: "A focused conversational experience built around a clear user task and an integrated AI model.", technologies: ["Python", "Groq", "Gemini AI", "LLM applications"] },
  { title: "AI Agents & Automation", description: "Workflow automation and business productivity solutions.", outcome: "Connected steps that reduce repetitive work and bring AI into a practical workflow.", technologies: ["Python", "AI agents", "Prompt engineering", "Automation systems"] },
  { title: "API Development", description: "Secure backend systems and scalable integrations.", outcome: "Well-structured REST endpoints that let application interfaces and services exchange data reliably.", technologies: ["Node.js", "Express.js", "REST APIs", "Authentication systems"] },
  { title: "Database Design", description: "Reliable and efficient database architecture.", outcome: "A data model and persistence layer shaped around the product’s records and relationships.", technologies: ["PostgreSQL", "SQLite", "MongoDB"] },
];

export const certifications = [
  ["Google", "AI for Brainstorming and Planning", "July 2026", "4JJH8JUOZ0LY"],
  ["Google", "AI Fundamentals", "July 2026", "EJP04KP2716M"],
  ["Google", "Start Writing Prompts like a Pro", "July 2026", "MNZ8O5S1Z8FI"],
  ["UniAthena", "Basics of Artificial Intelligence", "May 2026", "2293-5811-0890"],
  ["UniAthena", "Basics of Digital Marketing", "May 2026", "6997-2244-6549"],
  ["UniAthena", "Basics of Machine Learning Algorithms", "May 2026", "8901-6364-0924"],
  ["UniAthena", "Basics of Python", "May 2026", "7194-5445-9686"],
  ["Udemy", "Building AI Projects: Master Machine Learning & Deep Learning", "May 2026", "146b7e5b-efd3-4e97-b779-d38ed03bca2a"],
  ["Udemy", "Python for Beginners", "May 2026", "4e763f3b-7333-4ee5-ad3d-d9850caa3c19"],
  ["Udemy", "Python Powerhouse: Gen AI", "May 2026", "UC-f46b7e5b-efd3-4e97-b779-d38ed03bca2a"],
];

export const achievements = [
  { title: "Prime Minister Youth Laptop Scheme Recipient", detail: "Selected for a national technology access program supporting high-performing students." },
  { title: "PEEF Scholarship Recipient", detail: "Awarded for academic merit through the Punjab Educational Endowment Fund." },
  { title: "Strong Academic Performance", detail: "Matric 93%, Intermediate 89%, BISE Multan 3rd position, and academic distinction." },
  { title: "Artificial Intelligence Student", detail: "Building production software while studying AI at Bahauddin Zakariya University." },
  { title: "Competitive Sports Participation", detail: "Provincial and national-level sports experience that sharpened discipline and teamwork." },
  { title: "Volunteer Community Service", detail: "Hands-on flood relief support and community service in Pakistan." },
];

export const links = {
  email: "sajjadhaider1016@gmail.com",
  github: `${github}/SAJJAD-portfolio`,
  githubProfile: github,
  linkedin: "https://linkedin.com/in/sajjadhaider56/",
  whatsapp: "https://wa.me/923337379195",
};
