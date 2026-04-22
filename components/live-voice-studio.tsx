"use client";

import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from "react-icons/fa";

const DEFAULT_MODEL = "gemini-live-2.5-flash-preview";

const LIVE_MODELS = [
	"gemini-live-2.5-flash-preview",
	"gemini-2.0-flash-live-preview-04-09",
] as const;

const VOICE_CHOICES = [
	"Orus",
	"Aoede",
	"Puck",
	"Charon",
	"Kore",
	"Fenrir",
] as const;

const LIVE_SYSTEM_PROMPT = `You are AlfieAI, the official virtual assistant for Juniata College in Huntingdon, Pennsylvania.

Keep responses concise, accurate, and conversational for live voice chat.
Use Juniata-specific details when relevant.
If you are unsure about a real-time fact, say so clearly.`;

type ConnectionState = "idle" | "connecting" | "connected" | "error";

type LiveTokenResponse = {
	token: string;
	model: string;
	expiresAt?: string;
};

function averageLevel(bytes: Uint8Array): number {
	if (bytes.length === 0) {
		return 0;
	}

	let total = 0;
	for (let i = 0; i < bytes.length; i += 1) {
		total += bytes[i];
	}

	return total / bytes.length / 255;
}

function float32ToPcmBlob(samples: Float32Array): { data: string; mimeType: string } {
	const pcm16 = new Int16Array(samples.length);

	for (let i = 0; i < samples.length; i += 1) {
		const clamped = Math.max(-1, Math.min(1, samples[i]));
		pcm16[i] = clamped < 0 ? clamped * 32768 : clamped * 32767;
	}

	const bytes = new Uint8Array(pcm16.buffer);
	let binary = "";
	for (let i = 0; i < bytes.length; i += 1) {
		binary += String.fromCharCode(bytes[i]);
	}

	return {
		data: window.btoa(binary),
		mimeType: "audio/pcm;rate=16000",
	};
}

function base64ToBytes(base64: string): Uint8Array {
	const binary = window.atob(base64);
	const bytes = new Uint8Array(binary.length);

	for (let i = 0; i < binary.length; i += 1) {
		bytes[i] = binary.charCodeAt(i);
	}

	return bytes;
}

function decodePcmToAudioBuffer(
	bytes: Uint8Array,
	audioContext: AudioContext,
	sampleRate: number,
	channels: number,
): AudioBuffer {
	const sampleCount = Math.floor(bytes.byteLength / 2 / channels);
	const audioBuffer = audioContext.createBuffer(channels, sampleCount, sampleRate);
	const int16 = new Int16Array(bytes.buffer, bytes.byteOffset, Math.floor(bytes.byteLength / 2));

	for (let channelIndex = 0; channelIndex < channels; channelIndex += 1) {
		const channelData = audioBuffer.getChannelData(channelIndex);
		for (let sampleIndex = 0; sampleIndex < sampleCount; sampleIndex += 1) {
			const sourceIndex = sampleIndex * channels + channelIndex;
			channelData[sampleIndex] = (int16[sourceIndex] ?? 0) / 32768;
		}
	}

	return audioBuffer;
}

