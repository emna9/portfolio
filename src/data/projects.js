export const projects = [
  {
    id: "smart-matching-platform",
    title: "Smart Matching Platform",
    category: "AI Matching / Product Engineering",
    shortDescription: "A Top 3 matching engine built with Gemini and CatBoost, delivered with a team of 5 using Agile and Scrum.",
    tags: ["Gemini", "CatBoost", "React", "Node.js"],
    image: "textures/gallery/proj-smart-matching.webp",
    url: "https://github.com/yousefsassy/Smart-Matching-app",
    caseStudy: {
      overview: "A matching platform that turns user and business needs into a working product: a Top 3 ranking engine based on Gemini and CatBoost, with 6+ structured attributes, 3 user roles and 10+ features.",
      challenge: "Translate user and business needs into functional requirements and product features, then define and prioritize requirements and use cases with a team of 5.",
      approach: "Ran the discovery phase, defined and prioritized requirements and use cases with Agile and Scrum, and designed a Top 3 ranking engine based on Gemini and CatBoost that extracts 6+ structured attributes to automate matching.",
      solution: "Developed a platform with 10+ features and 3 roles, aligning the technical implementation with the identified user and business needs.",
      technologies: ["Gemini", "CatBoost", "React", "Node.js", "Agile", "Scrum"],
      keyFeatures: [
        "Top 3 ranking engine based on Gemini and CatBoost",
        "6+ structured attributes extracted to automate matching",
        "10+ platform features across 3 user roles",
        "Requirements and use cases prioritized with a team of 5"
      ],
      outcome: "1st Place — Senior Student Project Competition, MedTech–SMU (2026).",
      results: "1st Place — Senior Student Project Competition, MedTech–SMU (2026)."
    }
  },
  {
    id: "software-requirements-quality-grader",
    title: "Software Requirements Quality Grader",
    category: "LLM Evaluation / Prompt Engineering",
    shortDescription: "An LLM-as-a-Judge pipeline that scores software requirements against five quality criteria, with bias and reliability checks.",
    tags: ["Python", "LLM", "Prompt Engineering"],
    image: "textures/gallery/proj-req-grader.webp",
    url: "https://github.com/turkiasma/Requirement-quality-grader",
    stack: ["Python", "LLM", "Prompt Engineering"],
    skills: ["LLM-as-a-Judge", "Evaluation Framework", "Bias Testing", "Cost & Agreement Metrics"],
    caseStudy: {
      overview: "A requirements-quality evaluation pipeline that uses an LLM-as-a-Judge to grade software requirements against five quality criteria, then measures how reliable those judgments are.",
      challenge: "Evaluate requirement quality consistently at scale while checking whether the judging model itself is biased by position, verbosity or model choice.",
      approach: "Built a structured evaluation framework and a dataset of 150 requirements, scored each one from 0 to 5 across five criteria, and compared the outputs of two models. Added position and verbosity bias tests, plus agreement, error and cost metrics.",
      solution: "A reproducible LLM-as-a-Judge pipeline with bias checks and reliability metrics that makes requirement reviews faster and easier to trust.",
      technologies: ["Python", "LLM", "Prompt Engineering", "Evaluation", "Data Analysis"],
      keyFeatures: [
        "LLM-as-a-Judge scoring across five quality criteria",
        "Dataset of 150 software requirements",
        "Comparison of two model outputs",
        "Position and verbosity bias tests",
        "Agreement, error and cost metrics"
      ],
      outcome: "Delivered a structured requirements evaluation framework with measurable reliability checks.",
      results: "A reusable evaluation pipeline with 150 requirements and bias-aware scoring."
    }
  },
  {
    id: "researchlens",
    title: "ResearchLens",
    category: "RAG / Information Retrieval",
    shortDescription: "A RAG research assistant combining BM25 and BGE embeddings with Reciprocal Rank Fusion and source-grounded answers.",
    tags: ["Python", "BM25", "BGE", "LLM"],
    image: "textures/gallery/proj-researchlens.webp",
    url: "https://github.com/yousefsassy/ResearchLens",
    stack: ["Python", "BM25", "BGE", "RAG"],
    skills: ["Hybrid Retrieval", "Reciprocal Rank Fusion", "Citation Verification", "Abstention"],
    caseStudy: {
      overview: "ResearchLens is a research assistant that retrieves passages from scientific publications with hybrid search and answers only when the retrieved evidence supports the answer.",
      challenge: "Help researchers find relevant passages across scientific literature while keeping answers grounded, cited and honest about missing evidence.",
      approach: "Combined BM25 lexical retrieval with BGE semantic embeddings and merged both result sets using Reciprocal Rank Fusion. Generated answers from the selected passages, verified citations and added an abstention path when the evidence was insufficient.",
      solution: "A hybrid RAG pipeline that returns source-grounded answers with citations and declines to answer when the retrieved context is too weak.",
      technologies: ["Python", "BM25", "BGE Embeddings", "RAG", "RRF", "LLM"],
      keyFeatures: [
        "Hybrid lexical and semantic retrieval",
        "BGE embeddings for semantic search",
        "Reciprocal Rank Fusion to merge ranked passages",
        "Source-grounded answer generation",
        "Citation verification and abstention"
      ],
      outcome: "Delivered a research assistant that answers with citations and abstains when evidence is insufficient.",
      results: "Hybrid retrieval, RRF ranking and grounded, citation-checked answers."
    }
  },
  {
    id: "ai-ecommerce-platform",
    title: "AI-Powered E-Commerce Platform",
    category: "Full Stack / LLM Agents",
    shortDescription: "A full-stack ecommerce platform with multi-role management, JWT auth and a LangGraph product recommendation assistant.",
    tags: ["React.js", "Express.js", "MongoDB", "LangGraph"],
    image: "textures/gallery/proj-ai-ecommerce.webp",
    url: "https://github.com/emna9/web",
    caseStudy: {
      overview: "A full-stack ecommerce platform combining multi-role management, REST APIs and JWT authentication with an LLM-powered assistant for product recommendations.",
      challenge: "Build a complete ecommerce platform with secure multi-role access and an assistant that can recommend products using real product and review data.",
      approach: "Developed the platform with React.js, Node.js, Express.js and MongoDB, including REST APIs and JWT authentication. Designed an LLM-powered assistant using LangGraph agents and multi-step workflows. Built data pipelines for document parsing and unstructured data extraction from product descriptions and customer reviews.",
      solution: "Integrated multi-role management, REST APIs, JWT authentication and the LangGraph recommendation assistant into a single platform.",
      technologies: ["React.js", "Node.js", "Express.js", "MongoDB", "LangGraph", "JWT"],
      keyFeatures: [
        "Multi-role management with JWT authentication",
        "REST APIs for the storefront and admin flows",
        "LangGraph agents and multi-step workflows for recommendations",
        "Data pipelines for parsing product descriptions and customer reviews"
      ],
      outcome: "Delivered a full-stack ecommerce platform with a LangGraph recommendation assistant.",
      results: "Full-stack platform with multi-role management and an AI recommendation assistant."
    }
  },
  {
    id: "mental-health-risk-prediction",
    title: "Mental Health Risk Prediction",
    category: "Machine Learning / Data",
    shortDescription: "A complete ML pipeline with data preparation, feature engineering, 4 evaluated models and an interactive results dashboard.",
    tags: ["Python", "Scikit-learn", "Data Analysis"],
    image: "textures/gallery/proj-mental-health.webp",
    caseStudy: {
      overview: "A complete machine learning pipeline covering data preparation, exploratory analysis, feature engineering and evaluation, with an interactive dashboard for interpreting the results.",
      challenge: "Build an end-to-end ML pipeline and make model performance understandable to non-technical readers.",
      approach: "Prepared the data, ran exploratory analysis, engineered features and evaluated 4 models using Accuracy, Precision, Recall and F1-score.",
      solution: "Compared model performance, adjusted the decision threshold, and created an interactive dashboard to facilitate result interpretation.",
      technologies: ["Python", "Scikit-learn", "Pandas", "Data Analysis"],
      keyFeatures: [
        "Data preparation and exploratory analysis",
        "Feature engineering for the prediction task",
        "Evaluation of 4 models with Accuracy, Precision, Recall and F1-score",
        "Interactive dashboard for interpreting the results"
      ],
      performance: "Evaluated 4 models using Accuracy, Precision, Recall and F1-score.",
      outcome: "Delivered an end-to-end ML pipeline with an interactive results dashboard.",
      results: "End-to-end ML pipeline with model comparison and an interactive dashboard."
    }
  }
];
