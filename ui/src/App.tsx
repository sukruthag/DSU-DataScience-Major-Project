import { useEffect, useRef, useState } from 'react';
import './index.css'
import axios from 'axios';

function App() {

	const [files, setFiles] = useState<any>([''])
	const [navTabs, setNavTabs] = useState<any>([''])
	const [selectedTab, setSelectedTab] = useState<any>('')
	const [selectedImages, setSelectedImages] = useState<any>([''])
	const [height, setHeight] = useState<number>(0);
	const [width, setWidth] = useState<number>(1);
	const heightRef = useRef<any>(null);
	const [prompt, setPrompt] = useState('')
	const [promptSize, setPromptSize] = useState<any>(1)
	const [generatingTab, setGeneratingTab] = useState<any>('')
	const [progress, setProgress] = useState<any>({
		"file_progress": 0,
		"total_files": 0,
		"progress": 0
	})

	useEffect(() => {
		const TopPos = heightRef.current?.getBoundingClientRect().top;
		// const LeftPos = heightRef.current?.getBoundingClientRect().left;
		setHeight(window.innerHeight - TopPos - 20);
		// setWidth(window.innerWidth - LeftPos - 10);
	});

	useEffect(() => {
		axios.get('http://localhost:8000/tree')
			.then(function (response) {
				setFiles(response.data);
			})
			.catch(function (error) {
				console.log(error);
			})
	}, [progress])

	useEffect(() => {
		const intervalId = setInterval(() => {
			axios.get('http://localhost:8000/generating')
				.then(function (response) {
					// setGeneratingTab(response.data)
				})
				.catch(function (error) {
					console.log(error)
				})
		}, 1000)

		return () => clearInterval(intervalId)
	})

	useEffect(() => {
		if (generatingTab !== '') {
			const intervalId = setInterval(() => {
				axios.get('http://localhost:8000/progress')
					.then(function (response) {
						console.log(response.data)
						setProgress(response.data);
					})
					.catch(function (error) {
						console.log(error);
					})
			}, 1000);

			return () => clearInterval(intervalId);
		}
	}, [generatingTab]);

	useEffect(() => {
		var temp: any = []
		files.map((item: any) => {
			temp.push(item.split('/')[1])
		})
		if (generatingTab !== '') {
			temp = [generatingTab, ...temp]
		}
		setNavTabs(Array.from(new Set(temp)))
	}, [files])

	useEffect(() => {
		setSelectedTab(navTabs[0])
	}, [navTabs])

	const onBlurSize = () => {
		if (promptSize > 10) {
			setPromptSize(10)
		} else if (promptSize < 1) {
			setPromptSize(1)
		}
	}

	useEffect(() => {
		var temp: any = []
		files.map((item: any) => {
			const tab = item.split('/')[1]
			if (tab === selectedTab) {
				temp.push(item)
			}
		})
		setSelectedImages(temp)
	}, [selectedTab, files])

	const onClickNewTexture = () => {
		if (generatingTab === '') {
			setPrompt('')
			if (!navTabs.includes('New texture')) {
				setNavTabs(['New texture', ...navTabs])
			}
			setSelectedTab('New texture')
		}
	}

	const onClickGenerate = () => {
		setGeneratingTab(prompt)
		axios.get(`http://localhost:8000/run?prompt=${prompt}&number=${promptSize}`)
			.then(function (response) {
				console.log(response)
				setGeneratingTab('')
			})
			.catch(function (error) {
				console.log(error);
			})
	}

	return (
		<div className="App font-['Poppins'] w-screen h-screen bg-[#edf3ff] overflow-y-auto scrollbar">
			<div className="relative">
				{/* topbar */}
				<div className="bg-white fixed w-screen shadow h-[60px] z-10 flex items-center">
					<div className="flex w-[300px] items-center h-full">
						<img src={require(`./logo.png`)} alt="" className="rounded hover:scale-[1.05] h-[40px] ml-[20px] trasition-all" />
					</div>
					<div className="text-2xl ml-5">{selectedTab}</div>
				</div>
				{/* sidenav */}
				<div className="h-screen pt-[70px] shadow w-[300px] bg-white p-5 fixed">
					<div className="w-full transition-all hover:scale-[1.05] flex justify-center items-center bg-[#1a194d] text-white rounded cursor-pointer p-2" onClick={onClickNewTexture}>
						<div className=" mr-10">New Texture</div>
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
							<path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-8.4 8.4a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32l8.4-8.4Z" />
							<path d="M5.25 5.25a3 3 0 0 0-3 3v10.5a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3V13.5a.75.75 0 0 0-1.5 0v5.25a1.5 1.5 0 0 1-1.5 1.5H5.25a1.5 1.5 0 0 1-1.5-1.5V8.25a1.5 1.5 0 0 1 1.5-1.5h5.25a.75.75 0 0 0 0-1.5H5.25Z" />
						</svg>

					</div>
					<div className="-mx-5 p-5 overflow-y-auto scrollbar" ref={heightRef} style={{ height: height }}>
						{navTabs?.map((item: any) => (
							<div className="py-1">
								<div className={`w-full transition-all flex items-center pl-5 p-2 rounded cursor-pointer hover:bg-[#dee8ff] hover:text-black hover:scale-[1.05] ${selectedTab === item ? 'bg-[#5863f8] text-white' : ''}`}
									onClick={() => {
										if (generatingTab === '') {
											setSelectedTab(item)
										}
									}}>
									<span className='truncate'>{item}</span>
								</div>
							</div>
						))}
					</div>
				</div>
				{/* content */}
				<div className="h-screen p-5 ml-[300px] pt-[70px]">
					{generatingTab === selectedTab &&
						<div className="w-full">
							<div className="flex justify-center gap-5">
								<div className="flex justify-center">
									<div className="">generating image:</div>
									<div className="ml-2">{progress?.file_progress}</div>
								</div>
								<div className="flex justify-center">
									<div className="">progress:</div>
									<div className="ml-2">{progress?.progress}%</div>
								</div>
								<div className="flex justify-center">
									<div className="">total images:</div>
									<div className="ml-2">{progress?.total_files}</div>
								</div>
							</div>
							<div className="mt-1 mb-5 h-1 transition-all bg-[#5863f8] rounded-full" style={{ width: `${progress?.progress}%` }} />
						</div>
					}
					<div className="grid grid-cols-3 gap-5 mt-3">
						{selectedImages?.map((item: any) => {
							var exist = true
							try {
								require(`../../api/${item}`)
							} catch (error) {
								exist = false
							}
							return (
								<>
									{exist &&
										<img src={require(`../../api/${item}`)} alt="" className="rounded hover:scale-[1.05] transition-all" />
									}
								</>
							)
						})}
					</div>
					{selectedTab === 'New texture' &&
						<div className="">
							<div className="flex items-center gap-5">
								<div className="w-[90%] pl-1 text-sm">Prompt</div>
								<div className="w-[10%] pl-1 text-sm">Size</div>
							</div>
							<div className="flex items-center gap-5">
								<input className='w-[90%] px-2 py-5 bg-white rounded border' placeholder='Enter prompt' value={prompt} onChange={(e) => setPrompt(e.target.value)} />
								<input type="number" className="w-[10%] px-2 py-5 rounded border" placeholder='size' aria-label='size' value={promptSize} onChange={(e) => setPromptSize(e.target.value)} onBlur={onBlurSize} />
							</div>
							{prompt !== '' &&
								<div className="flex justify-center mt-5">
									<button onClick={onClickGenerate} className='w-[500px] hover:scale-[1.05] transition-all flex justify-center p-2 border shadow bg-[#5863f8] text-white rounded'> Generate </button>
								</div>
							}
						</div>
					}
					<div className="h-[20px]"></div>
				</div>
			</div>
		</div>
	);
}

export default App;
