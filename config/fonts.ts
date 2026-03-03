import {
	Fira_Code as FontMono,
	Inter as FontSans,
	Dancing_Script as FontCursive,
	Black_Ops_One as FontBig,
	Modak as FontBubble,
	Racing_Sans_One as FontRacing
} from "next/font/google";

export const fontSans = FontSans({
	subsets: ["latin"],
	variable: "--font-sans",
});

export const fontMono = FontMono({
	subsets: ["latin"],
	variable: "--font-mono",
});

export const fontCursive = FontCursive({
	subsets: ["latin"],
	variable: "--font-cursive",
});

export const fontBig = FontBig({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-big"
});

export const fontBubble = FontBubble({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-bubble"
});

export const fontRacing = FontRacing({
	subsets: ["latin"],
	weight: "400",
	variable: "--font-racing"
});