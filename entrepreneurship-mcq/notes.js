(function () {
  const NOTES = [
    {
      id: "n1",
      title: "1. What is Entrepreneurship?",
      body: [
        "Entrepreneurship is the process of identifying opportunities, organizing resources, and starting a business while taking calculated risks to create value and earn profit.",
        "Entrepreneurs combine innovation, leadership, and risk-taking to develop products or services that meet market needs and contribute to economic development.",
      ],
    },
    {
      id: "n2",
      title: "2. Characteristics of an Entrepreneur",
      body: [
        "Entrepreneurs possess several important qualities that help them succeed in business.",
      ],
      bullets: [
        "Innovation – ability to create new ideas or improve existing products",
        "Risk-taking – willingness to take calculated risks",
        "Leadership – ability to guide and motivate people",
        "Vision – clear long-term goals and direction",
        "Adaptability – ability to adjust to market changes",
        "Persistence – determination to overcome challenges",
      ],
      footer:
        "These characteristics help entrepreneurs identify opportunities and manage businesses successfully.",
    },
    {
      id: "n3",
      title: "3. 7-M Resources in Entrepreneurship",
      body: [
        "Entrepreneurs require key resources known as the 7-M resources to operate and grow a business.",
      ],
      bullets: [
        "Money – capital required for starting and operating the business",
        "Manpower – skilled employees and workforce",
        "Materials – raw materials used in production",
        "Machinery – tools and equipment required for operations",
        "Methods – processes and techniques used in production",
        "Markets – customers and demand for products or services",
        "Mentorship – guidance and support from experienced experts",
      ],
      footer: "Proper management of these resources ensures efficient business operations.",
    },
    {
      id: "n4",
      title: "4. Business Plan",
      body: [
        "A Business Plan is a written document that explains a business idea, how the business will operate, and how it will generate profit.",
        "It acts as a roadmap for starting and managing a business.",
      ],
      bullets: [
        "Helps in planning business operations",
        "Provides clarity of goals and strategies",
        "Helps attract investors and funding",
        "Assists in decision-making and management",
      ],
    },
    {
      id: "n5",
      title: "5. Characteristics of a Good Business Idea",
      body: ["A good business idea should have certain features to be successful."],
      bullets: [
        "Solves real problems faced by customers",
        "Practical and feasible to implement",
        "Has market demand for the product or service",
        "Provides competitive advantage",
        "Affordable and profitable",
        "Scalable and sustainable",
      ],
      footer: "A strong business idea increases the chances of business success.",
    },
    {
      id: "n6",
      title: "6. Market Research",
      body: [
        "Market research is the process of collecting and analyzing information about customers, competitors, and market conditions.",
        "It helps businesses understand customer needs and make better business decisions.",
      ],
      bullets: [
        "Understand customer preferences",
        "Reduce business risks",
        "Identify market opportunities",
        "Improve product development",
      ],
    },
    {
      id: "n7",
      title: "7. Market Research Process",
      body: ["Steps in market research:"],
      bullets: [
        "Define the problem",
        "Prepare questionnaire",
        "Sampling (select respondents)",
        "Data collection",
        "Data analysis",
        "Interpretation and conclusion",
      ],
      footer: "This process helps businesses make informed decisions.",
    },
    {
      id: "n8",
      title: "8. Marketing Mix (4Ps)",
      body: [
        "The Marketing Mix refers to the key elements used by businesses to market their products effectively.",
        "The 4Ps of Marketing are:",
      ],
      bullets: [
        "Product – the goods or services offered to customers",
        "Price – the amount customers pay for the product",
        "Place – distribution channels through which the product reaches customers",
        "Promotion – advertising and marketing activities to attract customers",
      ],
      footer: "These elements help businesses reach the right customers and increase sales.",
    },
    {
      id: "n9",
      title: "9. SWOT Analysis",
      body: ["SWOT Analysis is a strategic tool used to evaluate a business’s internal and external environment."],
      bullets: [
        "Strengths – internal advantages of the business",
        "Weaknesses – internal limitations or problems",
        "Opportunities – external chances for growth",
        "Threats – external risks or competition",
      ],
      footer: "SWOT analysis helps businesses plan strategies and improve decision-making.",
    },
    {
      id: "n10",
      title: "10. Innovation",
      body: ["Innovation means creating new products, services, or processes or improving existing ones."],
      bullets: [
        "Provides competitive advantage",
        "Improves productivity",
        "Enhances customer satisfaction",
        "Supports business growth",
      ],
      footer: "Innovation helps businesses stay relevant in changing markets.",
    },
  ];

  const IMPORTANT_QUESTIONS = [
    {
      unit: "Unit 1",
      items: [
        "Define entrepreneurship. Explain its role in economic development.",
        "List and explain the key characteristics of an entrepreneur with examples.",
        "Differentiate entrepreneur vs manager (any 5 points).",
        "Explain types of entrepreneurship: social, lifestyle, green, franchise, scalable startup.",
        "What is opportunity recognition? Explain the steps/approach with an example.",
        "Explain the 7-M resources and their importance in a startup.",
        "Write short notes on: Startup India, Stand-Up India, SSIP Gujarat, MSME classification.",
        "Compare business structures: sole proprietorship, partnership, LLP, corporation (liability + ownership).",
      ],
    },
    {
      unit: "Unit 2",
      items: [
        "What is idea generation and idea screening? Explain the process.",
        "Explain Business Model Canvas (9 blocks) with a simple example.",
        "Define market research. Differentiate primary vs secondary research.",
        "Explain the market research process (steps) and importance of sampling.",
        "Explain Marketing Mix (4Ps) with an example product.",
        "What is market segmentation and target market? Give examples.",
        "Define SWOT analysis and show how it helps in startup planning.",
        "Explain prototype and prototype testing; how it reduces risk.",
      ],
    },
    {
      unit: "Unit 3",
      items: [
        "Define management. Explain functions: planning, organizing, staffing, directing, controlling.",
        "Differentiate management vs administration.",
        "Explain types of organizational structures: line, functional, line & staff, matrix.",
        "Explain leadership styles: autocratic, democratic, laissez-faire; and transactional vs transformational.",
        "Explain communication flow: upward, downward, horizontal (with examples).",
        "Write short notes on recruitment, selection, training, motivation.",
        "Explain budgeting and basic financial terms: equity shares and debentures.",
      ],
    },
    {
      unit: "Unit 4",
      items: [
        "What is incubation? Explain how incubators support startups (space, mentoring, networking).",
        "Differentiate incubators vs accelerators (purpose, duration, selection, funding).",
        "Explain types of incubators: academic, corporate, virtual, social (and examples).",
        "Write short notes on support agencies/schemes: DIC, GIDC, GSFC, CLCSS, SIDO, NEDB.",
        "Define IPR. Differentiate patent, trademark, copyright, design patent, plant patent.",
        "Explain trademark validity and patent duration; why they matter for startups.",
        "Explain contracts and why agreements with minors are invalid.",
        "What is ESG reporting? Why is it important today?",
      ],
    },
    {
      unit: "Unit 5",
      items: [
        "What is a project proposal/report? Explain its main sections.",
        "Explain feasibility study types: technical, economic, legal, operational.",
        "Explain break-even point (BEP) and contribution with formula and example.",
        "Define ROI and ROS; explain how they measure performance.",
        "Explain CSR and business ethics; why bribery is unethical.",
        "Write short notes on EXIM policy and export incentives.",
        "Explain exit strategies: succession planning, harvesting strategy, bankruptcy protection.",
      ],
    },
  ];

  window.MCQ_NOTES = { notes: NOTES, importantQuestions: IMPORTANT_QUESTIONS };
})();

