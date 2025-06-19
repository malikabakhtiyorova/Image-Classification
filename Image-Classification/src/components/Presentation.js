import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiChevronLeft, FiChevronRight, FiPlay, FiPause, FiMonitor, FiCpu, FiZap,
  FiTarget, FiLayers, FiCode, FiUsers, FiTrendingUp, FiCheckCircle, FiAlertCircle,
  FiBookOpen, FiGitBranch, FiActivity, FiAward, FiDatabase, FiSettings
} from 'react-icons/fi';
import { 
  BiNetworkChart, BiBrain, BiCodeAlt, BiDesktop, BiMobile, BiCloud,
  BiStats, BiTime, BiShield, BiRocket, BiBulb, BiCog
} from 'react-icons/bi';
import { AiOutlineRobot, AiOutlineExperiment } from 'react-icons/ai';
import './Presentation.css';

const Presentation = ({ onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(false);
  const [animationVariant, setAnimationVariant] = useState('slideIn');

  const slides = [
    {
      id: 'title',
      title: 'Met-Image-Classy',
      subtitle: 'Advanced Intelligent Image Classification System',
      content: 'A sophisticated web application demonstrating cutting-edge machine learning techniques with ensemble models and ultra-modern UI/UX design.',
      icon: AiOutlineRobot,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'hero'
    },
    {
      id: 'problem',
      title: 'Problem Statement',
      subtitle: 'Challenges in Modern Image Classification',
      content: [
        '🎯 **Accuracy Limitations**: Single-model approaches achieve only 60-70% accuracy',
        '⚡ **Performance Issues**: Slow processing and poor user experience',
        '🔧 **Technical Complexity**: Complex setup and deployment challenges',
        '📱 **Platform Constraints**: Limited cross-platform compatibility',
        '🎨 **Poor UX**: Most ML demos lack professional interfaces'
      ],
      icon: FiTarget,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      animation: 'problemReveal'
    },
    {
      id: 'solution',
      title: 'Our Solution',
      subtitle: 'Revolutionary Multi-Model Ensemble System',
      content: {
        overview: '🚀 **Ultra-Advanced AI Pipeline** with 90%+ accuracy through intelligent ensemble learning',
        features: [
          '🧠 **Dual AI Models**: MobileNet + COCO-SSD ensemble',
          '🔄 **Multi-Scale Analysis**: 4 preprocessing variations + augmentation',
          '⚖️ **Weighted Voting**: Intelligent confidence calibration',
          '🎯 **Semantic Grouping**: Synonym recognition and clustering',
          '🎨 **Professional UI**: Dark mode with advanced animations'
        ]
      },
      icon: BiBrain,
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      animation: 'solutionFlow'
    },
    {
      id: 'technologies',
      title: 'Technologies Used',
      subtitle: 'Modern Tech Stack & Advanced Libraries',
      content: {
        categories: [
          {
            name: 'AI/ML Framework',
            items: ['TensorFlow.js 4.16.0', 'MobileNet V2', 'COCO-SSD', 'Universal Sentence Encoder'],
            icon: AiOutlineRobot
          },
          {
            name: 'Frontend Technologies',
            items: ['React 18.2.0', 'Framer Motion 12.17.0', 'Advanced CSS3', 'Canvas API'],
            icon: BiDesktop
          },
          {
            name: 'Performance & UX',
            items: ['WebGL Backend', 'Memory Management', 'Real-time Processing', 'Responsive Design'],
            icon: FiZap
          }
        ]
      },
      icon: FiCode,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'techStack'
    },
    {
      id: 'challenges',
      title: 'Challenges Faced',
      subtitle: 'Technical Hurdles & Solutions',
      content: [
        {
          challenge: '🔧 **TensorFlow Backend Conflicts**',
          solution: 'Implemented intelligent backend detection with WebGL/CPU fallback'
        },
        {
          challenge: '⚡ **Performance Optimization**',
          solution: 'Multi-threading with Web Workers and model caching'
        },
        {
          challenge: '🎯 **Accuracy Improvement**',
          solution: 'Advanced ensemble methods with confidence calibration'
        },
        {
          challenge: '🎨 **Professional UI Design**',
          solution: 'Sophisticated animation system with 15+ custom keyframes'
        }
      ],
      icon: FiAlertCircle,
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      animation: 'challengesSolved'
    },
    {
      id: 'learning',
      title: 'What We Learned',
      subtitle: 'Key Insights & Knowledge Gained',
      content: [
        '🧠 **Advanced ML Techniques**: Ensemble learning and confidence calibration',
        '⚡ **Browser Performance**: Optimizing TensorFlow.js for production use',
        '🎨 **Modern UI/UX**: Creating professional interfaces with Framer Motion',
        '🔧 **Error Handling**: Robust fallback mechanisms for AI model failures',
        '📊 **Data Science**: Statistical analysis and variance assessment',
        '🚀 **Full-Stack Development**: Integrating complex AI with modern web tech'
      ],
      icon: BiBulb,
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      animation: 'learningGrowth'
    },
    {
      id: 'sdlc-requirements',
      title: 'Requirements & SRS Documentation',
      subtitle: 'Comprehensive System Requirements Specification',
      content: {
        functional: [
          '🎯 **Core Functionality**: Real-time image classification with 90%+ accuracy',
          '🔄 **Multi-Model Support**: MobileNet + COCO-SSD ensemble processing',
          '📱 **Cross-Platform**: Web-based solution with mobile responsiveness',
          '⚡ **Performance**: Sub-3-second analysis with progress feedback'
        ],
        nonFunctional: [
          '🔒 **Security**: Client-side processing, no data transmission',
          '📊 **Scalability**: Efficient memory management and model caching',
          '♿ **Accessibility**: ARIA compliance and keyboard navigation',
          '🎨 **Usability**: Intuitive interface with visual feedback'
        ]
      },
      icon: FiBookOpen,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'requirements'
    },
    {
      id: 'sdlc-design',
      title: 'Modeling & Design',
      subtitle: 'UML Diagrams & System Architecture',
      content: {
        architecture: '🏗️ **Component-Based Architecture** with modular AI services',
        diagrams: [
          '📋 **Use Case Diagram**: User interactions and system responses',
          '🔄 **Sequence Diagram**: AI processing workflow and model interactions',
          '📊 **Class Diagram**: React components and service layer structure',
          '🌊 **Data Flow Diagram**: Image processing pipeline and ensemble logic'
        ],
        patterns: [
          '🎯 **Singleton Pattern**: AI service instance management',
          '🔄 **Observer Pattern**: React state management and updates',
          '🏭 **Factory Pattern**: Dynamic model loading and initialization'
        ]
      },
      icon: BiNetworkChart,
      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      animation: 'designFlow'
    },
    {
      id: 'sdlc-implementation',
      title: 'Implementation & Code Quality',
      subtitle: 'Professional Development Standards',
      content: {
        codeQuality: [
          '📝 **Clean Code**: Modular functions with clear naming conventions',
          '🔧 **Error Handling**: Comprehensive try-catch blocks and user feedback',
          '📊 **Performance**: Optimized algorithms and memory management',
          '♻️ **Reusability**: Modular components and utility functions'
        ],
        bestPractices: [
          '🎯 **React Hooks**: Modern functional component patterns',
          '⚡ **Async Operations**: Proper Promise handling and loading states',
          '🎨 **CSS Organization**: Design system with custom properties',
          '🔍 **Code Reviews**: ESLint configuration and formatting standards'
        ]
      },
      icon: BiCodeAlt,
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      animation: 'implementation'
    },
    {
      id: 'sdlc-phases',
      title: 'SDLC Phases Applied',
      subtitle: 'Systematic Development Lifecycle',
      content: [
        {
          phase: '📋 **Planning & Analysis**',
          details: 'Requirements gathering, feasibility study, technology selection'
        },
        {
          phase: '🎨 **Design**',
          details: 'UI/UX mockups, system architecture, database design'
        },
        {
          phase: '⚡ **Implementation**',
          details: 'Agile development, modular coding, continuous integration'
        },
        {
          phase: '🧪 **Testing**',
          details: 'Unit testing, integration testing, user acceptance testing'
        },
        {
          phase: '🚀 **Deployment**',
          details: 'Production build, performance optimization, monitoring'
        }
      ],
      icon: FiGitBranch,
      background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)',
      animation: 'sdlcPhases'
    },
    {
      id: 'testing',
      title: 'Testing Strategy & Evidence',
      subtitle: 'Comprehensive Quality Assurance',
      content: {
        testingTypes: [
          '🧪 **Unit Testing**: Individual component and function validation',
          '🔗 **Integration Testing**: AI model interaction and data flow',
          '👥 **User Testing**: Interface usability and accessibility',
          '⚡ **Performance Testing**: Load times and memory usage analysis'
        ],
        evidence: [
          '📊 **Accuracy Metrics**: 90%+ classification accuracy on test dataset',
          '⏱️ **Performance Benchmarks**: <3s average processing time',
          '📱 **Cross-Platform**: Tested on Chrome, Firefox, Safari, Mobile',
          '♿ **Accessibility**: WCAG 2.1 AA compliance verification'
        ]
      },
      icon: FiActivity,
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      animation: 'testingEvidence'
    },
    {
      id: 'demo',
      title: 'Live Demo & Key Features',
      subtitle: 'Experience the Advanced AI System',
      content: {
        keyFeatures: [
          '🎯 **90%+ Accuracy**: Advanced ensemble learning',
          '⚡ **Real-time Processing**: Instant image analysis',
          '🎨 **Professional UI**: Dark mode with advanced animations',
          '📱 **Responsive Design**: Works on all devices',
          '🧠 **Smart Categories**: Hierarchical classification system'
        ],
        workflow: [
          '1️⃣ Upload or paste image URL',
          '2️⃣ Multi-scale preprocessing',
          '3️⃣ Dual-model analysis',
          '4️⃣ Ensemble voting',
          '5️⃣ Confidence calibration',
          '6️⃣ Results presentation'
        ]
      },
      icon: FiPlay,
      background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      animation: 'demoShowcase'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    let interval;
    if (isAutoPlay) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 8000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlay, slides.length]);

  const nextSlide = () => {
    setAnimationVariant('slideInRight');
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setAnimationVariant('slideInLeft');
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setAnimationVariant('fadeIn');
    setCurrentSlide(index);
  };

  const currentSlideData = slides[currentSlide];

  return (
    <motion.div 
      className="presentation-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="presentation-container">
        {/* Header */}
        <motion.div 
          className="presentation-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <div className="presentation-controls">
            <motion.button
              className="control-btn"
              onClick={() => setIsAutoPlay(!isAutoPlay)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
            >
              {isAutoPlay ? <FiPause /> : <FiPlay />}
            </motion.button>
          </div>
          <div className="slide-counter">
            {currentSlide + 1} / {slides.length}
          </div>
          <motion.button
            className="close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
          >
            ×
          </motion.button>
        </motion.div>

        {/* Main Content */}
        <div className="presentation-main">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              className="slide-content"
              style={{ background: currentSlideData.background }}
              initial={{ opacity: 0, x: animationVariant === 'slideInRight' ? 300 : animationVariant === 'slideInLeft' ? -300 : 0, scale: 0.9 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: animationVariant === 'slideInRight' ? -300 : 300, scale: 0.9 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <SlideRenderer slide={currentSlideData} />
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <motion.div 
          className="presentation-nav"
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <motion.button
            className="nav-btn prev"
            onClick={prevSlide}
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronLeft />
          </motion.button>

          <div className="slide-indicators">
            {slides.map((_, index) => (
              <motion.button
                key={index}
                className={`indicator ${index === currentSlide ? 'active' : ''}`}
                onClick={() => goToSlide(index)}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
                animate={{
                  backgroundColor: index === currentSlide ? '#00d4ff' : 'rgba(255,255,255,0.3)'
                }}
              />
            ))}
          </div>

          <motion.button
            className="nav-btn next"
            onClick={nextSlide}
            whileHover={{ scale: 1.1, x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <FiChevronRight />
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

// Slide renderer component
const SlideRenderer = ({ slide }) => {
  const IconComponent = slide.icon;

  const renderContent = () => {
    switch (slide.id) {
      case 'title':
        return (
          <motion.div className="hero-slide">
            <motion.div
              className="hero-icon"
              animate={{ 
                rotate: [0, 360],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                rotate: { duration: 20, repeat: Infinity, ease: "linear" },
                scale: { duration: 2, repeat: Infinity, ease: "easeInOut" }
              }}
            >
              <IconComponent />
            </motion.div>
            <motion.h1
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              {slide.title}
            </motion.h1>
            <motion.h2
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.5 }}
            >
              {slide.subtitle}
            </motion.h2>
            <motion.p
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.7 }}
            >
              {slide.content}
            </motion.p>
          </motion.div>
        );

      case 'problem':
        return (
          <motion.div className="problem-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="problem-grid">
              {slide.content.map((problem, index) => (
                <motion.div
                  key={index}
                  className="problem-item"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: problem }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'solution':
        return (
          <motion.div className="solution-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <motion.div 
              className="solution-overview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div dangerouslySetInnerHTML={{ __html: slide.content.overview }} />
            </motion.div>
            <div className="features-grid">
              {slide.content.features.map((feature, index) => (
                <motion.div
                  key={index}
                  className="feature-item"
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ scale: 1.05, x: 10 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: feature }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'technologies':
        return (
          <motion.div className="tech-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="tech-categories">
              {slide.content.categories.map((category, index) => (
                <motion.div
                  key={index}
                  className="tech-category"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.3 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="category-header">
                    <category.icon className="category-icon" />
                    <h3>{category.name}</h3>
                  </div>
                  <div className="tech-items">
                    {category.items.map((item, itemIndex) => (
                      <motion.div
                        key={itemIndex}
                        className="tech-item"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: index * 0.3 + itemIndex * 0.1 }}
                      >
                        {item}
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'challenges':
        return (
          <motion.div className="challenges-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="challenges-grid">
              {slide.content.map((item, index) => (
                <motion.div
                  key={index}
                  className="challenge-item"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="challenge" dangerouslySetInnerHTML={{ __html: item.challenge }} />
                  <div className="solution" dangerouslySetInnerHTML={{ __html: item.solution }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'learning':
        return (
          <motion.div className="learning-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="learning-grid">
              {slide.content.map((learning, index) => (
                <motion.div
                  key={index}
                  className="learning-item"
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  whileHover={{ scale: 1.05, y: -5 }}
                >
                  <div dangerouslySetInnerHTML={{ __html: learning }} />
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'sdlc-requirements':
        return (
          <motion.div className="sdlc-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="requirements-grid">
              <motion.div 
                className="requirements-section"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3>Functional Requirements</h3>
                {slide.content.functional.map((req, index) => (
                  <motion.div
                    key={index}
                    className="requirement-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: req }} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="requirements-section"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h3>Non-Functional Requirements</h3>
                {slide.content.nonFunctional.map((req, index) => (
                  <motion.div
                    key={index}
                    className="requirement-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: req }} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        );

      case 'sdlc-design':
        return (
          <motion.div className="design-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <motion.div 
              className="architecture-overview"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              {slide.content.architecture}
            </motion.div>
            <div className="design-grid">
              <div className="design-section">
                <h3>System Diagrams</h3>
                {slide.content.diagrams.map((diagram, index) => (
                  <motion.div
                    key={index}
                    className="design-item"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: diagram }} />
                  </motion.div>
                ))}
              </div>
              <div className="design-section">
                <h3>Design Patterns</h3>
                {slide.content.patterns.map((pattern, index) => (
                  <motion.div
                    key={index}
                    className="design-item"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: pattern }} />
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        );

      case 'sdlc-implementation':
        return (
          <motion.div className="implementation-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="implementation-grid">
              <motion.div 
                className="implementation-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3>Code Quality Standards</h3>
                {slide.content.codeQuality.map((standard, index) => (
                  <motion.div
                    key={index}
                    className="implementation-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: standard }} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="implementation-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h3>Best Practices</h3>
                {slide.content.bestPractices.map((practice, index) => (
                  <motion.div
                    key={index}
                    className="implementation-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: practice }} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        );

      case 'sdlc-phases':
        return (
          <motion.div className="phases-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="phases-timeline">
              {slide.content.map((phase, index) => (
                <motion.div
                  key={index}
                  className="phase-item"
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="phase-number">{index + 1}</div>
                  <div className="phase-content">
                    <div className="phase-title" dangerouslySetInnerHTML={{ __html: phase.phase }} />
                    <div className="phase-details">{phase.details}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        );

      case 'testing':
        return (
          <motion.div className="testing-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="testing-grid">
              <motion.div 
                className="testing-section"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3>Testing Types</h3>
                {slide.content.testingTypes.map((type, index) => (
                  <motion.div
                    key={index}
                    className="testing-item"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: type }} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="testing-section"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h3>Evidence & Results</h3>
                {slide.content.evidence.map((evidence, index) => (
                  <motion.div
                    key={index}
                    className="testing-item evidence"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: evidence }} />
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        );

      case 'demo':
        return (
          <motion.div className="demo-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="demo-grid">
              <motion.div 
                className="demo-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
              >
                <h3>Key Features</h3>
                {slide.content.keyFeatures.map((feature, index) => (
                  <motion.div
                    key={index}
                    className="demo-item"
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, x: 10 }}
                  >
                    <div dangerouslySetInnerHTML={{ __html: feature }} />
                  </motion.div>
                ))}
              </motion.div>
              <motion.div 
                className="demo-section"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <h3>Processing Workflow</h3>
                {slide.content.workflow.map((step, index) => (
                  <motion.div
                    key={index}
                    className="demo-item workflow"
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.05, x: -10 }}
                  >
                    {step}
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </motion.div>
        );

      default:
        return (
          <motion.div className="default-slide">
            <div className="slide-header">
              <IconComponent className="slide-icon" />
              <div>
                <h1>{slide.title}</h1>
                <h2>{slide.subtitle}</h2>
              </div>
            </div>
            <div className="slide-content">
              {slide.content}
            </div>
          </motion.div>
        );
    }
  };

  return renderContent();
};

export default Presentation;