export default function LiveVoiceStudio() {
	const [connectionState, setConnectionState] = useState<ConnectionState>("idle");
	const [statusText, setStatusText] = useState("Connect to start a live voice session.");
	const [errorText, setErrorText] = useState("");
	const [selectedVoice, setSelectedVoice] = useState<string>("Orus");
	const [selectedModel, setSelectedModel] = useState<string>(DEFAULT_MODEL);
	const [isRecording, setIsRecording] = useState(false);
	const [userTranscript, setUserTranscript] = useState("");
	const [assistantTranscript, setAssistantTranscript] = useState("");
	const [textPrompt, setTextPrompt] = useState("");

	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	const sessionRef = useRef<Session | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
	const isRecordingRef = useRef(false);

	const inputContextRef = useRef<AudioContext | null>(null);
	const outputContextRef = useRef<AudioContext | null>(null);
	const inputGainRef = useRef<GainNode | null>(null);
	const outputGainRef = useRef<GainNode | null>(null);
	const inputAnalyserRef = useRef<AnalyserNode | null>(null);
	const outputAnalyserRef = useRef<AnalyserNode | null>(null);
	const nextStartTimeRef = useRef(0);
	const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());

	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) {
			return;
		}

		const context = canvas.getContext("2d");
		if (!context) {
			return;
		}

		const inputData = new Uint8Array(512);
		const outputData = new Uint8Array(512);

		const render = (time: number) => {
			const rect = canvas.getBoundingClientRect();
			const dpr = window.devicePixelRatio || 1;
			const width = Math.max(1, Math.floor(rect.width * dpr));
			const height = Math.max(1, Math.floor(rect.height * dpr));

			if (canvas.width !== width || canvas.height !== height) {
				canvas.width = width;
				canvas.height = height;
			}

			const inputAnalyser = inputAnalyserRef.current;
			const outputAnalyser = outputAnalyserRef.current;

			if (inputAnalyser) {
				inputAnalyser.getByteFrequencyData(inputData);
			} else {
				inputData.fill(0);
			}

			if (outputAnalyser) {
				outputAnalyser.getByteFrequencyData(outputData);
			} else {
				outputData.fill(0);
			}

			const inputLevel = averageLevel(inputData);
			const outputLevel = averageLevel(outputData);
			const centerX = width / 2;
			const centerY = height / 2;
			const t = time * 0.001;

			const bg = context.createLinearGradient(0, 0, width, height);
			bg.addColorStop(0, "#06141f");
			bg.addColorStop(0.5, "#0a2130");
			bg.addColorStop(1, "#1a1110");
			context.fillStyle = bg;
			context.fillRect(0, 0, width, height);

			const glowRadius = Math.min(width, height) * (0.2 + outputLevel * 0.12);
			const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius * 2.3);
			glow.addColorStop(0, `rgba(57, 216, 255, ${0.24 + outputLevel * 0.35})`);
			glow.addColorStop(0.55, `rgba(255, 125, 53, ${0.2 + inputLevel * 0.25})`);
			glow.addColorStop(1, "rgba(7, 14, 19, 0)");
			context.fillStyle = glow;
			context.fillRect(0, 0, width, height);

			for (let ring = 0; ring < 4; ring += 1) {
				const phase = t * (0.6 + ring * 0.12);
				const ringRadius = glowRadius * (0.45 + ring * 0.4 + inputLevel * 0.2);
				context.beginPath();
				context.lineWidth = Math.max(1, dpr * (1.25 - ring * 0.18));
				context.strokeStyle = `rgba(${ring % 2 === 0 ? "94, 220, 255" : "255, 161, 110"}, ${0.32 - ring * 0.06})`;
				for (let i = 0; i <= 160; i += 1) {
					const p = (i / 160) * Math.PI * 2;
					const wobble = 1 + Math.sin(p * (3 + ring) + phase) * (0.04 + outputLevel * 0.06);
					const x = centerX + Math.cos(p) * ringRadius * wobble;
					const y = centerY + Math.sin(p) * ringRadius * wobble;
					if (i === 0) {
						context.moveTo(x, y);
					} else {
						context.lineTo(x, y);
					}
				}
				context.closePath();
				context.stroke();
			}

			context.beginPath();
			for (let i = 0; i < outputData.length; i += 1) {
				const x = (i / (outputData.length - 1)) * width;
				const y = centerY + (outputData[i] / 255 - 0.5) * height * 0.28;
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.strokeStyle = "rgba(122, 240, 255, 0.45)";
			context.lineWidth = 2 * dpr;
			context.stroke();

			context.beginPath();
			for (let i = 0; i < inputData.length; i += 1) {
				const x = (i / (inputData.length - 1)) * width;
				const y = centerY + (inputData[i] / 255 - 0.5) * height * 0.18 + Math.sin(t + i * 0.05) * 5 * dpr;
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.strokeStyle = "rgba(255, 173, 128, 0.38)";
			context.lineWidth = 1.5 * dpr;
			context.stroke();

			animationFrameRef.current = window.requestAnimationFrame(render);
		};

		animationFrameRef.current = window.requestAnimationFrame(render);

		return () => {
			if (animationFrameRef.current) {
				window.cancelAnimationFrame(animationFrameRef.current);
				animationFrameRef.current = null;
			}
		};
	}, []);

	async function ensureAudioGraph(): Promise<void> {
		if (!inputContextRef.current) {
			inputContextRef.current = new window.AudioContext({ sampleRate: 16000 });
			inputGainRef.current = inputContextRef.current.createGain();
			inputAnalyserRef.current = inputContextRef.current.createAnalyser();
			inputAnalyserRef.current.fftSize = 1024;
			inputGainRef.current.connect(inputAnalyserRef.current);
		}

		if (!outputContextRef.current) {
			outputContextRef.current = new window.AudioContext({ sampleRate: 24000 });
			outputGainRef.current = outputContextRef.current.createGain();
			outputGainRef.current.gain.value = 1;
			outputAnalyserRef.current = outputContextRef.current.createAnalyser();
			outputAnalyserRef.current.fftSize = 1024;

			outputGainRef.current.connect(outputAnalyserRef.current);
			outputAnalyserRef.current.connect(outputContextRef.current.destination);
			nextStartTimeRef.current = outputContextRef.current.currentTime;
		}

		if (inputContextRef.current.state === "suspended") {
			await inputContextRef.current.resume();
		}

		if (outputContextRef.current.state === "suspended") {
			await outputContextRef.current.resume();
		}
	}

	function clearPlaybackQueue(): void {
		for (const source of activeSourcesRef.current) {
			try {
				source.stop();
			} catch {
				// no-op
			}
		}

		activeSourcesRef.current.clear();

		if (outputContextRef.current) {
			nextStartTimeRef.current = outputContextRef.current.currentTime;
		}
	}

	function enqueueAudio(base64Audio: string): void {
		const outputContext = outputContextRef.current;
		const outputGain = outputGainRef.current;
		if (!outputContext || !outputGain) {
			return;
		}

		const bytes = base64ToBytes(base64Audio);
		if (bytes.byteLength < 2) {
			return;
		}

		const buffer = decodePcmToAudioBuffer(bytes, outputContext, 24000, 1);
		const source = outputContext.createBufferSource();
		source.buffer = buffer;
		source.connect(outputGain);

		source.onended = () => {
			activeSourcesRef.current.delete(source);
		};

		const startAt = Math.max(nextStartTimeRef.current, outputContext.currentTime);
		source.start(startAt);
		nextStartTimeRef.current = startAt + buffer.duration;
		activeSourcesRef.current.add(source);
	}

	function handleLiveMessage(message: LiveServerMessage): void {
		const parts = message.serverContent?.modelTurn?.parts ?? [];
		for (const part of parts) {
			const inlineData = (part as { inlineData?: { data?: string; mimeType?: string } }).inlineData;
			if (!inlineData?.data) {
				continue;
			}
			if (!inlineData.mimeType?.includes("audio/pcm")) {
				continue;
			}

			enqueueAudio(inlineData.data);
		}

		if (message.serverContent?.interrupted) {
			clearPlaybackQueue();
		}

		const liveInputText = message.serverContent?.inputTranscription?.text;
		if (liveInputText) {
			setUserTranscript(liveInputText);
		}

		const liveOutputText = message.serverContent?.outputTranscription?.text;
		if (liveOutputText) {
			setAssistantTranscript(liveOutputText);
		}

		const text = message.text;
		if (text) {
			setAssistantTranscript(text);
		}
	}

	function stopRecording(): void {
		setIsRecording(false);

		if (scriptProcessorRef.current) {
			scriptProcessorRef.current.disconnect();
			scriptProcessorRef.current.onaudioprocess = null;
			scriptProcessorRef.current = null;
		}

		if (sourceNodeRef.current) {
			sourceNodeRef.current.disconnect();
			sourceNodeRef.current = null;
		}

		if (mediaStreamRef.current) {
			for (const track of mediaStreamRef.current.getTracks()) {
				track.stop();
			}
			mediaStreamRef.current = null;
		}

		try {
			sessionRef.current?.sendRealtimeInput({ audioStreamEnd: true });
		} catch {
			// no-op
		}
	}

	async function startRecording(): Promise<void> {
		if (!sessionRef.current || connectionState !== "connected") {
			setErrorText("Connect to Gemini Live before enabling the microphone.");
			return;
		}

		try {
			await ensureAudioGraph();
			const inputContext = inputContextRef.current;
			const inputGain = inputGainRef.current;
			if (!inputContext || !inputGain) {
				throw new Error("Audio context is unavailable.");
			}

			const mediaStream = await navigator.mediaDevices.getUserMedia({
				audio: true,
				video: false,
			});

			const sourceNode = inputContext.createMediaStreamSource(mediaStream);
			const scriptProcessor = inputContext.createScriptProcessor(2048, 1, 1);

			scriptProcessor.onaudioprocess = (event) => {
				const outputChannel = event.outputBuffer.getChannelData(0);
				outputChannel.fill(0);

				if (!isRecordingRef.current || !sessionRef.current) {
					return;
				}

				const inputChannel = event.inputBuffer.getChannelData(0);
				sessionRef.current.sendRealtimeInput({
					media: float32ToPcmBlob(inputChannel),
				});
			};

			sourceNode.connect(inputGain);
			sourceNode.connect(scriptProcessor);
			scriptProcessor.connect(inputContext.destination);

			mediaStreamRef.current = mediaStream;
			sourceNodeRef.current = sourceNode;
			scriptProcessorRef.current = scriptProcessor;

			setErrorText("");
			setStatusText("Mic active. Speak naturally.");
			setIsRecording(true);
		} catch (error) {
			setErrorText(error instanceof Error ? error.message : "Could not start microphone capture.");
			setStatusText("Microphone unavailable.");
			stopRecording();
		}
	}

	async function connectSession(): Promise<void> {
		if (connectionState === "connecting") {
			return;
		}

		setConnectionState("connecting");
		setErrorText("");
		setStatusText("Requesting a short-lived Gemini Live token...");
		setAssistantTranscript("");
		setUserTranscript("");

		try {
			await ensureAudioGraph();

			const tokenResponse = await fetch("/api/live/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ model: selectedModel }),
			});

			if (!tokenResponse.ok) {
				const payload = (await tokenResponse.json().catch(() => null)) as { error?: string } | null;
				throw new Error(payload?.error || "Could not mint a Gemini Live token.");
			}

			const payload = (await tokenResponse.json()) as LiveTokenResponse;
			if (!payload.token) {
				throw new Error("Live token is missing from server response.");
			}

			const liveClient = new GoogleGenAI({
				apiKey: payload.token,
				apiVersion: "v1alpha",
			});

			const connectWithVoice = async (voiceName: string) =>
				liveClient.live.connect({
					model: payload.model,
					callbacks: {
						onopen: () => {
							setConnectionState("connected");
							setStatusText("Connected. Press Start Mic to talk.");
							setErrorText("");
						},
						onmessage: (message) => {
							handleLiveMessage(message);
						},
						onerror: (event) => {
							setConnectionState("error");
							setErrorText(event.message || "Live socket error.");
							setStatusText("Live connection encountered an error.");
						},
						onclose: () => {
							setConnectionState((prev) => (prev === "error" ? "error" : "idle"));
							setStatusText("Disconnected.");
							stopRecording();
							clearPlaybackQueue();
						},
					},
					config: {
						responseModalities: [Modality.AUDIO],
						speechConfig: {
							voiceConfig: {
								prebuiltVoiceConfig: {
									voiceName,
								},
							},
						},
						tools: [{ googleSearch: {} }],
						systemInstruction: {
							parts: [{ text: LIVE_SYSTEM_PROMPT }],
						},
					},
				});

			let liveSession: Session;
			try {
				liveSession = await connectWithVoice(selectedVoice);
			} catch (primaryError) {
				if (selectedVoice !== "Orus") {
					setStatusText("Retrying with voice Orus...");
					liveSession = await connectWithVoice("Orus");
					setSelectedVoice("Orus");
				} else {
					throw primaryError;
				}
			}

			sessionRef.current = liveSession;
			setSelectedModel(payload.model);
		} catch (error) {
			setConnectionState("error");
			setStatusText("Unable to connect.");
			setErrorText(error instanceof Error ? error.message : "Unknown connection error.");
		}
	}

	function disconnectSession(): void {
		stopRecording();
		clearPlaybackQueue();

		if (sessionRef.current) {
			try {
				sessionRef.current.close();
			} catch {
				// no-op
			}
			sessionRef.current = null;
		}

		setConnectionState("idle");
		setStatusText("Disconnected.");
	}

	function sendTextPrompt(event: React.FormEvent<HTMLFormElement>): void {
		event.preventDefault();

		const trimmed = textPrompt.trim();
		if (!trimmed || !sessionRef.current || connectionState !== "connected") {
			return;
		}

		sessionRef.current.sendClientContent({
			turns: trimmed,
			turnComplete: true,
		});
		setTextPrompt("");
		setStatusText("Text sent to the live session.");
	}

	useEffect(() => {
		return () => {
			disconnectSession();
			if (inputContextRef.current && inputContextRef.current.state !== "closed") {
				void inputContextRef.current.close();
			}
			if (outputContextRef.current && outputContextRef.current.state !== "closed") {
				void outputContextRef.current.close();
			}
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const isConnected = connectionState === "connected";
	const connectionBadgeClass =
		connectionState === "connected"
			? "border-emerald-400/50 text-emerald-200 bg-emerald-500/15"
			: connectionState === "connecting"
				? "border-cyan-400/50 text-cyan-100 bg-cyan-500/15"
				: connectionState === "error"
					? "border-red-400/50 text-red-100 bg-red-500/20"
					: "border-zinc-500/50 text-zinc-200 bg-zinc-800/50";

	return (
		<div className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-16 left-[8%] h-56 w-56 rounded-full bg-cyan-500/12 blur-3xl" />
				<div className="absolute top-[35%] right-[12%] h-72 w-72 rounded-full bg-orange-400/10 blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-500/10 blur-3xl" />
			</div>

			<div className="relative grid gap-6 lg:grid-cols-[1.4fr_1fr]">
				<section className="relative overflow-hidden rounded-3xl border border-white/15 bg-black/35 p-4 backdrop-blur-xl sm:p-6">
					<div className="mb-4 flex items-center justify-between gap-3">
						<h1 className="font-racing text-2xl tracking-wide text-white sm:text-3xl">
							AlfieAI Live Studio
						</h1>
						<span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${connectionBadgeClass}`}>
							{connectionState}
						</span>
					</div>

					<p className="mb-4 text-sm text-zinc-200 sm:text-base">
						React-native Gemini Live experience with realtime voice, animated motion canvas, and configurable voice output.
					</p>

					<div className="relative h-[330px] overflow-hidden rounded-2xl border border-white/10 bg-slate-950/70 sm:h-[430px]">
						<canvas ref={canvasRef} className="h-full w-full" />
						<div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-white/10 bg-black/40 px-4 py-3 backdrop-blur">
							<p className="font-mono text-xs uppercase tracking-[0.24em] text-cyan-200/90">Live Signal</p>
							<p className="mt-1 text-sm text-zinc-100">{statusText}</p>
							{errorText ? <p className="mt-1 text-xs text-red-200">{errorText}</p> : null}
						</div>
					</div>

					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-cyan-300/20 bg-cyan-500/10 p-3">
							<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-cyan-100/80">You said</p>
							<p className="min-h-[48px] text-sm text-cyan-50/95">{userTranscript || "Listening for speech..."}</p>
						</div>
						<div className="rounded-2xl border border-orange-300/20 bg-orange-500/10 p-3">
							<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-orange-100/85">Alfie says</p>
							<p className="min-h-[48px] text-sm text-orange-50/95">{assistantTranscript || "Alfie’s response appears here."}</p>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-white/15 bg-zinc-950/60 p-4 backdrop-blur-xl sm:p-6">
					<h2 className="font-big text-xl text-white">Session Controls</h2>
					<p className="mt-1 text-sm text-zinc-300">Use Connect first, then Start Mic for realtime voice turn-taking.</p>

					<div className="mt-5 space-y-4">
						<label className="block">
							<span className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-300">Live Model</span>
							<select
								className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
								value={selectedModel}
								onChange={(event) => setSelectedModel(event.target.value)}
								disabled={connectionState === "connecting" || isConnected}
							>
								{LIVE_MODELS.map((model) => (
									<option key={model} value={model}>
										{model}
									</option>
								))}
							</select>
						</label>

						<label className="block">
							<span className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-300">Voice</span>
							<select
								className="w-full rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-orange-300"
								value={selectedVoice}
								onChange={(event) => setSelectedVoice(event.target.value)}
								disabled={connectionState === "connecting" || isConnected}
							>
								{VOICE_CHOICES.map((voice) => (
									<option key={voice} value={voice}>
										{voice}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="mt-5 grid gap-3">
						<button
							type="button"
							onClick={() => {
								if (isConnected || connectionState === "connecting") {
									disconnectSession();
									return;
								}
								void connectSession();
							}}
							className="rounded-xl border border-cyan-300/45 bg-cyan-500/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-cyan-100 transition hover:bg-cyan-500/25 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={connectionState === "connecting"}
						>
							{isConnected || connectionState === "connecting" ? "Disconnect" : "Connect"}
						</button>

						<button
							type="button"
							onClick={() => {
								if (isRecording) {
									stopRecording();
									setStatusText("Mic paused.");
									return;
								}
								void startRecording();
							}}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300/45 bg-orange-500/15 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-orange-50 transition hover:bg-orange-500/25 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={!isConnected}
						>
							<FaMicrophone />
							{isRecording ? "Stop Mic" : "Start Mic"}
						</button>
					</div>

					<form className="mt-5" onSubmit={sendTextPrompt}>
						<label className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-300">Optional Text Prompt</label>
						<textarea
							className="min-h-24 w-full resize-y rounded-xl border border-white/15 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
							placeholder="Ask Alfie something without using the mic..."
							value={textPrompt}
							onChange={(event) => setTextPrompt(event.target.value)}
							disabled={!isConnected}
						/>
						<button
							type="submit"
							className="mt-3 w-full rounded-xl border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={!isConnected || !textPrompt.trim()}
						>
							Send Prompt
						</button>
					</form>

					<p className="mt-5 text-xs leading-relaxed text-zinc-400">
						Voice availability can vary by API/model version. If a selected voice is unavailable, this UI automatically retries with Orus.
					</p>
				</section>
			</div>
		</div>
	);
}
