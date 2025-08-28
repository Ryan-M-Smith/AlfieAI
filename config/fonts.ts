import {
	Dancing_Script as FontCursive,
	Fira_Code as FontMono,
	Inter as FontSans,
	Schoolbell as FontChalkboard,
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

export const fontChalkboard = FontChalkboard({
	subsets: ["latin"],
	variable: "--font-chalkboard",
	weight: "400"
});