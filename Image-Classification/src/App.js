/* eslint-disable react-hooks/exhaustive-deps */
import './App.css';
import { useState, useEffect, useRef } from 'react';
import '@tensorflow/tfjs-backend-webgl';
import '@tensorflow/tfjs-core';
import aiService from './services/enhancedAiService';
import colorAnalysisService from './services/colorAnalysisService';
import { motion, AnimatePresence } from 'framer-motion';
import { testObjectDetection } from './testObjectDetection';
import { FiUpload, FiImage, FiX, FiEye, FiClock, FiActivity, FiZap, FiCpu, FiMonitor, FiLayers, FiScissors } from 'react-icons/fi';
import { BiLinkAlt, BiStats, BiBrain } from 'react-icons/bi';
import { AiOutlineRobot } from 'react-icons/ai';
import ParticleBackground from './components/ParticleBackground';
import GeometricShapes from './components/GeometricShapes';
import AdvancedLoader from './components/AdvancedLoader';
import Presentation from './components/Presentation';
import ColorAnalysis from './components/ColorAnalysis';
import ObjectExtraction from './components/ObjectExtraction';

function App() {
	const [isModelLoading, setIsModelLoading] = useState(false);
	const [loadingProgress, setLoadingProgress] = useState(0);
	const [loadingMessage, setLoadingMessage] = useState('');
	const [model, setModel] = useState(null);
	const [imageUrl, setImageUrl] = useState(null);
	const [isImageValid, setIsImageValid] = useState(false);
	const [results, setResults] = useState(null);
	const [isAnalyzing, setIsAnalyzing] = useState(false);
	const [history, setHistory] = useState([]);
	const [modelInfo, setModelInfo] = useState(null);
	const [showPresentation, setShowPresentation] = useState(false);
	const [colorAnalysisData, setColorAnalysisData] = useState(null);
	const [showColorAnalysis, setShowColorAnalysis] = useState(false);
	const [isAnalyzingColors, setIsAnalyzingColors] = useState(false);
	const [showObjectExtraction, setShowObjectExtraction] = useState(false);

	const imageRef = useRef();
	const textInputRef = useRef();
	const fileInputRef = useRef();

	const load = async () => {
		setIsModelLoading(true);
		try {
			await aiService.loadModels((progress, message) => {
				setLoadingProgress(progress);
				setLoadingMessage(message);
			});
			setModel(true);
			setModelInfo(aiService.getModelInfo());
			setIsModelLoading(false);
		} catch (error) {
			console.error('Model loading error:', error);
			setIsModelLoading(false);
			alert('Failed to load AI models. Please refresh the page and try again.');
		}
	};

	const uploadImage = (e) => {
		textInputRef.current.value = '';
		const { files } = e.target;
		if (files.length > 0) {
			setIsImageValid(true);
			setImageUrl(URL.createObjectURL(files[0]));
		} else {
			setIsImageValid(false);
			setImageUrl(null);
		}
	};

	const identify = async () => {
		if (!model || !imageRef.current) return;
		
		setIsAnalyzing(true);
		textInputRef.current.value = '';
		fileInputRef.current.value = '';
		
		try {
			const analysisResults = await aiService.classifyImage(imageRef.current, {
				topK: 10, // More predictions for better ensemble
				minConfidence: 0.01, // Very low threshold for maximum recall
				useEnsemble: true,
				usePreprocessing: true // Enable all advanced techniques
			});
			
			setResults(analysisResults);
		} catch (error) {
			console.error('Classification error:', error);
			alert('Failed to analyze image. Please try again.');
		} finally {
			setIsAnalyzing(false);
		}
	};

	const analyzeColors = async () => {
		if (!imageRef.current) return;
		
		setIsAnalyzingColors(true);
		try {
			const colorData = await colorAnalysisService.analyzeImage(imageRef.current);
			setColorAnalysisData(colorData);
			setShowColorAnalysis(true);
		} catch (error) {
			console.error('Color analysis error:', error);
			alert('Failed to analyze colors. Please try again.');
		} finally {
			setIsAnalyzingColors(false);
		}
	};

	const cancel = async () => {
		textInputRef.current.value = '';
		fileInputRef.current.value = '';
		setIsImageValid(false);
		setResults(null);
		setIsAnalyzing(false);
		setColorAnalysisData(null);
		setShowColorAnalysis(false);
		setIsAnalyzingColors(false);
		setShowObjectExtraction(false);
	};

	const validateImageUrl = (url) => {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(true);
			img.onerror = () => reject(false);
			img.src = url;
		});
	};

	const handleOnChange = (e) => {
		fileInputRef.current.value = '';
		validateImageUrl(e.target.value)
			.then((result) => {
				setIsImageValid(true);
			})
			.catch((err) => {
				setIsImageValid(false);
			});
		setImageUrl(e.target.value);
		setResults([]);
	};

	const triggerUpload = () => {
		fileInputRef.current.click();
	};

	useEffect(() => {
		load();
		
		// Add test function to window for debugging
		window.testObjectDetection = testObjectDetection;
		console.log('🧪 Test function available: window.testObjectDetection()');
	}, []);

	useEffect(() => {
		if (isImageValid && imageUrl) {
			setHistory([imageUrl, ...history]);
		}
	}, [imageUrl, isImageValid]);

	if (isModelLoading) {
		return (
			<motion.div 
				className='loadContent'
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5 }}
			>
				<ParticleBackground />
				<GeometricShapes />
				<AdvancedLoader progress={loadingProgress} message={loadingMessage} />
			</motion.div>
		);
	}

	return (
		<div className='App'>
			<ParticleBackground />
			<GeometricShapes />
			<div className='dashboard-container'>
				<motion.div 
					className='header'
					initial={{ y: -100, opacity: 0 }}
					animate={{ y: 0, opacity: 1 }}
					transition={{ duration: 0.8, ease: "easeOut" }}
				>
					<AiOutlineRobot className='header-icon' />
					<h1>AI Image Classification</h1>
					<div className='header-subtitle'>
						<FiCpu className='subtitle-icon' />
						Powered by MobileNet Neural Network
						<div className='status-indicators'>
							<motion.div 
								className='status-dot active'
								animate={{ scale: [1, 1.2, 1] }}
								transition={{ duration: 2, repeat: Infinity }}
							/>
							<span>AI Model Active</span>
							<motion.button
								className='presentation-btn'
								onClick={() => setShowPresentation(true)}
								whileHover={{ scale: 1.05, y: -2 }}
								whileTap={{ scale: 0.95 }}
								transition={{ type: "spring", stiffness: 400, damping: 17 }}
							>
								<FiMonitor className='button-icon' />
								View Presentation
							</motion.button>
						</div>
					</div>
				</motion.div>

				<motion.div 
					className='control-panel'
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.3 }}
				>
					<div className='panel-header'>
						<FiZap className='panel-icon' />
						<h3>Image Input Console</h3>
					</div>
					<div className='inputHolder'>
						<input
							className='uploadFileInput'
							type='file'
							accept='image/*'
							capture='camera'
							ref={fileInputRef}
							onChange={uploadImage}
						/>
						<motion.button
							className='uploadImg'
							onClick={triggerUpload}
							whileHover={{ scale: 1.05, y: -2 }}
							whileTap={{ scale: 0.95 }}
							transition={{ type: "spring", stiffness: 400, damping: 17 }}
						>
							<FiUpload className='button-icon' />
							Upload Image
						</motion.button>
						<motion.span 
							className='or'
							animate={{ rotate: [0, 5, -5, 0] }}
							transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
						> 
							OR 
						</motion.span>
						<div className='input-wrapper'>
							<BiLinkAlt className='input-icon' />
							<input
								className='uploadTextInput'
								type='text'
								placeholder='Paste Image URL'
								ref={textInputRef}
								onChange={handleOnChange}
							/>
						</div>
					</div>
				</motion.div>

				<motion.div 
					className='analysis-workspace'
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ duration: 0.5, delay: 0.5 }}
				>
					<AnimatePresence mode="wait">
						{isImageValid ? (
							<motion.div 
								key="image-content"
								className='mainContent'
								initial={{ opacity: 0, scale: 0.8 }}
								animate={{ opacity: 1, scale: 1 }}
								exit={{ opacity: 0, scale: 0.8 }}
								transition={{ duration: 0.5 }}
							>
								<motion.div 
									className='imageHolder'
									whileHover={{ scale: 1.02 }}
									transition={{ type: "spring", stiffness: 300 }}
								>
									{isImageValid && imageUrl && (
										<motion.img
											src={imageUrl}
											alt='Upload preview'
											crossOrigin='anonymous'
											ref={imageRef}
											initial={{ opacity: 0, y: 20 }}
											animate={{ opacity: 1, y: 0 }}
											transition={{ duration: 0.5 }}
										/>
									)}
								</motion.div>
								{isImageValid && imageUrl && (
									<motion.div 
										className='buttonHolder'
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.5, delay: 0.2 }}
									>
										<motion.button
											className={`button identify-btn ${isAnalyzing ? 'analyzing' : ''}`}
											onClick={identify}
											disabled={isAnalyzing}
											whileHover={!isAnalyzing ? { scale: 1.05, y: -2 } : {}}
											whileTap={!isAnalyzing ? { scale: 0.95 } : {}}
											transition={{ type: "spring", stiffness: 400, damping: 17 }}
										>
											<FiEye className={`button-icon ${isAnalyzing ? 'spinning' : ''}`} />
											{isAnalyzing ? 'Analyzing...' : 'Analyze Image'}
										</motion.button>
										<motion.button
											className={`button color-analysis-btn ${isAnalyzingColors ? 'analyzing' : ''}`}
											onClick={analyzeColors}
											disabled={isAnalyzing || isAnalyzingColors}
											whileHover={!isAnalyzing && !isAnalyzingColors ? { scale: 1.05, y: -2 } : {}}
											whileTap={!isAnalyzing && !isAnalyzingColors ? { scale: 0.95 } : {}}
											transition={{ type: "spring", stiffness: 400, damping: 17 }}
										>
											<FiLayers className={`button-icon ${isAnalyzingColors ? 'spinning' : ''}`} />
											{isAnalyzingColors ? 'Analyzing Colors...' : 'Color Analysis'}
										</motion.button>
										<motion.button
											className='button object-extraction-btn'
											onClick={() => setShowObjectExtraction(true)}
											disabled={isAnalyzing || isAnalyzingColors}
											whileHover={!isAnalyzing && !isAnalyzingColors ? { scale: 1.05, y: -2 } : {}}
											whileTap={!isAnalyzing && !isAnalyzingColors ? { scale: 0.95 } : {}}
											transition={{ type: "spring", stiffness: 400, damping: 17 }}
										>
											{/* <FiScissors className='button-icon' /> */}
											{/* Object Extraction */}
										{/* </motion.button> */}
										{/* <motion.button */}
											{/* className='button cancel' */}
											{/* onClick={cancel} */}
											{/* whileHover={{ scale: 1.05, y: -2 }} */}
											{/* whileTap={{ scale: 0.95 }} */}
											{/* transition={{ type: "spring", stiffness: 400, damping: 17 }} */}
										{/* > */}
											{/* <FiX className='button-icon' /> */}
											Clear
										</motion.button>
									</motion.div>
								)}
							</motion.div>
						) : (
							<motion.div 
								key="message-content"
								className='messageContent'
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								transition={{ duration: 0.5 }}
							>
								<motion.div 
									className='message'
									animate={{ 
										scale: [1, 1.02, 1],
										opacity: [0.7, 1, 0.7] 
									}}
									transition={{ 
										duration: 2, 
										repeat: Infinity, 
										repeatType: "reverse" 
									}}
								>
									<FiImage className='message-icon' />
									Drop your image here or use the upload button
								</motion.div>
							</motion.div>
						)}
					</AnimatePresence>
					<AnimatePresence>
						{results && results.ensemble && results.ensemble.length > 0 && (
							<motion.div 
								className='resultsHolder'
								initial={{ opacity: 0, x: 50 }}
								animate={{ opacity: 1, x: 0 }}
								exit={{ opacity: 0, x: -50 }}
								transition={{ duration: 0.6 }}
							>
								<div className='results-panel'>
									<div className='results-header'>
										<BiBrain className='results-icon' />
										<h3>AI Analysis Results</h3>
										<motion.div 
											className='analysis-badge'
											animate={{ 
												boxShadow: [
													'0 0 20px rgba(0,255,127,0.3)',
													'0 0 40px rgba(0,255,127,0.6)',
													'0 0 20px rgba(0,255,127,0.3)'
												]
											}}
											transition={{ duration: 2, repeat: Infinity }}
										>
											<FiActivity className='badge-icon' />
											Processed
										</motion.div>
									</div>
									{results.ensemble.map((result, index) => {
										return (
											<motion.div
												className={`result ${index === 0 ? 'best-result' : ''}`}
												key={result.className}
												initial={{ opacity: 0, y: 20, scale: 0.9 }}
												animate={{ opacity: 1, y: 0, scale: 1 }}
												transition={{ 
													duration: 0.5, 
													delay: index * 0.1 
												}}
												whileHover={{ 
													scale: 1.02, 
													y: -2,
													boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
												}}
											>
												<div className='result-content'>
													<span className='name'>{result.className}</span>
													<div className='confidence-container'>
														<span className='confidence-text'>
															Confidence: {(result.probability * 100).toFixed(2)}%
														</span>
														<div className='confidence-bar'>
															<motion.div
																className='confidence-fill'
																initial={{ width: 0 }}
																animate={{ width: `${result.probability * 100}%` }}
																transition={{ duration: 1, delay: index * 0.1 + 0.5 }}
															/>
														</div>
														{index === 0 && (
															<motion.div 
																className='prediction-badge'
																initial={{ scale: 0, rotate: -180 }}
																animate={{ scale: 1, rotate: 0 }}
																transition={{ 
																	type: "spring", 
																	stiffness: 300, 
																	delay: 0.8 
																}}
																whileHover={{ scale: 1.1, rotate: 5 }}
															>
																<BiStats className='badge-icon' />
																Top Prediction
															</motion.div>
														)}
													</div>
												</div>
											</motion.div>
										);
									})}
								</div>
							</motion.div>
						)}
					</AnimatePresence>
				</motion.div>

				<AnimatePresence>
					{history.length > 0 && (
						<motion.div 
							className='recentPredictions'
							initial={{ opacity: 0, y: 50 }}
							animate={{ opacity: 1, y: 0 }}
							exit={{ opacity: 0, y: 50 }}
							transition={{ duration: 0.6, delay: 0.2 }}
						>
							<div className='history-panel'>
								<div className='recent-header'>
									<FiClock className='recent-icon' />
									<h2>Analysis History</h2>
									<motion.div 
										className='history-count'
										animate={{ scale: [1, 1.1, 1] }}
										transition={{ duration: 2, repeat: Infinity }}
									>
										{history.length} items
									</motion.div>
								</div>
								<motion.div 
									className='recentImages'
									layout
								>
									{history.map((image, index) => {
										return (
											<motion.div
												className='recentPrediction'
												key={`${image}${index}`}
												initial={{ opacity: 0, scale: 0.8 }}
												animate={{ opacity: 1, scale: 1 }}
												transition={{ 
													duration: 0.5, 
													delay: index * 0.1 
												}}
												whileHover={{ 
													scale: 1.05, 
													y: -5,
													rotate: 2
												}}
												whileTap={{ scale: 0.95 }}
												layout
											>
												<img
													src={image}
													alt='recent prediction'
													onClick={() => {
														setIsImageValid(true);
														setImageUrl(image);
														setResults(null);
													}}
												/>
											</motion.div>
										);
									})}
								</motion.div>
							</div>
						</motion.div>
					)}
				</AnimatePresence>
			</div>

			{/* Presentation Modal */}
			<AnimatePresence>
				{showPresentation && (
					<Presentation onClose={() => setShowPresentation(false)} />
				)}
			</AnimatePresence>

			{/* Color Analysis Modal */}
			<AnimatePresence>
				{showColorAnalysis && colorAnalysisData && (
					<ColorAnalysis 
						colorData={colorAnalysisData} 
						originalImage={imageRef.current}
						onClose={() => setShowColorAnalysis(false)} 
					/>
				)}
			</AnimatePresence>

			{/* Object Extraction Modal */}
			<AnimatePresence>
				{showObjectExtraction && imageRef.current && (
					<ObjectExtraction 
						originalImage={imageRef.current}
						onClose={() => setShowObjectExtraction(false)} 
					/>
				)}
			</AnimatePresence>
		</div>
	);
}

export default App;