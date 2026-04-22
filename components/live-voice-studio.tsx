"use client";

import { GoogleGenAI, Modality, type LiveServerMessage, type Session } from "@google/genai";
import { useEffect, useRef, useState } from "react";
import { FaMicrophone, FaPause, FaPlug, FaStop } from "react-icons/fa";

const MODEL_CANDIDATES = [
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
	const [statusText, setStatusText] = useState("Tap Connect to start a live session.");
	const [errorText, setErrorText] = useState("");
	const [selectedVoice, setSelectedVoice] = useState<string>("Orus");
	const [isRecording, setIsRecording] = useState(false);
	const [userTranscript, setUserTranscript] = useState("");
	const [assistantTranscript, setAssistantTranscript] = useState("");

	const selectedVoiceRef = useRef(selectedVoice);
	const isRecordingRef = useRef(false);
	const canvasRef = useRef<HTMLCanvasElement | null>(null);
	const animationFrameRef = useRef<number | null>(null);

	const sessionRef = useRef<Session | null>(null);
	const mediaStreamRef = useRef<MediaStream | null>(null);
	const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
	const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);

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
		selectedVoiceRef.current = selectedVoice;
	}, [selectedVoice]);

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

			context.clearRect(0, 0, width, height);

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
			const cx = width / 2;
			const cy = height / 2;
			const t = time * 0.001;
			const baseRadius = Math.min(width, height) * 0.19;
			const pulseRadius = baseRadius * (1 + outputLevel * 0.18);

			const aura = context.createRadialGradient(cx, cy, 0, cx, cy, pulseRadius * 2.3);
			aura.addColorStop(0, `rgba(255, 78, 92, ${0.32 + outputLevel * 0.24})`);
			aura.addColorStop(0.55, `rgba(255, 126, 58, ${0.12 + inputLevel * 0.2})`);
			aura.addColorStop(1, "rgba(17, 2, 5, 0)");
			context.fillStyle = aura;
			context.fillRect(0, 0, width, height);

			context.beginPath();
			for (let i = 0; i <= 180; i += 1) {
				const p = (i / 180) * Math.PI * 2;
				const wobble =
					1 +
					Math.sin(p * 3 + t * 1.5) * (0.05 + inputLevel * 0.08) +
					Math.cos(p * 4 - t * 1.2) * (0.03 + outputLevel * 0.06);
				const r = pulseRadius * wobble;
				const x = cx + Math.cos(p) * r;
				const y = cy + Math.sin(p) * r;
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.closePath();

			const blob = context.createRadialGradient(
				cx - pulseRadius * 0.34,
				cy - pulseRadius * 0.34,
				pulseRadius * 0.12,
				cx,
				cy,
				pulseRadius,
			);
			blob.addColorStop(0, "rgba(255, 210, 210, 0.95)");
			blob.addColorStop(0.2, "rgba(255, 122, 140, 0.85)");
			blob.addColorStop(0.58, "rgba(192, 34, 61, 0.86)");
			blob.addColorStop(1, "rgba(85, 9, 25, 0.9)");

			context.fillStyle = blob;
			context.fill();
			context.lineWidth = Math.max(1.5, 2.5 * dpr);
			context.strokeStyle = "rgba(255, 170, 180, 0.4)";
			context.stroke();

			context.save();
			context.translate(cx, cy);
			context.rotate(t * 0.32);
			context.beginPath();
			context.ellipse(0, 0, pulseRadius * 1.23, pulseRadius * 0.48, 0, 0, Math.PI * 2);
			context.strokeStyle = "rgba(255, 132, 148, 0.34)";
			context.lineWidth = Math.max(1, 1.8 * dpr);
			context.stroke();
			context.restore();

			context.beginPath();
			for (let i = 0; i < outputData.length; i += 1) {
				const x = (i / (outputData.length - 1)) * width;
				const y = cy + (outputData[i] / 255 - 0.5) * height * 0.16;
				if (i === 0) {
					context.moveTo(x, y);
				} else {
					context.lineTo(x, y);
				}
			}
			context.lineWidth = Math.max(1, 1.6 * dpr);
			context.strokeStyle = "rgba(255, 162, 112, 0.42)";
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
			if (!inlineData?.data || !inlineData.mimeType?.includes("audio/pcm")) {
				continue;
			}
			enqueueAudio(inlineData.data);
		}

		if (message.serverContent?.interrupted) {
			clearPlaybackQueue();
		}

		if (message.serverContent?.inputTranscription?.text) {
			setUserTranscript(message.serverContent.inputTranscription.text);
		}
		if (message.serverContent?.outputTranscription?.text) {
			setAssistantTranscript(message.serverContent.outputTranscription.text);
		}
		if (message.text) {
			setAssistantTranscript(message.text);
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

	async function requestLiveToken(model: string): Promise<LiveTokenResponse> {
		const tokenResponse = await fetch("/api/live/token", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ model }),
		});

		if (!tokenResponse.ok) {
			const payload = (await tokenResponse.json().catch(() => null)) as { error?: string } | null;
			throw new Error(payload?.error || `Could not mint token for ${model}.`);
		}

		const payload = (await tokenResponse.json()) as LiveTokenResponse;
		if (!payload.token) {
			throw new Error("Live token is missing from server response.");
		}

		return payload;
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
		setStatusText("Connecting to Gemini Live...");

		try {
			await ensureAudioGraph();

			const voicesToTry = selectedVoiceRef.current === "Orus"
				? ["Orus"]
				: [selectedVoiceRef.current, "Orus"];
			const attemptErrors: string[] = [];

			for (const modelCandidate of MODEL_CANDIDATES) {
				let tokenPayload: LiveTokenResponse;
				try {
					tokenPayload = await requestLiveToken(modelCandidate);
				} catch (tokenError) {
					attemptErrors.push(`${modelCandidate}: ${tokenError instanceof Error ? tokenError.message : "token error"}`);
					continue;
				}

				const liveClient = new GoogleGenAI({
					apiKey: tokenPayload.token,
					apiVersion: "v1alpha",
				});

				for (const voiceName of voicesToTry) {
					try {
						const liveSession = await liveClient.live.connect({
							model: tokenPayload.model,
							callbacks: {
								onopen: () => {
									lastOpenAtRef.current = Date.now();
									reconnectAttemptsRef.current = 0;
									setConnectionState("connected");
									setStatusText("Connected. Ready.");
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
										setErrorText("Could not reconnect. Press Connect.");
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
								systemInstruction: {
									parts: [{ text: LIVE_SYSTEM_PROMPT }],
								},
							},
						});

						sessionRef.current = liveSession;
						if (voiceName !== selectedVoiceRef.current) {
							setSelectedVoice(voiceName);
						}
						setStatusText(`Connected on ${tokenPayload.model}`);

						if (options?.autoStartRecording) {
							void startRecording();
						}

						return true;
					} catch (connectError) {
						attemptErrors.push(`${tokenPayload.model}/${voiceName}: ${connectError instanceof Error ? connectError.message : "connect error"}`);
					}
				}
			}

			throw new Error(`Live connect failed. ${attemptErrors.slice(-2).join(" | ")}`);
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

			const mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
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
	const statusChip =
		connectionState === "connected"
			? "border-emerald-300/60 text-emerald-100 bg-emerald-500/20"
			: connectionState === "connecting"
				? "border-amber-300/60 text-amber-100 bg-amber-500/20"
				: connectionState === "error"
					? "border-red-300/70 text-red-100 bg-red-900/50"
					: "border-zinc-400/40 text-zinc-200 bg-zinc-800/60";

	return (
		<div className="relative mx-auto w-full max-w-4xl px-4 pb-12 pt-28 sm:px-6 sm:pt-32">
			<div
				className="pointer-events-none absolute inset-0 opacity-70"
				style={{
					background:
						"radial-gradient(800px circle at 18% 18%, rgba(239,68,68,0.26), transparent 48%), radial-gradient(700px circle at 82% 10%, rgba(249,115,22,0.2), transparent 42%)",
				}}
			/>

			<section className="relative rounded-3xl border border-red-300/20 bg-black/40 p-4 shadow-[0_0_0_1px_rgba(255,100,120,0.08),0_30px_70px_rgba(90,0,12,0.45)] backdrop-blur-xl sm:p-6">
				<div className="flex items-center justify-between gap-3">
					<h1 className="font-racing text-2xl tracking-wide text-white sm:text-3xl">Live Voice</h1>
					<span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest ${statusChip}`}>
						{connectionState}
					</span>
				</div>

				<div className="mx-auto mt-4 w-full max-w-xl">
					<div className="relative aspect-square overflow-hidden rounded-[2rem] border border-red-300/25 bg-[#0f0204]/75">
						<canvas ref={canvasRef} className="h-full w-full" />
					</div>

					<p className="mt-3 text-center text-sm text-zinc-200">{statusText}</p>
					{errorText ? <p className="mt-1 text-center text-xs text-red-200">{errorText}</p> : null}

					<div className="mt-4">
						<label className="mb-1 block text-xs uppercase tracking-[0.18em] text-zinc-300">Voice</label>
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
					</div>

					<div className="mt-4 grid grid-cols-2 gap-3">
						<button
							type="button"
							onClick={() => {
								if (isConnected) {
									disconnectSession();
									return;
								}
								void connectSession({ autoStartRecording: false });
							}}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-300/40 bg-red-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-red-100 transition hover:bg-red-600/30 disabled:opacity-55"
							disabled={isConnecting}
						>
							<FaPlug />
							{isConnected ? "Disconnect" : isConnecting ? "Connecting" : "Connect"}
						</button>

						<button
							type="button"
							onClick={() => {
								void startRecording();
							}}
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-orange-300/40 bg-orange-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-orange-50 transition hover:bg-orange-500/30 disabled:opacity-55"
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
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-amber-300/40 bg-amber-600/20 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-amber-50 transition hover:bg-amber-500/30 disabled:opacity-55"
							disabled={!isConnected || !isRecording}
						>
							<FaPause />
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
							className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300/30 bg-zinc-700/25 px-4 py-3 text-sm font-semibold uppercase tracking-[0.14em] text-zinc-100 transition hover:bg-zinc-600/35 disabled:opacity-55"
							disabled={!isConnected && !isConnecting && !isRecording}
						>
							<FaStop />
							Stop
						</button>
					</div>
				</div>

				<div className="mt-6 grid gap-3 sm:grid-cols-2">
					<div className="rounded-2xl border border-red-300/20 bg-red-950/35 p-3">
						<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-red-100/85">You Said</p>
						<p className="min-h-12 text-sm text-red-50/95">{userTranscript || "Listening for speech..."}</p>
					</div>
					<div className="rounded-2xl border border-orange-300/20 bg-orange-950/30 p-3">
						<p className="mb-1 text-[11px] uppercase tracking-[0.2em] text-orange-100/85">Alfie Says</p>
						<p className="min-h-12 text-sm text-orange-50/95">{assistantTranscript || "Response appears here..."}</p>
					</div>
				</div>
			</section>
		</div>
	);
}
