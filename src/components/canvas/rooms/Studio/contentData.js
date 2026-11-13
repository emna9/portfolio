/**
 * Studio Content Data
 * 
 * Custom content for Emna's interactive monitor towers.
 */

export const PLATFORM_CONFIG = {
    youtube: {
        color: '#00D9FF',
        accentColor: '#5BE7FF',
        icon: '▶',
        label: 'Experience',
        shape: 'tv', // Wide CRT style
    },
    blog: {
        color: '#5BE7FF',
        accentColor: '#00D9FF',
        icon: '📝',
        label: 'Case Study',
        shape: 'monitor', // Thin desktop monitor
    },
    tiktok: {
        color: '#00D9FF',
        accentColor: '#5BE7FF',
        icon: '📱',
        label: 'Micro Motion',
        shape: 'phone', // Vertical phone
    },
    linkedin: {
        color: '#00D9FF',
        accentColor: '#5BE7FF',
        icon: 'in',
        label: 'Milestone',
        shape: 'monitor',
    },
    codrops: {
        color: '#00D9FF',
        accentColor: '#5BE7FF',
        icon: '💧',
        label: 'Experience',
        shape: 'monitor',
    },
};

const RAW_CONTENT_DATA = [
    // ============ Experience / Internships ============
    {
        id: 'studio-dar-blockchain',
        platform: 'blog',
        title: 'Dar Blockchain — Backend & AI Optimization Intern',
        description: 'Scraped, structured and prepared data on 800+ hackathons to feed AI analysis workflows. Tested and validated AI workflows and REST APIs on real data, evaluated 8 AI analysis layers on 5 real submissions, and benchmarked LLM models by output quality, latency, cost and reliability.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/emna-smaali-8855a7258',
        date: '2026-08-01',
        readTime: 'Jul – Aug 2026',
    },
    {
        id: 'studio-smu',
        platform: 'linkedin',
        title: 'South Mediterranean University — Communication & Business Assistant',
        description: 'Designed a Power BI dashboard comparing 4 private universities using 2 datasets and 4 Instagram KPIs. Analyzed data, identified relevant practices, and formulated data-driven recommendations for communication and recruitment strategies.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/emna-smaali-8855a7258',
        date: '2026-07-01',
        readTime: 'Jun – Jul 2026',
    },
    {
        id: 'studio-comar',
        platform: 'youtube',
        title: 'COMAR Assurances — AI Development Intern',
        description: 'Designed and prototyped an AI insurance assistant using the Mistral API, LLMs, NLP and RAG across 7 insurance product categories. Built a Python data pipeline producing 249 content chunks, then implemented hybrid retrieval with FAISS, BM25 and metadata filtering.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/emna-smaali-8855a7258',
        date: '2025-08-01',
        readTime: 'Jul – Aug 2025',
    },
    {
        id: 'studio-forvia',
        platform: 'codrops',
        title: 'Forvia Informatique Tunisie — API Security & SAP Integration Intern',
        description: 'Configured a Layer7 API gateway to secure and standardize data exchanges through 5+ policies: authentication, OAuth2, SSL/TLS, rate limiting and routing. Tested and validated APIs and integration workflows with Postman, checking reliability and identifying anomalies.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/emna-smaali-8855a7258',
        date: '2025-07-15',
        readTime: 'Jul – Aug 2025',
    },
    {
        id: 'studio-dracode',
        platform: 'blog',
        title: 'Dracode — Full Stack Development Intern',
        description: 'Analyzed requirements and designed the software architecture, use cases, data models and sequence diagrams. Developed a web application with Vue.js, Nuxt.js, Node.js, TypeScript and PostgreSQL, including REST APIs, authentication and 10+ administrative interfaces.',
        thumbnail: null,
        url: 'https://www.linkedin.com/in/emna-smaali-8855a7258',
        date: '2024-08-01',
        readTime: 'Jul – Aug 2024',
    },

    // ============ Selected Projects ============
    {
        id: 'studio-smart-matching',
        platform: 'blog',
        title: 'Smart Matching Platform — Gemini & CatBoost Ranking',
        description: 'A Top 3 ranking engine built with Gemini and CatBoost that extracts 6+ structured attributes to automate matching. The platform has 10+ features and 3 roles, delivered with a team of 5 using Agile and Scrum. 1st Place at the MedTech–SMU Senior Student Project Competition 2026.',
        thumbnail: null,
        url: 'https://github.com/emna9',
        date: '2026-06-01',
        readTime: 'Case study',
    },
    {
        id: 'studio-ai-ecommerce',
        platform: 'blog',
        title: 'AI-Powered Ecommerce — LangGraph Product Assistant',
        description: 'A full-stack ecommerce platform with multi-role management, REST APIs and JWT authentication. Designed an LLM-powered assistant for product recommendations using LangGraph agents and multi-step workflows, with data pipelines for document parsing and unstructured data extraction.',
        thumbnail: null,
        url: 'https://github.com/emna9',
        date: '2026-03-01',
        readTime: 'Case study',
    },
    {
        id: 'studio-mental-health',
        platform: 'blog',
        title: 'Mental Health Risk Prediction — End-to-End ML Pipeline',
        description: 'A complete machine learning pipeline covering data preparation, exploratory analysis, feature engineering and evaluation of 4 models using Accuracy, Precision, Recall and F1-score. Compared model performance, adjusted the decision threshold and built an interactive dashboard for interpretation.',
        thumbnail: null,
        url: 'https://github.com/emna9',
        date: '2025-12-01',
        readTime: 'Case study',
    },
];

const ytTextures = ['textures/studio/tvfront_filmikprojektdlamultiego.webp', 'textures/studio/tvfront_filmikedytowaniezdjec.webp'];
const ytPaintedTextures = ['textures/studio/tvfront_filmikprojektdlamultiego_painted.webp', 'textures/studio/tvfront_filmikedytowaniezdjec_painted.webp'];
const blogTextures = ['textures/studio/monitorfront_postnafbdoublewinner.webp'];
const blogPaintedTextures = ['textures/studio/monitorfront_postnafbdoublewinner_painted.webp'];
const ttTextures = ['textures/studio/phonefront_followmeontiktok.webp'];
const ttPaintedTextures = ['textures/studio/phonefront_followmeontiktok_painted.webp'];

let ytIdx = 0, blogIdx = 0, ttIdx = 0;
let ytPIdx = 0, blogPIdx = 0, ttPIdx = 0;

export const CONTENT_DATA = RAW_CONTENT_DATA.map((item) => {
    return {
        ...item,
        frontTexture: item.frontTexture || (
            item.platform === 'youtube' ? ytTextures[ytIdx++ % ytTextures.length] :
                item.platform === 'tiktok' ? ttTextures[ttIdx++ % ttTextures.length] :
                    blogTextures[blogIdx++ % blogTextures.length]
        ),
        paintedFrontTexture: item.paintedFrontTexture || (
            item.platform === 'youtube' ? ytPaintedTextures[ytPIdx++ % ytPaintedTextures.length] :
                item.platform === 'tiktok' ? ttPaintedTextures[ttPIdx++ % ttPaintedTextures.length] :
                    blogPaintedTextures[blogPIdx++ % blogPaintedTextures.length]
        )
    };
});

export const getContentByPlatform = (platform) => {
    if (platform === 'all') return CONTENT_DATA;
    return CONTENT_DATA.filter(item => item.platform === platform);
};

export const getLatestContent = () => {
    return [...CONTENT_DATA].sort((a, b) => new Date(b.date) - new Date(a.date))[0];
};
