//
// Filename: route.ts
// Route: /api/email
// Copyright (c) 2025 Ryan Smith, Adithya Kommi
//

import { Resend } from 'resend';

import EmailTemplate from "@/components/email-template";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
	const props = await request.json();

	try {
		const { data, error } = await resend.emails.send({
			from: "AlfieAI <no-reply@mail.alfieai.fyi>",
			to: ["contact@mail.alfieai.fyi"],
			subject: `Contact Form Submission | ${props.subject}` || "Contact Form Submission",
			replyTo: props.email,
			react: EmailTemplate(props),
		});

		if (error) {
			return Response.json({ error }, { status: 500 });
		}

		return Response.json(data);
	}
	catch (error) {
		return Response.json({ error }, { status: 500 });
	}
}