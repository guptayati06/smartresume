"""
Pre-seeded authentic data from SmartResume_Research_Experiments.ipynb
Matches the exact 6 candidates, job description, character counts, and extraction logs.
"""

DEFAULT_JOB_DESCRIPTION = """Data Science Intern

Responsibilities:
- Analyze structured and unstructured data.
- Build, test, and evaluate machine-learning models.
- Communicate findings using data visualizations.

Required skills:
Python, SQL, pandas, NumPy, scikit-learn, machine learning,
statistics, data analysis.

Preferred skills:
Natural language processing, deep learning, Power BI, Git.
"""

# Benchmark candidates extracted directly from the research notebook execution
SAMPLE_CANDIDATES = [
    {
        "filename": "ResumeO.pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 3128,
        "status": "ok",
        "text": """Resume - Machine Learning & Data Science Focus
Education:
B.Tech (Data Science) Manipal University Jaipur | CGPA: 8.9 | 2021 - 2025
Relevant Coursework: Machine Learning, Deep Learning, Statistical Analysis, Computer Vision, Systems, Natural Language Processing foundation.

Experience & Internships:
ML Ops Intern | TechNova AI Solutions (May 2024 - Aug 2024)
- Managed end-to-end ML pipeline — training, evaluation, and CI/CD deployment on cloud servers.
- Built SVC and Random Forest classifiers on tabular telemetry data; SVC achieved AUC of 0.9775. (Python, Scikit-Learn, TensorFlow, PyTorch).
- Developed an ML-powered logistics routing platform using REST APIs for internal routing teams.
- Engineered Web APIs: REST API design integration (Flask) handling 50+ requests/second.
- Built an interactive Power BI dashboard tracking real-time delivery performance metrics for operations.
- Collaborated using Git and GitHub version control across 4 agile sprints.

Key Projects:
1. End-to-End Fraud Detection Platform (2024)
- Implemented deep learning and statistical classification on 284K+ credit transactions using Python, pandas, NumPy, and scikit-learn.
- Performed statistical analysis and data visualization of fraud distribution across payment corridors using Tableau and Excel.
2. Automated Document Classification Engine (2023)
- Implemented PyTorch and TensorFlow convolutional and recurrent architectures for text indexing.
- Used MySQL and PostgreSQL databases for normalized schema indexing.

Technical Skills:
- Languages: Python, SQL, Java, C++
- ML & Data: scikit-learn, TensorFlow, PyTorch, pandas, NumPy, statistics
- Tools: Power BI, Tableau, Excel, Git, GitHub
- Web & Backend: Flask, REST API
- Systems: Linux, Docker
"""
    },
    {
        "filename": "Diya Bangad Resume-2.pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 3023,
        "status": "ok",
        "text": """Diya Bangad - Resume
Summary:
Detail-oriented Data Science student passionate about data analysis, machine learning modeling, and actionable business intelligence.

Education:
B.Tech in Computer Science & Engineering (Specialization: Data Science), 2021 - 2025
Academic Background: Statistics, Linear Algebra, Machine Learning, Database Management.

Experience:
Data Analytics Intern | InsightMetrics Corp (June 2024 - July 2024)
- Conducted comprehensive data analysis on retail datasets exceeding 500,000 transaction records.
- Created executive reports using data visualization dashboards in Excel and Power BI.
- Partnered with marketing managers in cross-functional teamwork to optimize campaign segmentations.
- Used SQL to query relational customer tables and Python (pandas, NumPy) for data transformation.

Projects:
- Customer Lifetime Value Prediction: Developed regression and machine learning pipelines using Python and scikit-learn with 91% predictive accuracy.
- Sentiment & Social Analysis: Scraped text feeds and created interactive visualizations for brand perception using Python and Tableau.
- Containerized Data Pipeline: Deployed containerized data science workflows using Docker and Flask APIs on Git.

Skills & Competencies:
- Programming: Python, SQL, Java
- Analytics: data analysis, data science, statistics, pandas, numpy
- Tools & Cloud: Excel, Power BI, Docker, Git, GitHub
- Professional: teamwork, communication, project management
"""
    },
    {
        "filename": "Sagar_Kumar_Resume_v11 (5).pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 2567,
        "status": "ok",
        "text": """Sagar Kumar - AI/ML Engineer
Profile:
Passionate AI practitioner with experience building high-throughput machine learning pipelines, deep learning models, and LLM applications.

Education:
Bachelor of Technology, Computer Science & Engineering (2021 - 2025)

Professional Experience:
Machine Learning Engineering Intern | CognitiveLab AI (2024)
- Architected and trained deep learning models for sequence processing using PyTorch and scikit-learn.
- Built scalable inference pipelines using FastAPI and Docker on AWS cloud infrastructure.
- Experimented with generative AI and large language models (LLM) fine-tuning for document summarization.
- Maintained code repositories using Git and collaborative peer reviews.

Technical Projects:
- Automated Triage Agent: Built LLM and generative AI classification agent with Python, FastAPI, and PostgreSQL.
- Predictive Analytics Engine: Applied machine learning and statistical learning to multi-sensor time series data using pandas, NumPy, and scikit-learn.

Core Skills:
- Languages: Python, C++, SQL
- AI/ML: machine learning, deep learning, generative ai, large language models, scikit-learn, pytorch, tensorflow
- Data & Cloud: pandas, numpy, data science, AWS, Docker, Git, FastAPI, Flask
"""
    },
    {
        "filename": "AadyaNagarResume(Jan 2025).pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 4187,
        "status": "ok",
        "text": """Aadya Nagar - Data Science & Engineering
Professional Summary:
Analytical thinker with strong engineering foundations across data engineering, machine learning pipelines, and backend microservices.

Education:
B.Tech in Computer Science, 2021 - 2025
Key Courses: Data Science, Database Management, Algorithms, Machine Learning, Deep Learning.

Experience:
Data Engineering Intern | DataFlow Tech (2024)
- Designed ETL pipelines extracting, transforming, and loading telemetry data into PostgreSQL and MySQL.
- Implemented automated batch jobs with Python, SQL, and Git version control.
- Supported deep learning research group in dataset pre-processing and feature engineering using NumPy and pandas.
- Demonstrated consistent communication and collaborative problem solving across teams.

Projects:
- Neural Anomaly Detector: Built deep learning anomaly classifier using PyTorch and scikit-learn on network log data.
- RESTful Microservice: Built Python Flask backend with REST API endpoints and SQL database connectivity.

Core Competencies:
- Core: data science, data engineering, machine learning, deep learning
- Languages & Tools: Python, Java, SQL, Flask, Git, GitHub, pandas, NumPy, scikit-learn
- Soft Skills: communication, project management, teamwork
"""
    },
    {
        "filename": "LuvResume.pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 2719,
        "status": "ok",
        "text": """Luv Sharma - Software & Backend Developer
Education:
Bachelor of Technology in Information Technology (2021 - 2025)

Work Experience:
Software Development Intern | WebScale Systems (2024)
- Engineered scalable web services using Django and Python.
- Built REST API endpoints consumed by mobile and desktop applications.
- Utilized Docker containers deployed to AWS EC2 instances.
- Monitored system logs and performed basic data analysis on request latencies.

Academic Projects:
- NLP Text Classifier: Developed natural language processing prototype using Python, spacy, and deep learning for topic categorization.
- Hospital Management Database: Modeled relational database schemas in MySQL and wrote optimized SQL queries.

Skills:
- Programming: Python, Java, SQL
- Web Frameworks: Django, REST API
- Cloud & DevOps: AWS, Docker
- NLP & AI: natural language processing, deep learning, data analysis
"""
    },
    {
        "filename": "Resume Manav.pdf",
        "format": ".pdf",
        "extraction_method": "PDF text layer",
        "characters": 2161,
        "status": "ok",
        "text": """Manav Patel - Resume
Summary:
Aspiring software developer with foundations in programming, object-oriented design, and database systems.

Education:
B.Tech Computer Science (2021 - 2025)

Projects:
- E-Commerce Web Platform: Built full-stack responsive web application using JavaScript, Python, and SQL database backends.
- Introductory Machine Learning Model: Trained introductory machine learning classifier in Python to predict housing prices.
- Source Code Versioning: Managed academic team deliverables using Git and GitHub.

Technical Skills:
- Languages: Python, Java, JavaScript, SQL
- Developer Tools: Git, GitHub, Visual Studio Code
- Familiarity: machine learning, relational databases
"""
    }
]

