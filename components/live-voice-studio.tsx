"use client";

import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone } from "react-icons/fa";

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

const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_BASE_MS = 1200;

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
	const selectedVoiceRef = useRef(selectedVoice);
	const [isRecording, setIsRecording] = useState(false);
	const [userTranscript, setUserTranscript] = useState("");
	const [assistantTranscript, setAssistantTranscript] = useState("");

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
	const manualDisconnectRef = useRef(false);
	const shouldResumeRecordingRef = useRef(false);
	const reconnectAttemptsRef = useRef(0);
	const reconnectTimerRef = useRef<number | null>(null);
	const connectingRef = useRef(false);
	const lastOpenAtRef = useRef<number | null>(null);

	useEffect(() => {
		isRecordingRef.current = isRecording;
	}, [isRecording]);

	useEffect(() => {
		selectedVoiceRef.current = selectedVoice;
	}, [selectedVoice]);

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
			bg.addColorStop(0, "#180608");
			bg.addColorStop(0.45, "#22080c");
			bg.addColorStop(1, "#0f0305");
			context.fillStyle = bg;
			context.fillRect(0, 0, width, height);

			const glowRadius = Math.min(width, height) * (0.2 + outputLevel * 0.12);
			const glow = context.createRadialGradient(centerX, centerY, 0, centerX, centerY, glowRadius * 2.3);
			glow.addColorStop(0, `rgba(245, 64, 79, ${0.28 + outputLevel * 0.35})`);
			glow.addColorStop(0.55, `rgba(255, 120, 60, ${0.18 + inputLevel * 0.22})`);
			glow.addColorStop(1, "rgba(20, 6, 8, 0)");
			context.fillStyle = glow;
			context.fillRect(0, 0, width, height);

			for (let ring = 0; ring < 4; ring += 1) {
				const phase = t * (0.6 + ring * 0.12);
				const ringRadius = glowRadius * (0.45 + ring * 0.4 + inputLevel * 0.2);
				context.beginPath();
				context.lineWidth = Math.max(1, dpr * (1.25 - ring * 0.18));
				context.strokeStyle = `rgba(${ring % 2 === 0 ? "255, 100, 120" : "255, 150, 95"}, ${0.3 - ring * 0.05})`;
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
			context.strokeStyle = "rgba(255, 132, 146, 0.48)";
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
			context.strokeStyle = "rgba(255, 173, 112, 0.42)";
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

	function clearReconnectTimer(): void {
		if (reconnectTimerRef.current) {
			window.clearTimeout(reconnectTimerRef.current);
			reconnectTimerRef.current = null;
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

	async function connectSession(options?: { autoStartRecording?: boolean }): Promise<boolean> {
		if (connectionState === "connected" && sessionRef.current) {
			return true;
		}

		if (connectingRef.current) {
			return false;
		}

		connectingRef.current = true;
		manualDisconnectRef.current = false;
		clearReconnectTimer();
		setConnectionState("connecting");
		setErrorText("");
		setStatusText("Requesting a short-lived Gemini Live token...");

		try {
			await ensureAudioGraph();

			const tokenResponse = await fetch("/api/live/token", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
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
							lastOpenAtRef.current = Date.now();
							setConnectionState("connected");
							setStatusText("Connected. Ready for voice.");
							setErrorText("");
						},
						onmessage: (message) => {
							handleLiveMessage(message);
						},
						onerror: (event) => {
							setErrorText(event.message || "Live socket error.");
							setStatusText("Socket issue detected. Waiting for reconnect...");
						},
						onclose: () => {
							const wasManual = manualDisconnectRef.current;
							const openDurationMs = lastOpenAtRef.current ? Date.now() - lastOpenAtRef.current : 0;
							const wasStableOpen = openDurationMs >= 10_000;
							const shouldAutoReconnect = shouldResumeRecordingRef.current || isRecordingRef.current;
							sessionRef.current = null;
							stopRecording();
							clearPlaybackQueue();

							if (wasManual) {
								manualDisconnectRef.current = false;
								setConnectionState("idle");
								setStatusText("Disconnected.");
								return;
							}

							if (!shouldAutoReconnect) {
								setConnectionState("idle");
								setStatusText("Disconnected. Press Start to reconnect.");
								return;
							}

							if (wasStableOpen) {
								reconnectAttemptsRef.current = 0;
							}

							if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
								setConnectionState("error");
								setStatusText("Connection lost.");
								setErrorText("Could not reconnect. Please press Connect.");
								return;
							}

							reconnectAttemptsRef.current += 1;
							const delay = RECONNECT_BASE_MS * reconnectAttemptsRef.current;
							setConnectionState("connecting");
							setStatusText(`Reconnecting (${reconnectAttemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})...`);

							clearReconnectTimer();
							reconnectTimerRef.current = window.setTimeout(() => {
								void connectSession({ autoStartRecording: shouldResumeRecordingRef.current });
							}, delay);
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
				liveSession = await connectWithVoice(selectedVoiceRef.current);
			} catch {
				if (selectedVoiceRef.current !== "Orus") {
					setStatusText("Selected voice unavailable. Retrying with Orus...");
					liveSession = await connectWithVoice("Orus");
					setSelectedVoice("Orus");
				} else {
					throw new Error("Failed to connect to Gemini Live.");
				}
			}

			sessionRef.current = liveSession;

			if (options?.autoStartRecording) {
				void startRecording();
			}

			return true;
		} catch (error) {
			setConnectionState("error");
			setStatusText("Unable to connect.");
			setErrorText(error instanceof Error ? error.message : "Unknown connection error.");
			return false;
		} finally {
			connectingRef.current = false;
		}
	}

	async function startRecording(): Promise<void> {
		shouldResumeRecordingRef.current = true;

		if (!sessionRef.current || connectionState !== "connected") {
			const connected = await connectSession({ autoStartRecording: false });
			if (!connected) {
				return;
			}
		}

		if (isRecordingRef.current) {
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
			shouldResumeRecordingRef.current = false;
			stopRecording();
		}
	}

	function disconnectSession(): void {
		clearReconnectTimer();
		manualDisconnectRef.current = true;
		shouldResumeRecordingRef.current = false;
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

	useEffect(() => {
		return () => {
			clearReconnectTimer();
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
	const isConnecting = connectionState === "connecting";
	const connectionBadgeClass =
		connectionState === "connected"
			? "border-red-300/70 text-red-100 bg-red-500/25"
			: connectionState === "connecting"
				? "border-amber-300/70 text-amber-100 bg-amber-500/25"
				: connectionState === "error"
					? "border-red-500/80 text-red-100 bg-red-900/45"
					: "border-zinc-500/50 text-zinc-200 bg-zinc-800/50";

	return (
		<div className="relative mx-auto w-full max-w-5xl px-4 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">
			<div className="pointer-events-none absolute inset-0 overflow-hidden">
				<div className="absolute -top-16 left-[8%] h-56 w-56 rounded-full bg-red-500/20 blur-3xl" />
				<div className="absolute top-[35%] right-[12%] h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
				<div className="absolute bottom-0 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-red-900/30 blur-3xl" />
			</div>

			<div className="relative grid gap-6 lg:grid-cols-[1.35fr_0.95fr]">
				<section className="relative overflow-hidden rounded-3xl border border-red-300/20 bg-black/45 p-4 backdrop-blur-xl sm:p-6">
					<div className="mb-4 flex items-center justify-between gap-3">
						<h1 className="font-racing text-2xl tracking-wide text-white sm:text-3xl">
							Live Voice Visualizer
						</h1>
						<span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${connectionBadgeClass}`}>
							{connectionState}
						</span>
					</div>

					<p className="mb-4 text-sm text-zinc-200 sm:text-base">
						Clean live controls with realtime visual signal and transcription.
					</p>

					<div className="relative h-84 overflow-hidden rounded-2xl border border-red-300/20 bg-[#180709]/80 sm:h-112">
						<canvas ref={canvasRef} className="h-full w-full" />
						<div className="pointer-events-none absolute inset-x-4 bottom-4 rounded-xl border border-red-300/20 bg-black/45 px-4 py-3 backdrop-blur">
							<p className="font-mono text-xs uppercase tracking-[0.24em] text-red-200/90">Live Signal</p>
							<p className="mt-1 text-sm text-zinc-100">{statusText}</p>
							{errorText ? <p className="mt-1 text-xs text-red-200">{errorText}</p> : null}
						</div>
					</div>

					<div className="mt-4 grid gap-3 sm:grid-cols-2">
						<div className="rounded-2xl border border-red-300/20 bg-red-950/35 p-3">
							<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-red-100/85">You Said</p>
							<p className="min-h-12 text-sm text-red-50/95">{userTranscript || "Listening for speech..."}</p>
						</div>
						<div className="rounded-2xl border border-orange-300/20 bg-orange-950/30 p-3">
							<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-orange-100/85">Alfie Says</p>
							<p className="min-h-12 text-sm text-orange-50/95">{assistantTranscript || "Alfie response appears here."}</p>
						</div>
					</div>
				</section>

				<section className="rounded-3xl border border-red-300/20 bg-zinc-950/65 p-4 backdrop-blur-xl sm:p-6">
					<h2 className="font-big text-xl text-white">Controls</h2>
					<p className="mt-1 text-sm text-zinc-300">Connect once, then use Start, Pause, and Stop.</p>

					<div className="mt-5 space-y-4">
						<label className="block">
							<span className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-300">Voice</span>
							<select
								className="w-full rounded-xl border border-red-300/25 bg-black/50 px-3 py-2 text-sm text-white outline-none transition focus:border-red-300"
								value={selectedVoice}
								onChange={(event) => setSelectedVoice(event.target.value)}
								disabled={isConnecting || isRecording}
							>
								{VOICE_CHOICES.map((voice) => (
									<option key={voice} value={voice}>
										{voice}
									</option>
								))}
							</select>
						</label>
					</div>

					<div className="mt-5 grid gap-3 sm:grid-cols-2">
						<button
							type="button"
							onClick={() => {
								if (isConnected) {
									disconnectSession();
									return;
								}
								setAssistantTranscript("");
								setUserTranscript("");
								void connectSession({ autoStartRecording: false });
							}}
							className="rounded-xl border border-red-300/45 bg-red-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-600/30 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={isConnecting}
						>
							{isConnected ? "Disconnect" : isConnecting ? "Connecting" : "Connect"}
						</button>

						<button
							type="button"
							onClick={() => {
								void startRecording();
							}}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300/45 bg-orange-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-orange-50 transition hover:bg-orange-500/30 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={isRecording || isConnecting}
						>
							<FaMicrophone />
							Start
						</button>

						<button
							type="button"
							onClick={() => {
								shouldResumeRecordingRef.current = false;
								stopRecording();
								setStatusText("Paused.");
							}}
							className="rounded-xl border border-amber-300/40 bg-amber-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-50 transition hover:bg-amber-500/30 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={!isConnected || !isRecording}
						>
							Pause
						</button>

						<button
							type="button"
							onClick={() => {
								disconnectSession();
								setAssistantTranscript("");
								setUserTranscript("");
								setErrorText("");
								setStatusText("Stopped.");
							}}
							className="rounded-xl border border-zinc-300/30 bg-zinc-700/25 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100 transition hover:bg-zinc-600/35 disabled:cursor-not-allowed disabled:opacity-55"
							disabled={!isConnected && !isConnecting && !isRecording}
						>
							Stop
						</button>
					</div>

					<p className="mt-5 text-xs leading-relaxed text-zinc-400">
						If a connection drops, AlfieAI will attempt to reconnect automatically. If a selected voice is unavailable, it retries with Orus.
					</p>
				</section>
			</div>
		</div>
	);
}
