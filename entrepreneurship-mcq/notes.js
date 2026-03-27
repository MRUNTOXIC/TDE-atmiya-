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

  const TEACHER_12 = [
    {
      id: "t1",
      title: "1. Characteristics and Functions of Entrepreneurship",
      sections: [
        {
          heading: "Characteristics",
          bullets: [
            "Innovation – creating new ideas or improving products",
            "Risk-taking – willingness to take calculated risks",
            "Vision – ability to plan long-term goals",
            "Leadership – guiding and motivating people",
            "Persistence – determination to overcome challenges",
            "Adaptability – ability to adjust to market changes",
          ],
        },
        {
          heading: "Functions",
          bullets: [
            "Identifying business opportunities",
            "Organizing resources like capital and labor",
            "Taking business risks",
            "Innovation and product development",
            "Creating employment opportunities",
            "Contributing to economic growth",
          ],
        },
      ],
    },
    {
      id: "t2",
      title: "2. 7-M Resources",
      intro: "Entrepreneurs require important resources known as 7-M resources to run and grow a business.",
      bullets: [
        "Money – capital required to start and operate a business",
        "Manpower – skilled employees and workforce",
        "Materials – raw materials needed for production",
        "Machinery – equipment and tools used in production",
        "Methods – processes and techniques used in operations",
        "Markets – customers and demand for products",
        "Mentorship – guidance from experienced experts",
      ],
      footer: "Proper management of these resources ensures efficient business operations.",
    },
    {
      id: "t3",
      title: "3. Market Research Process",
      intro: "Market research is the process of collecting and analyzing information about customers and the market.",
      bullets: [
        "Define the problem – identify the purpose of research",
        "Prepare questionnaire – design questions for customers",
        "Sampling – select a group of people for research",
        "Data collection – gather information through surveys or interviews",
        "Data analysis – examine the collected information",
        "Interpretation and conclusion – derive meaningful insights for decision-making",
      ],
    },
    {
      id: "t4",
      title: "4. Marketing Mix (4Ps)",
      intro: "Marketing Mix refers to the strategies used by businesses to promote and sell products effectively.",
      bullets: [
        "Product – the goods or services offered to customers",
        "Price – the amount customers pay for the product",
        "Place – distribution channels used to deliver the product",
        "Promotion – advertising and marketing activities used to attract customers",
      ],
      footer: "The marketing mix helps businesses reach the right customers and increase sales.",
    },
    {
      id: "t5",
      title: "5. Types of Business Ownership",
      intro: "Business ownership refers to the legal structure under which a business operates.",
      bullets: [
        "Sole Proprietorship – owned and managed by one person",
        "Partnership – business owned by two or more partners",
        "Corporation / Company – owned by shareholders and managed by directors",
        "Limited Liability Company (LLC) – combines features of partnership and corporation",
        "Cooperative – owned and operated by members for mutual benefit",
      ],
      footer: "Each structure has different legal responsibilities and liabilities.",
    },
    {
      id: "t6",
      title: "6. Functions of Management",
      intro: "Management involves planning and controlling business activities to achieve organizational goals.",
      bullets: [
        "Planning – setting objectives and deciding strategies",
        "Organizing – arranging resources and tasks",
        "Staffing – recruiting and managing employees",
        "Directing – guiding and motivating employees",
        "Controlling – monitoring performance and making improvements",
      ],
      footer: "These functions help businesses operate efficiently.",
    },
    {
      id: "t7",
      title: "7. Startup Incubation and Types of Incubators",
      intro:
        "Startup incubation is the process of supporting new businesses by providing resources, mentorship, and infrastructure.",
      bullets: [
        "University Incubators – run by educational institutions to support student startups",
        "Corporate Incubators – created by companies to develop innovative ideas",
        "Government Incubators – supported by government programs",
        "Private Incubators – operated by private organizations or investors",
      ],
      footer: "Incubators provide funding guidance, workspace, mentorship, and networking opportunities.",
    },
    {
      id: "t8",
      title: "8. Investor Pitch",
      intro: "An investor pitch is a presentation made by entrepreneurs to attract investors and secure funding.",
      bullets: [
        "Business idea or problem being solved",
        "Product or service offered",
        "Target market and customers",
        "Business model and revenue plan",
        "Competitive advantage",
        "Financial projections and funding needs",
      ],
      footer: "A strong investor pitch increases the chances of obtaining investment.",
    },
    {
      id: "t9",
      title: "9. Intellectual Property Rights (IPR) and Its Importance",
      intro:
        "Intellectual Property Rights (IPR) are legal rights given to creators for their inventions, designs, and creative works.",
      bullets: [
        "Protects innovation and creativity",
        "Encourages research and development",
        "Provides legal ownership of ideas",
        "Helps businesses gain competitive advantage",
        "Enables creators to earn revenue from their inventions",
      ],
    },
    {
      id: "t10",
      title: "10. SIDO / NEDB",
      sections: [
        {
          heading: "SIDO (Small Industries Development Organization)",
          intro: "SIDO supports the development of small-scale industries.",
          bullets: [
            "Provides technical support",
            "Promotes entrepreneurship",
            "Assists small businesses with training and development",
            "Helps improve industrial growth",
          ],
        },
        {
          heading: "NEDB (National Entrepreneurship Development Board)",
          intro: "NEDB promotes entrepreneurship development in the country.",
          bullets: [
            "Encourages entrepreneurial education",
            "Supports startup initiatives",
            "Provides training programs for entrepreneurs",
          ],
        },
      ],
    },
    {
      id: "t11",
      title: "11. Break-Even Point (BEP)",
      body: [
        "The Break-Even Point (BEP) is the level of sales at which total revenue equals total costs.",
        "At this point, the business neither makes profit nor incurs loss.",
      ],
      formula: "Break-Even Point = Fixed Costs ÷ (Selling Price per Unit − Variable Cost per Unit)",
      footer: "Knowing the break-even point helps businesses plan production and pricing strategies.",
    },
    {
      id: "t12",
      title: "12. Bankruptcy and Avoidance",
      sections: [
        {
          heading: "Bankruptcy",
          body: [
            "Bankruptcy is a legal condition where a business or individual is unable to repay debts to creditors.",
            "It occurs when liabilities exceed assets and the business cannot meet financial obligations.",
          ],
        },
        {
          heading: "Bankruptcy Avoidance",
          intro: "Businesses can avoid bankruptcy by:",
          bullets: [
            "Proper financial planning",
            "Controlling costs",
            "Increasing revenue",
            "Managing debts effectively",
            "Seeking financial restructuring or support",
          ],
          footer: "These strategies help businesses maintain financial stability.",
        },
      ],
    },
  ];

  window.MCQ_NOTES = { notes: NOTES, teacher12: TEACHER_12 };
})();