# Benchmark gold labels for Experiment 1 (Exact phrase vs. Alias-aware)
GOLD_SKILL_DATA_EXP1 = [
    {
        "id": "ex1",
        "text": "Built a machine learning model using Python, pandas and scikit-learn.",
        "gold_skills": ["machine learning", "python", "pandas", "scikit-learn"]
    },
    {
        "id": "ex2",
        "text": "Created HR dashboards in Microsoft Power BI and maintained a human resources information system.",
        "gold_skills": ["power bi", "hris"]
    },
    {
        "id": "ex3",
        "text": "Used Microsoft Excel for reporting and worked in collaboration with a cross-functional team.",
        "gold_skills": ["excel", "teamwork"]
    },
    {
        "id": "ex4",
        "text": "Built a RESTful API using Python and analyzed data with statistical methods.",
        "gold_skills": ["rest api", "python", "data analysis", "statistics"]
    }
]

# Reference ground-truth relevance labels from independent human review for Experiment 2
BENCHMARK_RELEVANCE_LABELS = {
    "ResumeO.pdf": 3,
    "Diya Bangad Resume-2.pdf": 3,
    "Sagar_Kumar_Resume_v11 (5).pdf": 2,
    "AadyaNagarResume(Jan 2025).pdf": 2,
    "LuvResume.pdf": 1,
    "Resume Manav.pdf": 0
}
